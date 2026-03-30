<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'report_date',
        'title',
        'work_done',
        'challenges',
        'wins',
        'status',
        'attachments',
    ];

    protected $casts = [
        'report_date' => 'date',
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
}
