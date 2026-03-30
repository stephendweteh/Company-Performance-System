<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected function canAssign($user)
    {
        return $user && in_array($user->role, ['employer', 'manager', 'super_admin']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::query();

        if ($user && $user->role === 'employee') {
            $query->where('assigned_to', $user->id);
        } elseif ($user && in_array($user->role, ['manager', 'employer'])) {
            $query->where(function ($taskQuery) use ($user) {
                $taskQuery->where('assigned_to', $user->id)
                    ->orWhere('created_by', $user->id);
            });
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

        if ($user && $user->role === 'employee') {
            abort_unless($task->assigned_to === $user->id, 403, 'Forbidden');

            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,pending_review,completed',
            ]);
        } else {
            abort_unless($this->canAssign($user), 403, 'Forbidden');

            $validated = $request->validate([
                'title' => 'string|max:255',
                'description' => 'string',
                'status' => 'in:pending,in_progress,pending_review,completed',
                'priority' => 'in:low,medium,high,critical',
                'assigned_to' => 'exists:users,id',
            ]);

            if (array_key_exists('status', $validated)
                && $task->creator
                && $task->creator->role === 'manager'
                && $task->assignee
                && $task->assignee->role === 'employer'
            ) {
                if ($user->role === 'employer' && $task->assigned_to === $user->id && $validated['status'] === Task::STATUS_COMPLETED) {
                    return response()->json(['message' => 'Employer cannot complete this task directly. Submit it for review.'], 422);
                }

                if ($validated['status'] === Task::STATUS_COMPLETED && $user->role !== 'manager') {
                    return response()->json(['message' => 'Only the manager can complete and review this task.'], 403);
                }

                if ($user->role === 'employer' && $task->assigned_to === $user->id) {
                    $allowedEmployerStatuses = [Task::STATUS_PENDING, Task::STATUS_IN_PROGRESS, Task::STATUS_PENDING_REVIEW];
                    if (!in_array($validated['status'], $allowedEmployerStatuses, true)) {
                        return response()->json(['message' => 'Employer can only update this task to pending, in progress, or pending review.'], 422);
                    }
                }
            }
        }

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task)
    {
        abort_unless($this->canAssign($request->user()), 403, 'Forbidden');

        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }
}
