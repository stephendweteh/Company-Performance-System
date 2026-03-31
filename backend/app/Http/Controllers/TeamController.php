<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function publicIndex(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        return response()->json(
            Team::query()
                ->select('id', 'team_name', 'company_id')
                ->where('company_id', $validated['company_id'])
                ->orderBy('team_name')
                ->get()
        );
    }

    protected function canView($user)
    {
        return $user && in_array($user->role, ['employer', 'manager', 'super_admin']);
    }

    protected function canManage($user)
    {
        return $user && in_array($user->role, ['employer', 'super_admin']);
    }

    public function index(Request $request)
    {
        abort_unless($this->canView($request->user()), 403, 'Forbidden');

        $query = Team::query();

        // Scope to user's company if employer
        if ($request->user()->role === 'employer') {
            $query->where('company_id', $request->user()->company_id);
        }

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        return response()->json($query->with('company', 'employees', 'tasks')->get());
    }

    public function store(Request $request)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        $validated = $request->validate([
            'team_name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
        ]);

        // Ensure employer can only create teams for their own company
        if ($request->user()->role === 'employer' && $request->user()->company_id !== $validated['company_id']) {
            abort(403, 'Forbidden');
        }

        $team = Team::create($validated);

        return response()->json($team, 201);
    }

    public function show(Team $team)
    {
        abort_unless($this->canView(request()->user()), 403, 'Forbidden');

        return response()->json($team->load('company', 'employees', 'tasks'));
    }

    public function update(Request $request, Team $team)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        // Ensure employer can only update teams in their company
        if ($request->user()->role === 'employer' && $request->user()->company_id !== $team->company_id) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'team_name' => 'string|max:255',
        ]);

        $team->update($validated);

        return response()->json($team);
    }

    public function destroy(Team $team)
    {
        abort_unless($this->canManage(request()->user()), 403, 'Forbidden');

        // Ensure employer can only delete teams in their company
        if (request()->user()->role === 'employer' && request()->user()->company_id !== $team->company_id) {
            abort(403, 'Forbidden');
        }

        $team->delete();
        return response()->json(['message' => 'Team deleted']);
    }

    public function addEmployee(Request $request, Team $team, $employee)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        // Fetch the employee user
        $employeeUser = User::findOrFail($employee);

        // Ensure employer can only manage teams in their company
        if ($request->user()->role === 'employer' && $request->user()->company_id !== $team->company_id) {
            abort(403, 'Forbidden');
        }

        // Ensure employee belongs to the same company as the team
        if ($employeeUser->company_id !== $team->company_id) {
            return response()->json(['message' => 'Employee must belong to the same company as the team'], 422);
        }

        // Update employee's team
        $employeeUser->update(['team_id' => $team->id]);

        return response()->json(['message' => 'Employee added to team'], 200);
    }

    public function removeEmployee(Request $request, Team $team, $employee)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        // Fetch the employee user
        $employeeUser = User::findOrFail($employee);

        // Ensure employer can only manage teams in their company
        if ($request->user()->role === 'employer' && $request->user()->company_id !== $team->company_id) {
            abort(403, 'Forbidden');
        }

        // Ensure employee belongs to the team
        if ($employeeUser->team_id !== $team->id) {
            return response()->json(['message' => 'Employee is not in this team'], 422);
        }

        // Remove employee from team
        $employeeUser->update(['team_id' => null]);

        return response()->json(['message' => 'Employee removed from team'], 200);
    }
}
