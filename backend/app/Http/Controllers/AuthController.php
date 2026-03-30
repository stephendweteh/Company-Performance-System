<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => 'required|string|min:8|confirmed',
            'company_id' => 'required|integer|exists:companies,id',
        ]);

        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => Hash::make($validated['password']),
            'role'              => 'employee',
            'company_id'        => $validated['company_id'],
            'membership_status' => 'pending',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'    => $user,
            'token'   => $token,
            'message' => 'Registration successful. Your membership is pending approval by your company employer or super admin.',
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user  = Auth::user();

        // Check membership status for employees
        if ($user->role === 'employee' && $user->membership_status === 'pending') {
            return response()->json([
                'message' => 'Your membership is pending approval. Please wait for your company employer or super admin to accept your request.',
                'status'  => 'pending',
            ], 403);
        }

        if ($user->role === 'employee' && $user->membership_status === 'rejected') {
            return response()->json([
                'message' => 'Your membership request has been rejected. Please contact your company employer or super admin.',
                'status'  => 'rejected',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('company', 'team'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string|max:2000',
            'profile_photo' => 'nullable|image|max:2048',
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (!empty($validated['password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $validated['profile_photo_path'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'profile_photo_path' => $validated['profile_photo_path'] ?? $user->profile_photo_path,
            'password' => !empty($validated['password']) ? Hash::make($validated['password']) : $user->password,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh()->load('company', 'team'),
        ]);
    }

    /**
     * Get pending membership requests for the authenticated user's company
     */
    public function getPendingMemberships(Request $request)
    {
        $user = $request->user();

        // Only employers and super admins can view pending memberships
        if ($user->role === 'employee') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'super_admin') {
            // Super admin can see all pending memberships
            $pendingUsers = User::where('membership_status', 'pending')
                ->where('role', 'employee')
                ->with('company')
                ->orderBy('name')
                ->get();
        } else {
            // Employer can only see pending memberships for their company
            $pendingUsers = User::where('company_id', $user->company_id)
                ->where('membership_status', 'pending')
                ->where('role', 'employee')
                ->with('company')
                ->orderBy('name')
                ->get();
        }

        return response()->json($pendingUsers);
    }

    /**
     * Accept or reject a membership request
     */
    public function respondToMembership(Request $request, $userId)
    {
        $authUser = $request->user();
        $user = User::findOrFail($userId);

        // Only employers and super admins can respond
        if ($authUser->role === 'employee') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Employer can only respond to employees in their company
        if ($authUser->role === 'employer' && $user->company_id !== $authUser->company_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate the action
        $validated = $request->validate([
            'action' => 'required|in:accept,reject',
        ]);

        if ($user->membership_status !== 'pending') {
            return response()->json(['message' => 'Membership is not pending'], 422);
        }

        $action = $validated['action'];
        $user->update([
            'membership_status' => $action === 'accept' ? 'accepted' : 'rejected',
        ]);

        return response()->json([
            'message' => 'Membership ' . $action . 'ed successfully.',
            'user' => $user,
        ]);
    }
}
