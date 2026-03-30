<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $query = Team::query();

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        return response()->json($query->with('company', 'employees', 'tasks')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
        ]);

        $team = Team::create($validated);

        return response()->json($team, 201);
    }

    public function show(Team $team)
    {
        return response()->json($team->load('company', 'employees', 'tasks'));
    }

    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'team_name' => 'string|max:255',
        ]);

        $team->update($validated);

        return response()->json($team);
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return response()->json(['message' => 'Team deleted']);
    }
}
