<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\Win;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    protected function ensureSuperAdmin(Request $request)
    {
        abort_unless($request->user() && $request->user()->role === 'super_admin', 403, 'Forbidden');
    }

    public function overview(Request $request)
    {
        $this->ensureSuperAdmin($request);

        return response()->json([
            'stats' => [
                'users' => User::count(),
                'super_admins' => User::where('role', 'super_admin')->count(),
                'employers' => User::where('role', 'employer')->count(),
                'employees' => User::where('role', 'employee')->count(),
                'companies' => Company::count(),
                'teams' => Team::count(),
                'tasks' => Task::count(),
                'reports' => Report::count(),
                'wins' => Win::count(),
                'notifications' => Notification::count(),
            ],
        ]);
    }

    public function users(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $query = User::with('company', 'team')->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function showUser(Request $request, User $user)
    {
        $this->ensureSuperAdmin($request);

        return response()->json($user->load('company', 'team'));
    }

    public function storeUser(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,employer,employee',
            'company_id' => 'nullable|exists:companies,id',
            'team_id' => 'nullable|exists:teams,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'company_id' => $validated['company_id'] ?? null,
            'team_id' => $validated['team_id'] ?? null,
        ]);

        return response()->json($user->load('company', 'team'), 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:super_admin,employer,employee',
            'company_id' => 'nullable|exists:companies,id',
            'team_id' => 'nullable|exists:teams,id',
        ]);

        if (array_key_exists('role', $validated) && $request->user()->id === $user->id && $validated['role'] !== 'super_admin') {
            return response()->json(['message' => 'You cannot remove your own super admin role.'], 422);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->fresh()->load('company', 'team'));
    }

    public function deleteUser(Request $request, User $user)
    {
        $this->ensureSuperAdmin($request);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $this->ensureSuperAdmin($request);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot change your own role.'], 422);
        }

        $validated = $request->validate([
            'role' => 'required|in:super_admin,employer,employee',
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json($user->load('company', 'team'));
    }
}