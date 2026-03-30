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