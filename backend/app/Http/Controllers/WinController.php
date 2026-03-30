<?php

namespace App\Http\Controllers;

use App\Models\Win;
use Illuminate\Http\Request;

class WinController extends Controller
{
    public function index(Request $request)
    {
        $query = Win::query();

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        return response()->json($query->with('employee', 'task')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'task_id' => 'nullable|exists:tasks,id',
        ]);

        $win = Win::create([
            ...$validated,
            'employee_id' => auth()->id(),
        ]);

        return response()->json($win->load('employee', 'task'), 201);
    }

    public function show(Win $win)
    {
        return response()->json($win->load('employee', 'task'));
    }

    public function destroy(Win $win)
    {
        $win->delete();
        return response()->json(['message' => 'Win deleted']);
    }
}
