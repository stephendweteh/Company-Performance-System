<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
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

        $validated = $request->validate([
            'team_name' => 'string|max:255',
        ]);

        $team->update($validated);

        return response()->json($team);
    }

    public function destroy(Team $team)
    {
        abort_unless($this->canManage(request()->user()), 403, 'Forbidden');

        $team->delete();
        return response()->json(['message' => 'Team deleted']);
    }
}
