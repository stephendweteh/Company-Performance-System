<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = $request->user();
        abort_unless($currentUser, 401, 'Unauthorized');

        $query = Report::with('employee.company', 'employee.team', 'reviewer', 'responder');

        if ($currentUser->role === 'employee') {
            $query->where('employee_id', $currentUser->id);
        } elseif ($currentUser->role === 'employer') {
            $query->whereHas('employee', function ($builder) use ($currentUser) {
                $builder->where('role', 'employee')
                    ->where('company_id', $currentUser->company_id);
            });
        } elseif ($currentUser->role === 'manager') {
            $query->whereHas('employee', function ($builder) {
                $builder->where('role', 'employer');
            });
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('report_date', $request->date);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        abort_unless($currentUser && in_array($currentUser->role, ['employee', 'employer']), 403, 'Forbidden');

        $validated = $request->validate([
            'report_date' => 'required|date',
            'title' => 'required|string|max:255',
            'work_done' => 'required|string',
            'challenges' => 'nullable|string',
            'wins' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:5120',
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
                return response()->json(['message' => 'No manager found to review employer reports.'], 422);
            }

            $reviewerId = $manager->id;
        }

        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachments[] = Storage::disk('public')->url($file->store('report-attachments', 'public'));
            }
        }

        $report = Report::create([
            ...$validated,
            'employee_id' => $currentUser->id,
            'reviewer_id' => $reviewerId,
            'status' => Report::STATUS_SUBMITTED,
            'attachments' => $attachments,
        ]);

        return response()->json($report->load('employee', 'reviewer'), 201);
    }

    public function show(Report $report)
    {
        return response()->json($report->load('employee.company', 'employee.team', 'reviewer', 'responder'));
    }

    public function updateStatus(Request $request, Report $report)
    {
        $currentUser = $request->user();
        abort_unless($currentUser, 401, 'Unauthorized');

        $validated = $request->validate([
            'status' => 'required|in:submitted,reviewed,approved,needs_revision',
            'comment' => 'nullable|string',
        ]);

        $report->load('employee');

        $canRespond = false;
        if ($currentUser->role === 'employer') {
            $canRespond = $report->employee
                && $report->employee->role === 'employee'
                && $report->employee->company_id === $currentUser->company_id;
        } elseif ($currentUser->role === 'manager') {
            $canRespond = $report->employee && $report->employee->role === 'employer';
        } elseif ($currentUser->role === 'super_admin') {
            $canRespond = true;
        }

        abort_unless($canRespond, 403, 'Forbidden');

        $report->update([
            'status' => $validated['status'],
            'response_comment' => $validated['comment'] ?? null,
            'responded_at' => now(),
            'response_by' => $currentUser->id,
            'reviewer_id' => $report->reviewer_id ?? $currentUser->id,
        ]);

        return response()->json($report->fresh()->load('employee', 'reviewer', 'responder'));
    }

    public function destroy(Report $report)
    {
        $report->delete();
        return response()->json(['message' => 'Report deleted']);
    }
}
