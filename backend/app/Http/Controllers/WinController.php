<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Win;
use App\Models\User;
use App\Services\NotificationDispatchService;
use Illuminate\Http\Request;

class WinController extends Controller
{
    protected $notificationDispatch;

    public function __construct(NotificationDispatchService $notificationDispatch)
    {
        $this->notificationDispatch = $notificationDispatch;
    }

    public function index(Request $request)
    {
        $currentUser = $request->user();
        abort_unless($currentUser, 401, 'Unauthorized');

        $query = Win::with('employee.company', 'employee.team', 'task', 'reviewer', 'responder');

        if ($currentUser->role === 'employee') {
            $query->where('employee_id', $currentUser->id);
        } elseif ($currentUser->role === 'employer') {
            $query->where(function ($builder) use ($currentUser) {
                $builder->where('employee_id', $currentUser->id)
                    ->orWhereHas('employee', function ($employeeBuilder) use ($currentUser) {
                        $employeeBuilder->where('role', 'employee')
                            ->where('company_id', $currentUser->company_id);
                    });
            });
        } elseif ($currentUser->role === 'manager') {
            $query->whereHas('employee', function ($builder) {
                $builder->where('role', 'employer');
            });
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        abort_unless($currentUser && in_array($currentUser->role, ['employee', 'employer']), 403, 'Forbidden');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'task_id' => 'nullable|exists:tasks,id',
        ]);

        $reviewerId = null;
        if ($currentUser->role === 'employee') {
            $employer = User::where('role', 'employer')
                ->where('company_id', $currentUser->company_id)
                ->orderBy('id')
                ->first();

            if (!$employer) {
                return response()->json(['message' => 'No employer found for your company.'], 422);
            }

            $reviewerId = $employer->id;
        }

        if ($currentUser->role === 'employer') {
            $manager = User::where('role', 'manager')->orderBy('id')->first();

            if (!$manager) {
                return response()->json(['message' => 'No manager found to review employer achievements.'], 422);
            }

            $reviewerId = $manager->id;
        }

        $win = Win::create([
            ...$validated,
            'employee_id' => $currentUser->id,
            'reviewer_id' => $reviewerId,
            'status' => Win::STATUS_SUBMITTED,
        ]);

        $this->notificationDispatch->send(
            $win->reviewer,
            ($currentUser->name ?? 'A user') . ' recorded an achievement: ' . $win->title,
            Notification::TYPE_WIN_RECORDED,
            $win->id,
            $currentUser->id
        );

        return response()->json($win->load('employee', 'task', 'reviewer'), 201);
    }

    public function show(Win $win)
    {
        return response()->json($win->load('employee.company', 'employee.team', 'task', 'reviewer', 'responder'));
    }

    public function update(Request $request, Win $win)
    {
        $currentUser = $request->user();
        abort_unless($currentUser, 401, 'Unauthorized');

        $validated = $request->validate([
            'status' => 'nullable|in:reviewed,approved,needs_revision',
            'score' => 'nullable|integer|min:1|max:5',
            'response_comment' => 'nullable|string|max:2000',
        ]);

        $win->load('employee');

        $canRespond = false;
        if ($currentUser->role === 'employer') {
            $canRespond = $win->employee
                && $win->employee->role === 'employee'
                && $win->employee->company_id === $currentUser->company_id;
        } elseif ($currentUser->role === 'manager') {
            $canRespond = $win->employee && $win->employee->role === 'employer';
        } elseif ($currentUser->role === 'super_admin') {
            $canRespond = true;
        }

        abort_unless($canRespond, 403, 'Forbidden');

        if (!array_key_exists('status', $validated) && !array_key_exists('score', $validated) && !array_key_exists('response_comment', $validated)) {
            return response()->json(['message' => 'Please provide status, score, or response comment.'], 422);
        }

        $win->update([
            'status' => $validated['status'] ?? ($win->status === Win::STATUS_SUBMITTED ? Win::STATUS_REVIEWED : $win->status),
            'score' => $validated['score'] ?? $win->score,
            'response_comment' => $validated['response_comment'] ?? $win->response_comment,
            'responded_at' => now(),
            'response_by' => $currentUser->id,
        ]);

        $statusLabel = str_replace('_', ' ', $validated['status'] ?? $win->status);
        $scoreSuffix = array_key_exists('score', $validated) && $validated['score']
            ? ' Score: ' . $validated['score'] . '/5.'
            : '';

        $this->notificationDispatch->send(
            $win->employee,
            ($currentUser->name ?? 'A reviewer') . ' responded to your achievement "' . $win->title . '" with status ' . $statusLabel . '.' . $scoreSuffix,
            Notification::TYPE_WIN_RECORDED,
            $win->id,
            $currentUser->id
        );

        return response()->json($win->fresh()->load('employee', 'task', 'reviewer', 'responder'));
    }

    public function destroy(Win $win)
    {
        $win->delete();
        return response()->json(['message' => 'Win deleted']);
    }
}
