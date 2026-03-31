<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\NotificationChannelSetting;
use App\Models\NotificationDeliveryLog;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\Win;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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
                'managers' => User::where('role', 'manager')->count(),
                'employees' => User::where('role', 'employee')->count(),
                'memberships_pending' => User::where('membership_status', 'pending')->count(),
                'memberships_accepted' => User::where('membership_status', 'accepted')->count(),
                'memberships_rejected' => User::where('membership_status', 'rejected')->count(),
                'companies' => Company::count(),
                'teams' => Team::count(),
                'tasks' => Task::count(),
                'reports' => Report::count(),
                'wins' => Win::count(),
                'notifications' => Notification::count(),
            ],
        ]);
    }

    protected function channelSettings()
    {
        return NotificationChannelSetting::firstOrCreate([], [
            'arkesel_api_url' => 'https://sms.arkesel.com/sms/api',
        ]);
    }

    public function notificationChannels(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $settings = $this->channelSettings();

        return response()->json([
            'smtp_host' => $settings->smtp_host,
            'smtp_port' => $settings->smtp_port,
            'smtp_encryption' => $settings->smtp_encryption,
            'smtp_username' => $settings->smtp_username,
            'smtp_from_email' => $settings->smtp_from_email,
            'smtp_from_name' => $settings->smtp_from_name,
            'has_smtp_password' => !empty($settings->smtp_password),
            'arkesel_sender_id' => $settings->arkesel_sender_id,
            'arkesel_api_url' => $settings->arkesel_api_url,
            'has_arkesel_api_key' => !empty($settings->arkesel_api_key),
        ]);
    }

    public function notificationDeliveries(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'channel' => 'nullable|in:email,sms',
            'status' => 'nullable|in:sent,failed,skipped',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = NotificationDeliveryLog::with('user.company', 'actor')
            ->latest();

        if (!empty($validated['channel'])) {
            $query->where('channel', $validated['channel']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        return response()->json($query->paginate($validated['per_page'] ?? 10));
    }

    public function updateNotificationChannels(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_encryption' => 'nullable|in:tls,ssl',
            'smtp_username' => 'nullable|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'smtp_from_email' => 'nullable|email|max:255',
            'smtp_from_name' => 'nullable|string|max:255',
            'clear_smtp_password' => 'sometimes|boolean',
            'arkesel_api_key' => 'nullable|string|max:255',
            'arkesel_sender_id' => 'nullable|string|max:30',
            'arkesel_api_url' => 'nullable|url|max:255',
            'clear_arkesel_api_key' => 'sometimes|boolean',
        ]);

        $settings = $this->channelSettings();

        $settings->smtp_host = $validated['smtp_host'] ?? $settings->smtp_host;
        $settings->smtp_port = $validated['smtp_port'] ?? $settings->smtp_port;
        $settings->smtp_encryption = $validated['smtp_encryption'] ?? $settings->smtp_encryption;
        $settings->smtp_username = $validated['smtp_username'] ?? $settings->smtp_username;
        $settings->smtp_from_email = $validated['smtp_from_email'] ?? $settings->smtp_from_email;
        $settings->smtp_from_name = $validated['smtp_from_name'] ?? $settings->smtp_from_name;

        if (!empty($validated['smtp_password'])) {
            $settings->smtp_password = $validated['smtp_password'];
        } elseif (!empty($validated['clear_smtp_password'])) {
            $settings->smtp_password = null;
        }

        $settings->arkesel_sender_id = $validated['arkesel_sender_id'] ?? $settings->arkesel_sender_id;
        $settings->arkesel_api_url = $validated['arkesel_api_url'] ?? $settings->arkesel_api_url;

        if (!empty($validated['arkesel_api_key'])) {
            $settings->arkesel_api_key = $validated['arkesel_api_key'];
        } elseif (!empty($validated['clear_arkesel_api_key'])) {
            $settings->arkesel_api_key = null;
        }

        $settings->updated_by = $request->user()->id;
        $settings->save();

        return response()->json(['message' => 'Notification channel settings saved.']);
    }

    public function testSmtpConnection(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'test_email' => 'required|email|max:255',
        ]);

        $settings = $this->channelSettings();

        if (empty($settings->smtp_host) || empty($settings->smtp_port) || empty($settings->smtp_from_email)) {
            return response()->json(['message' => 'Please configure SMTP host, port, and from email first.'], 422);
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
            Mail::raw('SMTP connection test from PerformTrack admin settings.', function ($message) use ($validated) {
                $message->to($validated['test_email'])
                    ->subject('PerformTrack SMTP Test');
            });

            return response()->json(['message' => 'SMTP test email sent successfully.']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'SMTP test failed: '.$e->getMessage()], 422);
        }
    }

    public function testArkeselConnection(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'test_phone' => 'required|string|max:30',
            'test_message' => 'nullable|string|max:480',
        ]);

        $settings = $this->channelSettings();

        if (empty($settings->arkesel_api_key) || empty($settings->arkesel_sender_id) || empty($settings->arkesel_api_url)) {
            return response()->json(['message' => 'Please configure Arkesel API key, sender ID, and API URL first.'], 422);
        }

        $message = $validated['test_message'] ?? 'PerformTrack SMS test message from Admin settings.';
        $url = $settings->arkesel_api_url;

        try {
            if (str_contains($url, '/sms/api')) {
                $response = Http::timeout(20)->get($url, [
                    'action' => 'send-sms',
                    'api_key' => $settings->arkesel_api_key,
                    'to' => $validated['test_phone'],
                    'from' => $settings->arkesel_sender_id,
                    'sms' => $message,
                ]);
            } else {
                $response = Http::timeout(20)->post($url, [
                    'api_key' => $settings->arkesel_api_key,
                    'sender' => $settings->arkesel_sender_id,
                    'to' => $validated['test_phone'],
                    'message' => $message,
                ]);
            }

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Arkesel test failed with HTTP '.$response->status(),
                    'response' => $response->body(),
                ], 422);
            }

            return response()->json([
                'message' => 'Arkesel test request sent successfully.',
                'response' => $response->json() ?? $response->body(),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Arkesel test failed: '.$e->getMessage()], 422);
        }
    }

    public function users(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $query = User::with('company', 'team')->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('membership_status')) {
            $query->where('membership_status', $request->membership_status);
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
            'role' => 'required|in:super_admin,employer,manager,employee',
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string|max:2000',
            'company_id' => 'nullable|exists:companies,id',
            'team_id' => 'nullable|exists:teams,id',
            'membership_status' => 'nullable|in:pending,accepted,rejected',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'company_id' => $validated['company_id'] ?? null,
            'team_id' => $validated['team_id'] ?? null,
            'membership_status' => $validated['membership_status'] ?? 'accepted',
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
            'role' => 'sometimes|required|in:super_admin,employer,manager,employee',
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string|max:2000',
            'company_id' => 'nullable|exists:companies,id',
            'team_id' => 'nullable|exists:teams,id',
            'membership_status' => 'nullable|in:pending,accepted,rejected',
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
            'role' => 'required|in:super_admin,employer,manager,employee',
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json($user->load('company', 'team'));
    }

    public function resetData(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'targets' => 'required|array|min:1',
            'targets.*' => 'in:tasks,reports',
        ]);

        $deleted = [];

        if (in_array('tasks', $validated['targets'])) {
            Task::truncate();
            $deleted[] = 'tasks';
        }

        if (in_array('reports', $validated['targets'])) {
            Report::truncate();
            $deleted[] = 'reports';
        }

        return response()->json([
            'message' => 'Data cleared: ' . implode(', ', $deleted) . '.',
        ]);
    }
}