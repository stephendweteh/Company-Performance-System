<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = $request->user();

        abort_unless($currentUser && in_array($currentUser->role, ['employer', 'super_admin']), 403, 'Forbidden');

        $query = User::with('company', 'team')->orderBy('name');

        if ($request->filled('role')) {
            if ($currentUser->role === 'employer' && $request->role !== 'employee') {
                return response()->json(['message' => 'Employers can only list employees.'], 403);
            }

            $query->where('role', $request->role);
        } elseif ($currentUser->role === 'employer') {
            $query->where('role', 'employee');
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
}