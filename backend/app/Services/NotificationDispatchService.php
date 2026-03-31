<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationChannelSetting;
use App\Models\NotificationDeliveryLog;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class NotificationDispatchService
{
    public function send(?User $recipient, string $message, string $type, int $relatedId, ?int $actorId = null): ?Notification
    {
        if (!$recipient || ($actorId && $recipient->id === $actorId)) {
            return null;
        }

        $notification = Notification::create([
            'user_id' => $recipient->id,
            'message' => $message,
            'status' => Notification::STATUS_UNREAD,
            'type' => $type,
            'related_id' => $relatedId,
        ]);

        $settings = NotificationChannelSetting::first();
        $actor = $actorId ? User::find($actorId) : null;

        $this->sendEmail($recipient, $notification, $message, $settings, $actor);
        $this->sendSms($recipient, $notification, $message, $settings, $actor);

        return $notification;
    }

    protected function sendEmail(User $recipient, Notification $notification, string $message, ?NotificationChannelSetting $settings, ?User $actor): void
    {
        $subject = $this->subjectForType($notification->type);

        if (empty($recipient->email)) {
            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_SKIPPED, null, $subject, $message, 'smtp', 'User has no email address.', $actor);
            return;
        }

        if (!$settings || empty($settings->smtp_host) || empty($settings->smtp_port) || empty($settings->smtp_from_email)) {
            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_SKIPPED, $recipient->email, $subject, $message, 'smtp', 'SMTP is not configured.', $actor);
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
            Mail::raw($message, function ($mailMessage) use ($recipient, $subject) {
                $mailMessage->to($recipient->email)->subject($subject);
            });

            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_SENT, $recipient->email, $subject, $message, 'smtp', null, $actor);
        } catch (\Throwable $e) {
            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_EMAIL, NotificationDeliveryLog::STATUS_FAILED, $recipient->email, $subject, $message, 'smtp', $e->getMessage(), $actor);
        }
    }

    protected function sendSms(User $recipient, Notification $notification, string $message, ?NotificationChannelSetting $settings, ?User $actor): void
    {
        if (empty($recipient->phone)) {
            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_SKIPPED, null, null, $message, 'arkesel', 'User has no phone number.', $actor);
            return;
        }

        if (!$settings || empty($settings->arkesel_api_key) || empty($settings->arkesel_sender_id) || empty($settings->arkesel_api_url)) {
            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_SKIPPED, $recipient->phone, null, $message, 'arkesel', 'SMS provider is not configured.', $actor);
            return;
        }

        try {
            if (str_contains($settings->arkesel_api_url, '/sms/api')) {
                $response = Http::timeout(20)->get($settings->arkesel_api_url, [
                    'action' => 'send-sms',
                    'api_key' => $settings->arkesel_api_key,
                    'to' => $recipient->phone,
                    'from' => $settings->arkesel_sender_id,
                    'sms' => $message,
                ]);
            } else {
                $response = Http::timeout(20)->post($settings->arkesel_api_url, [
                    'api_key' => $settings->arkesel_api_key,
                    'sender' => $settings->arkesel_sender_id,
                    'to' => $recipient->phone,
                    'message' => $message,
                ]);
            }

            if ($response->successful()) {
                $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_SENT, $recipient->phone, null, $message, 'arkesel', null, $actor);
                return;
            }

            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_FAILED, $recipient->phone, null, $message, 'arkesel', 'HTTP '.$response->status().': '.$response->body(), $actor);
        } catch (\Throwable $e) {
            $this->logDelivery($recipient, $notification, NotificationDeliveryLog::CHANNEL_SMS, NotificationDeliveryLog::STATUS_FAILED, $recipient->phone, null, $message, 'arkesel', $e->getMessage(), $actor);
        }
    }

    protected function logDelivery(
        User $recipient,
        Notification $notification,
        string $channel,
        string $status,
        ?string $to,
        ?string $subject,
        string $message,
        ?string $provider,
        ?string $error,
        ?User $actor
    ): void {
        NotificationDeliveryLog::create([
            'user_id' => $recipient->id,
            'notification_id' => $notification->id,
            'channel' => $channel,
            'status' => $status,
            'recipient' => $to,
            'subject' => $subject,
            'message' => $message,
            'provider' => $provider,
            'error_message' => $error,
            'meta' => [
                'notification_type' => $notification->type,
            ],
            'created_by' => $actor?->id,
        ]);
    }

    protected function subjectForType(string $type): string
    {
        $subjects = [
            Notification::TYPE_TASK_ASSIGNED => 'New Task Assigned',
            Notification::TYPE_TASK_DUE => 'Task Due Reminder',
            Notification::TYPE_TASK_COMPLETED => 'Task Update',
            Notification::TYPE_REPORT_SUBMITTED => 'New Report Submitted',
            Notification::TYPE_REPORT_COMMENT => 'Report Response',
            Notification::TYPE_WIN_RECORDED => 'Achievement Update',
            Notification::TYPE_MEMBERSHIP_APPROVED => 'Membership Approved',
            Notification::TYPE_MEMBERSHIP_REJECTED => 'Membership Rejected',
        ];

        return $subjects[$type] ?? 'Notification';
    }
}