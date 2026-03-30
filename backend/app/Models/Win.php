<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Win extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'response_by',
        'title',
        'description',
        'status',
        'score',
        'response_comment',
        'responded_at',
        'date',
        'task_id',
    ];

    protected $casts = [
        'date' => 'date',
        'responded_at' => 'datetime',
    ];

    const STATUS_SUBMITTED = 'submitted';
    const STATUS_REVIEWED = 'reviewed';
    const STATUS_APPROVED = 'approved';
    const STATUS_NEEDS_REVISION = 'needs_revision';

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id')->nullable();
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
