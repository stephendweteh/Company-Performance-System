<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::query();

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('report_date', $request->date);
        }

        return response()->json($query->with('employee')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'report_date' => 'required|date',
            'title' => 'required|string|max:255',
            'work_done' => 'required|string',
            'challenges' => 'nullable|string',
            'wins' => 'nullable|string',
            'attachments' => 'nullable|array',
        ]);

        $report = Report::create([
            ...$validated,
            'employee_id' => auth()->id(),
            'status' => Report::STATUS_SUBMITTED,
        ]);

        return response()->json($report, 201);
    }

    public function show(Report $report)
    {
        return response()->json($report->load('employee'));
    }

    public function updateStatus(Request $request, Report $report)
    {
        $validated = $request->validate([
            'status' => 'required|in:submitted,reviewed,approved,needs_revision',
            'comment' => 'nullable|string',
        ]);

        $report->update(['status' => $validated['status']]);

        return response()->json($report);
    }

    public function destroy(Report $report)
    {
        $report->delete();
        return response()->json(['message' => 'Report deleted']);
    }
}
