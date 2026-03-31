<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationChannelSetting;
use App\Models\NotificationDeliveryLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'phone'      => 'nullable|string|max:30',
            'password'   => 'required|string|min:8|confirmed',
            'company_id' => 'required|integer|exists:companies,id',
            'team_id'    => [
                'nullable',
                Rule::exists('teams', 'id')->where(function ($query) use ($request) {
                    $query->where('company_id', $request->input('company_id'));
                }),
            ],
        ]);

        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'phone'             => $validated['phone'] ?? null,
            'password'          => Hash::make($validated['password']),
            'role'              => 'employee',
            'company_id'        => $validated['company_id'],
            'team_id'           => $validated['team_id'] ?? null,
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
            'remove_profile_photo' => 'nullable|boolean',
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (!empty($validated['password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
        }

        $profilePhotoPath = $user->profile_photo_path;

        if ($request->boolean('remove_profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $profilePhotoPath = null;
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $profilePhotoPath = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'profile_photo_path' => $profilePhotoPath,
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

        $validated = $request->validate([
            'team_id' => 'nullable|exists:teams,id',
            'registration_date' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        // Only employers and super admins can view pending memberships
        if ($user->role === 'employee') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pendingUsersQuery = User::where('membership_status', 'pending')
            ->where('role', 'employee')
            ->with('company', 'team')
            ->orderBy('name');

        if ($user->role === 'super_admin') {
            // Super admin can see all pending memberships
        } else {
            // Employer can only see pending memberships for their company
            $pendingUsersQuery->where('company_id', $user->company_id);
        }

        if (!empty($validated['team_id'])) {
            $pendingUsersQuery->where('team_id', $validated['team_id']);
        }

        if (!empty($validated['registration_date'])) {
            $pendingUsersQuery->whereDate('created_at', $validated['registration_date']);
        }

        $pendingUsers = $pendingUsersQuery->paginate($validated['per_page'] ?? 10);

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

        $action = $validated['action'];
        $result = $this->applyMembershipDecision($authUser, $user, $action);

        if ($result !== true) {
            return $result;
        }

        return response()->json([
            'message' => 'Membership ' . $action . 'ed successfully.',
            'user' => $user->fresh()->load('company'),
        ]);
    }

    public function bulkRespondToMemberships(Request $request)
    {
        $authUser = $request->user();

        if ($authUser->role === 'employee') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:accept,reject',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])
            ->with('company')
            ->get();

        $updatedUsers = [];

        foreach ($users as $user) {
            $result = $this->applyMembershipDecision($authUser, $user, $validated['action']);

            if ($result === true) {
                $updatedUsers[] = $user->fresh()->load('company');
            }
        }

        if (count($updatedUsers) === 0) {
            return response()->json(['message' => 'No pending membership requests were updated.'], 422);
        }

        return response()->json([
            'message' => count($updatedUsers) . ' membership request(s) ' . $validated['action'] . 'ed successfully.',
            'users' => $updatedUsers,
        ]);
    }

    protected function applyMembershipDecision(User $authUser, User $user, string $action)
    {
        if ($authUser->role === 'employer' && $user->company_id !== $authUser->company_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role !== 'employee') {
            return response()->json(['message' => 'Only employee memberships can be updated.'], 422);
        }

        if ($user->membership_status !== 'pending') {
            return response()->json(['message' => 'Membership is not pending'], 422);
        }

        $status = $action === 'accept' ? 'accepted' : 'rejected';

        $user->update([
            'membership_status' => $status,
        ]);

        $this->notifyMembershipDecision($user->fresh()->load('company'), $authUser, $status);

        return true;
    }

    protected function notifyMembershipDecision(User $user, User $actor, string $status): void
    {
        $isAccepted = $status === 'accepted';
        $companyName = $user->company?->company_name ?: 'your company';
        $actorName = $actor->name ?: 'An administrator';

        $message = $isAccepted
            ? "Your membership for {$companyName} has been approved by {$actorName}. You can now sign in."
            : "Your membership for {$companyName} has been rejected by {$actorName}. Contact support or your company admin for help.";

        $notification = Notification::create([
            'user_id' => $user->id,
            'message' => $message,
            'status' => Notification::STATUS_UNREAD,
            'type' => $isAccepted ? Notification::TYPE_MEMBERSHIP_APPROVED : Notification::TYPE_MEMBERSHIP_REJECTED,
            'related_id' => $user->id,
        ]);

        $settings = NotificationChannelSetting::first();

        $this->sendMembershipEmail($user, $message, $settings, $isAccepted, $actor, $notification);
        $this->sendMembershipSms($user, $message, $settings, $actor, $notification);
    }

    protected function sendMembershipEmail(User $user, string $message, ?NotificationChannelSetting $settings, bool $isAccepted, User $actor, Notification $notification): void
    {
        $subject = $isAccepted ? 'Membership Approved' : 'Membership Rejected';

        if (empty($user->email)) {
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_SKIPPED, null, $subject, $message, 'smtp', 'User has no email address.');
            return;
        }

        if (!$settings || empty($settings->smtp_host) || empty($settings->smtp_port) || empty($settings->smtp_from_email)) {
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_SKIPPED, $user->email, $subject, $message, 'smtp', 'SMTP is not configured.');
            return;
        }

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $settings->smtp_host,
            'mail.mailers.smtp.port' => $settings->smtp_port,
            'mail.mailers.smtp.encryption' => $settings->smtp_encryption ?: null,
            'mail.mailers.smtp.username' => $settings->smtp_username,
            'mail.mailers.smtp.password' => $settings->smtp_password,
            'mail.from.address' => $settings->smtp_from_email,
            'mail.from.name' => $settings->smtp_from_name ?: config('app.name'),
        ]);

        try {
            Mail::raw($message, function ($mailMessage) use ($user, $isAccepted) {
                $mailMessage->to($user->email)
                    ->subject($isAccepted ? 'Membership Approved' : 'Membership Rejected');
            });
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_SENT, $user->email, $subject, $message, 'smtp');
        } catch (\Throwable $e) {
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_FAILED, $user->email, $subject, $message, 'smtp', $e->getMessage());
        }
    }

    protected function sendMembershipSms(User $user, string $message, ?NotificationChannelSetting $settings, User $actor, Notification $notification): void
    {
        if (empty($user->phone)) {
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_SKIPPED, null, null, $message, 'arkesel', 'User has no phone number.');
            return;
        }

        if (!$settings || empty($settings->arkesel_api_key) || empty($settings->arkesel_sender_id) || empty($settings->arkesel_api_url)) {
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_SKIPPED, $user->phone, null, $message, 'arkesel', 'SMS provider is not configured.');
            return;
        }

        try {
            if (str_contains($settings->arkesel_api_url, '/sms/api')) {
                $response = Http::timeout(20)->get($settings->arkesel_api_url, [
                    'action' => 'send-sms',
                    'api_key' => $settings->arkesel_api_key,
                    'to' => $user->phone,
                    'from' => $settings->arkesel_sender_id,
                    'sms' => $message,
                ]);
            } else {
                $response = Http::timeout(20)->post($settings->arkesel_api_url, [
                    'api_key' => $settings->arkesel_api_key,
                    'sender' => $settings->arkesel_sender_id,
                    'to' => $user->phone,
                    'message' => $message,
                ]);
            }

            if ($response->successful()) {
                $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_SENT, $user->phone, null, $message, 'arkesel');
                return;
            }

            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_FAILED, $user->phone, null, $message, 'arkesel', 'HTTP '.$response->status().': '.$response->body());
        } catch (\Throwable $e) {
            $this->logNotificationDelivery($user, $actor, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_FAILED, $user->phone, null, $message, 'arkesel', $e->getMessage());
        }
    }

    protected function logNotificationDelivery(
        User $user,
        User $actor,
        Notification $notification,
        string $channel,
        string $status,
        ?string $recipient,
        ?string $subject,
        string $message,
        ?string $provider = null,
        ?string $errorMessage = null
    ): void {
        NotificationDeliveryLog::create([
            'user_id' => $user->id,
            'notification_id' => $notification->id,
            'channel' => $channel,
            'status' => $status,
            'recipient' => $recipient,
            'subject' => $subject,
            'message' => $message,
            'provider' => $provider,
            'error_message' => $errorMessage,
            'meta' => [
                'notification_type' => $notification->type,
                'company_name' => $user->company?->company_name,
            ],
            'created_by' => $actor->id,
        ]);
    }
}
