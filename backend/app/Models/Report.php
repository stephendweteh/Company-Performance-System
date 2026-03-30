<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'response_by',
        'report_date',
        'title',
        'work_done',
        'challenges',
        'wins',
        'status',
        'response_comment',
        'responded_at',
        'attachments',
    ];

    protected $casts = [
        'report_date' => 'date',
        'responded_at' => 'datetime',
        'attachments' => 'array',
    ];

    const STATUS_SUBMITTED = 'submitted';
    const STATUS_REVIEWED = 'reviewed';
    const STATUS_APPROVED = 'approved';
    const STATUS_NEEDS_REVISION = 'needs_revision';

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function responder()
    {
        return $this->belongsTo(User::class, 'response_by');
    }
}
