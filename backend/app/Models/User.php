<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'bio',
        'profile_photo_path',
        'password',
        'role',
        'company_id',
        'team_id',
    ];

    protected $appends = [
        'profile_photo_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'employee_id');
    }

    public function wins()
    {
        return $this->hasMany(Win::class, 'employee_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo_path ? '/storage/'.$this->profile_photo_path : null;
    }
}
