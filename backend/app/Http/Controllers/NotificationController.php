<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead(Notification $notification)
    {
        $notification->update(['status' => Notification::STATUS_READ]);
        return response()->json($notification);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('status', Notification::STATUS_UNREAD)
            ->update(['status' => Notification::STATUS_READ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }
}
