<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EmployerGroup;
use App\Models\Report;
use App\Models\Task;
use App\Models\User;
use App\Models\Win;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PerformanceController extends Controller
{
    protected function ensureManager(Request $request): void
    {
        abort_unless($request->user() && $request->user()->role === 'manager', 403, 'Forbidden');
    }

    public function companyOverview(Request $request)
    {
        $this->ensureManager($request);

        $manager = $request->user();

        $managedEmployers = EmployerGroup::with(['employers' => function ($query) {
            $query->select('users.id', 'users.name', 'users.company_id', 'users.role', 'users.membership_status');
        }])
            ->where('manager_id', $manager->id)
            ->get()
            ->pluck('employers')
            ->flatten(1)
            ->filter(function ($user) {
                return $user->role === 'employer' && !empty($user->company_id);
            })
            ->unique('id')
            ->values();

        $companyIds = $managedEmployers->pluck('company_id')->filter()->unique()->values();

        $companies = Company::whereIn('id', $companyIds)
            ->get(['id', 'company_name'])
            ->keyBy('id');

        $employees = User::whereIn('company_id', $companyIds)
            ->where('role', 'employee')
            ->get(['id', 'name', 'company_id', 'membership_status'])
            ->values();

        $employerIds = $managedEmployers->pluck('id')->values();
        $employeeIds = $employees->pluck('id')->values();
        $scopedUserIds = $employerIds->merge($employeeIds)->unique()->values();

        $tasks = Task::whereIn('assigned_to', $scopedUserIds)
            ->get(['id', 'assigned_to', 'status']);

        $reports = Report::whereIn('employee_id', $scopedUserIds)
            ->get(['id', 'employee_id', 'status']);

        $wins = Win::whereIn('employee_id', $scopedUserIds)
            ->get(['id', 'employee_id', 'status', 'score']);

        $employerMetrics = $this->buildMetrics($managedEmployers, $tasks, $reports, $wins, 'id', 'assigned_to', 'employee_id');
        $employeeMetrics = $this->buildMetrics($employees, $tasks, $reports, $wins, 'id', 'assigned_to', 'employee_id');
        $overallMetrics = $this->buildMetrics(
            $managedEmployers->concat($employees)->values(),
            $tasks,
            $reports,
            $wins,
            'id',
            'assigned_to',
            'employee_id'
        );

        $companiesPayload = $companies
            ->map(function ($company) use ($managedEmployers, $employees, $tasks, $reports, $wins) {
                $companyEmployers = $managedEmployers->where('company_id', $company->id)->values();
                $companyEmployees = $employees->where('company_id', $company->id)->values();
                $companyUsers = $companyEmployers->concat($companyEmployees)->values();
                $metrics = $this->buildMetrics($companyUsers, $tasks, $reports, $wins, 'id', 'assigned_to', 'employee_id');

                return [
                    'id' => $company->id,
                    'company_name' => $company->company_name,
                    'employers' => $companyEmployers->count(),
                    'employees' => $companyEmployees->count(),
                    ...$metrics,
                ];
            })
            ->sortByDesc('performance_index')
            ->values();

        return response()->json([
            'summary' => [
                'companies' => $companyIds->count(),
                'employers' => $managedEmployers->count(),
                'employees' => $employees->count(),
                ...$overallMetrics,
            ],
            'role_comparison' => [
                [
                    'role' => 'Employers',
                    'users' => $managedEmployers->count(),
                    ...$employerMetrics,
                ],
                [
                    'role' => 'Employees',
                    'users' => $employees->count(),
                    ...$employeeMetrics,
                ],
            ],
            'status_breakdown' => [
                'tasks' => $this->buildStatusBreakdown($tasks, [
                    Task::STATUS_PENDING => 'Pending',
                    Task::STATUS_IN_PROGRESS => 'In Progress',
                    Task::STATUS_PENDING_REVIEW => 'Pending Review',
                    Task::STATUS_COMPLETED => 'Completed',
                ]),
                'reports' => $this->buildStatusBreakdown($reports, [
                    Report::STATUS_SUBMITTED => 'Submitted',
                    Report::STATUS_REVIEWED => 'Reviewed',
                    Report::STATUS_APPROVED => 'Approved',
                    Report::STATUS_NEEDS_REVISION => 'Needs Revision',
                ]),
                'wins' => $this->buildStatusBreakdown($wins, [
                    Win::STATUS_SUBMITTED => 'Submitted',
                    Win::STATUS_REVIEWED => 'Reviewed',
                    Win::STATUS_APPROVED => 'Approved',
                    Win::STATUS_NEEDS_REVISION => 'Needs Revision',
                ]),
            ],
            'companies' => $companiesPayload,
        ]);
    }

    protected function buildMetrics(
        Collection $users,
        Collection $tasks,
        Collection $reports,
        Collection $wins,
        string $userKey,
        string $taskUserKey,
        string $entryUserKey
    ): array {
        $userIds = $users->pluck($userKey)->unique()->values();

        $scopedTasks = $tasks->whereIn($taskUserKey, $userIds);
        $scopedReports = $reports->whereIn($entryUserKey, $userIds);
        $scopedWins = $wins->whereIn($entryUserKey, $userIds);

        $tasksTotal = $scopedTasks->count();
        $tasksCompleted = $scopedTasks->where('status', Task::STATUS_COMPLETED)->count();
        $reportsTotal = $scopedReports->count();
        $reportsApproved = $scopedReports->where('status', Report::STATUS_APPROVED)->count();
        $winsTotal = $scopedWins->count();
        $avgWinScore = round((float) $scopedWins->pluck('score')->filter()->avg(), 1);

        $completionRate = $tasksTotal > 0 ? round(($tasksCompleted / $tasksTotal) * 100, 1) : 0;
        $approvalRate = $reportsTotal > 0 ? round(($reportsApproved / $reportsTotal) * 100, 1) : 0;
        $winScorePercent = $avgWinScore > 0 ? round(($avgWinScore / 5) * 100, 1) : 0;
        $performanceIndex = round(($completionRate * 0.45) + ($approvalRate * 0.35) + ($winScorePercent * 0.20), 1);

        return [
            'tasks_total' => $tasksTotal,
            'tasks_completed' => $tasksCompleted,
            'completion_rate' => $completionRate,
            'reports_total' => $reportsTotal,
            'reports_approved' => $reportsApproved,
            'approval_rate' => $approvalRate,
            'wins_total' => $winsTotal,
            'avg_win_score' => $avgWinScore,
            'win_score_percent' => $winScorePercent,
            'performance_index' => $performanceIndex,
        ];
    }

    protected function buildStatusBreakdown(Collection $items, array $labels): array
    {
        return collect($labels)->map(function ($label, $status) use ($items) {
            return [
                'status' => $status,
                'label' => $label,
                'value' => $items->where('status', $status)->count(),
            ];
        })->values()->all();
    }
}
