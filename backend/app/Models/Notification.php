<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'message',
        'status',
        'type',
        'related_id',
    ];

    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';

    const TYPE_TASK_ASSIGNED = 'task_assigned';
    const TYPE_TASK_DUE = 'task_due';
    const TYPE_REPORT_COMMENT = 'report_comment';
    const TYPE_REPORT_SUBMITTED = 'report_submitted';
    const TYPE_TASK_COMPLETED = 'task_completed';
    const TYPE_WIN_RECORDED = 'win_recorded';
    const TYPE_MEMBERSHIP_APPROVED = 'membership_approved';
    const TYPE_MEMBERSHIP_REJECTED = 'membership_rejected';

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
