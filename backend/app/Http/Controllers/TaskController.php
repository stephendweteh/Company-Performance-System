<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Task;
use App\Models\User;
use App\Services\NotificationDispatchService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected $notificationDispatch;

    public function __construct(NotificationDispatchService $notificationDispatch)
    {
        $this->notificationDispatch = $notificationDispatch;
    }

    protected function canAssign($user)
    {
        return $user && in_array($user->role, ['employer', 'manager', 'super_admin']);
    }

    protected function canRespondToTask($user, Task $task)
    {
        if (!$user || (int) $task->assigned_to !== (int) $user->id) {
            return false;
        }

        $creatorRole = $task->creator?->role;

        if ($user->role === 'employer') {
            return in_array($creatorRole, ['manager', 'super_admin'], true) || !$creatorRole;
        }

        if ($user->role === 'employee') {
            return $creatorRole === 'employer' || !$creatorRole;
        }

        return false;
    }

    protected function canEmployerReviewTask($user, Task $task)
    {
        if (!$user || $user->role !== 'employer') {
            return false;
        }

        if ((int) $task->created_by !== (int) $user->id) {
            return false;
        }

        if ($task->assignee?->role !== 'employee') {
            return false;
        }

        return $task->status === Task::STATUS_PENDING_REVIEW;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::query();

        if ($user && $user->role === 'employee') {
            $query->where('assigned_to', $user->id);
        } elseif ($user && $user->role === 'employer') {
            $query->where(function ($taskQuery) use ($user) {
                $taskQuery->where('assigned_to', $user->id)
                    ->orWhere('created_by', $user->id);
            });
        } elseif ($user && $user->role === 'super_admin') {
            // Super admins can audit the full task pipeline.
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        if ($request->has('date')) {
            $date = $request->date;
            $query->whereDate('start_date', '<=', $date)
                  ->whereDate('due_date', '>=', $date);
        } elseif ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereDate('start_date', '<=', $request->end_date)
                ->whereDate('due_date', '>=', $request->start_date);
        }

        return response()->json($query->with('assignee', 'creator', 'team', 'attachments')->get());
    }

    public function store(Request $request)
    {
        abort_unless($this->canAssign($request->user()), 403, 'Forbidden');

        $creator = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'required|exists:users,id',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:start_date',
            'priority' => 'required|in:low,medium,high,critical',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240', // Max 10MB per file
        ]);

        $assignee = User::findOrFail($validated['assigned_to']);

        if ($creator->role === 'manager' && $assignee->role !== 'employer') {
            return response()->json(['message' => 'Managers can only assign tasks to employers.'], 422);
        }

        if ($creator->role === 'employer') {
            if ($assignee->role !== 'employee') {
                return response()->json(['message' => 'Employers can only assign tasks to employees.'], 422);
            }

            if ($assignee->company_id !== $creator->company_id) {
                return response()->json(['message' => 'Employers can only assign tasks to employees in their company.'], 422);
            }
        }

        $task = Task::create([
            ...$validated,
            'created_by' => auth()->id(),
            'status' => Task::STATUS_PENDING,
        ]);

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $filePath = $file->store('task-attachments', 'public');
                
                $task->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $this->notificationDispatch->send(
            $assignee,
            ($creator->name ?? 'A user') . ' assigned you a new task: ' . $task->title,
            Notification::TYPE_TASK_ASSIGNED,
            $task->id,
            $creator->id
        );

        return response()->json($task->load('assignee', 'creator', 'attachments'), 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load('assignee', 'creator', 'team', 'attachments'));
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();
        $task->loadMissing('creator', 'assignee');
        $originalStatus = $task->status;
        $isSubmissionUpdate = $this->canRespondToTask($user, $task);
        $isEmployerReviewUpdate = $this->canEmployerReviewTask($user, $task);

        if ($isSubmissionUpdate) {
            $validated = $request->validate([
                'status' => 'required|in:pending_review',
                'submission_text' => 'required|string|max:2000',
                'attachments' => 'nullable|array|max:5',
                'attachments.*' => 'file|max:10240',
            ]);

            if ($task->status === Task::STATUS_COMPLETED) {
                return response()->json(['message' => 'Completed tasks cannot be submitted again.'], 422);
            }
        } elseif ($isEmployerReviewUpdate) {
            $validated = $request->validate([
                'status' => 'required|in:in_progress,completed',
                'review_remark' => 'nullable|string|max:2000',
            ]);
        } else {
            abort_unless($user && in_array($user->role, ['manager', 'super_admin'], true), 403, 'Only managers can change task status manually.');

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'status' => 'sometimes|in:pending,in_progress,pending_review,completed',
                'priority' => 'sometimes|in:low,medium,high,critical',
                'assigned_to' => 'sometimes|exists:users,id',
                'review_remark' => 'nullable|string|max:2000',
            ]);
        }

        $taskData = collect($validated)->except(['attachments', 'submission_text'])->all();
        if (!empty($taskData)) {
            $task->update($taskData);
        }

        if (!empty($validated['submission_text'])) {
            $existingDescription = trim((string) $task->description);
            $submissionHeader = 'Submission Note (' . ($user->name ?? 'User') . ' - ' . now()->format('Y-m-d H:i') . ')';
            $submissionBody = trim($validated['submission_text']);

            $task->description = trim($existingDescription . "\n\n" . $submissionHeader . "\n" . $submissionBody);
            $task->save();
        }

        if (!empty($validated['review_remark'])) {
            $existingDescription = trim((string) $task->description);
            $reviewHeader = 'Review Remark (' . ($user->name ?? 'Reviewer') . ' - ' . now()->format('Y-m-d H:i') . ')';
            $reviewBody = trim($validated['review_remark']);

            $task->description = trim($existingDescription . "\n\n" . $reviewHeader . "\n" . $reviewBody);
            $task->save();
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $filePath = $file->store('task-attachments', 'public');

                $task->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        if (array_key_exists('status', $validated) && $validated['status'] !== $originalStatus) {
            if ($validated['status'] === Task::STATUS_PENDING_REVIEW) {
                $this->notificationDispatch->send(
                    $task->creator,
                    ($user->name ?? 'A user') . ' submitted task "' . $task->title . '" for review.',
                    Notification::TYPE_TASK_COMPLETED,
                    $task->id,
                    $user?->id
                );
            }

            if ($validated['status'] === Task::STATUS_COMPLETED) {
                $this->notificationDispatch->send(
                    $task->assignee,
                    'Your task "' . $task->title . '" was marked completed by ' . ($user->name ?? 'a reviewer') . '.',
                    Notification::TYPE_TASK_COMPLETED,
                    $task->id,
                    $user?->id
                );
            }
        }

        return response()->json($task->load('attachments'));
    }

    public function destroy(Request $request, Task $task)
    {
        abort_unless($this->canAssign($request->user()), 403, 'Forbidden');

        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }
}
