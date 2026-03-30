<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected function canAssign($user)
    {
        return $user && in_array($user->role, ['employer', 'manager', 'super_admin']);
    }

    public function index(Request $request)
    {
        $query = Task::query();

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
        }

        return response()->json($query->with('assignee', 'creator', 'team')->get());
    }

    public function store(Request $request)
    {
        abort_unless($this->canAssign($request->user()), 403, 'Forbidden');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'required|exists:users,id',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:start_date',
            'priority' => 'required|in:low,medium,high,critical',
        ]);

        $task = Task::create([
            ...$validated,
            'created_by' => auth()->id(),
            'status' => Task::STATUS_PENDING,
        ]);

        return response()->json($task->load('assignee', 'creator'), 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load('assignee', 'creator', 'team'));
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        if ($user && $user->role === 'employee') {
            abort_unless($task->assigned_to === $user->id, 403, 'Forbidden');

            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,completed',
            ]);
        } else {
            abort_unless($this->canAssign($user), 403, 'Forbidden');

            $validated = $request->validate([
                'title' => 'string|max:255',
                'description' => 'string',
                'status' => 'in:pending,in_progress,completed',
                'priority' => 'in:low,medium,high,critical',
                'assigned_to' => 'exists:users,id',
            ]);
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
