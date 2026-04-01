<?php

namespace App\Http\Controllers;

use App\Models\EmployerGroup;
use App\Models\User;
use Illuminate\Http\Request;

class EmployerGroupController extends Controller
{
    protected function canManage($user)
    {
        return $user && in_array($user->role, ['manager', 'super_admin']);
    }

    public function index(Request $request)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        $query = EmployerGroup::query();

        // Scope to user's groups if manager
        if ($request->user()->role === 'manager') {
            $query->where('manager_id', $request->user()->id);
        }

        return response()->json($query->with('manager', 'employers')->get());
    }

    public function store(Request $request)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        $validated = $request->validate([
            'group_name' => 'required|string|max:255',
        ]);

        $group = EmployerGroup::create([
            'group_name' => $validated['group_name'],
            'manager_id' => $request->user()->id,
        ]);

        return response()->json($group, 201);
    }

    public function show(EmployerGroup $employer_group)
    {
        abort_unless($this->canManage(request()->user()), 403, 'Forbidden');

        // Ensure manager can only view their own groups
        if (request()->user()->role === 'manager' && request()->user()->id !== $employer_group->manager_id) {
            abort(403, 'Forbidden');
        }

        return response()->json($employer_group->load('manager', 'employers'));
    }

    public function update(Request $request, EmployerGroup $employer_group)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        // Ensure manager can only update their own groups
        if ($request->user()->role === 'manager' && $request->user()->id !== $employer_group->manager_id) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'group_name' => 'string|max:255',
        ]);

        $employer_group->update($validated);

        return response()->json($employer_group);
    }

    public function destroy(EmployerGroup $employer_group)
    {
        abort_unless($this->canManage(request()->user()), 403, 'Forbidden');

        $employer_group->delete();
        return response()->json(['message' => 'Employer group deleted']);
    }

    public function addEmployer(Request $request, EmployerGroup $employer_group, $employer)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        // Fetch the employer user
        $employerUser = User::findOrFail($employer);

        // Ensure manager can only manage their own groups
        if ($request->user()->role === 'manager' && $request->user()->id !== $employer_group->manager_id) {
            abort(403, 'Forbidden');
        }

        // Ensure user is an employer
        if ($employerUser->role !== 'employer') {
            return response()->json(['message' => 'User must be an employer'], 422);
        }

        // Attach employer to group
        $employer_group->employers()->syncWithoutDetaching([$employerUser->id]);

        return response()->json(['message' => 'Employer added to group'], 200);
    }

    public function removeEmployer(Request $request, EmployerGroup $employer_group, $employer)
    {
        abort_unless($this->canManage($request->user()), 403, 'Forbidden');

        // Fetch the employer user
        $employerUser = User::findOrFail($employer);

        // Ensure manager can only manage their own groups
        if ($request->user()->role === 'manager' && $request->user()->id !== $employer_group->manager_id) {
            abort(403, 'Forbidden');
        }

        // Check if employer is in group
        if (!$employer_group->employers()->where('users.id', $employerUser->id)->exists()) {
            return response()->json(['message' => 'Employer is not in this group'], 422);
        }

        // Detach employer from group
        $employer_group->employers()->detach($employerUser->id);

        return response()->json(['message' => 'Employer removed from group'], 200);
    }
}
