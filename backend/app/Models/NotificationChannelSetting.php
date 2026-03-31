<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class NotificationChannelSetting extends Model
{
    use HasFactory;

    protected $appends = [
        'app_logo_url',
    ];

    protected $fillable = [
        'app_name',
        'smtp_host',
        'smtp_port',
        'smtp_encryption',
        'smtp_username',
        'smtp_password',
        'smtp_from_email',
        'smtp_from_name',
        'arkesel_api_key',
        'arkesel_sender_id',
        'arkesel_api_url',
        'app_logo_path',
        'updated_by',
    ];

    protected $hidden = [
        'smtp_password',
        'arkesel_api_key',
    ];

    public function setSmtpPasswordAttribute($value)
    {
        $this->attributes['smtp_password'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getSmtpPasswordAttribute($value)
    {
        if (!$value) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function setArkeselApiKeyAttribute($value)
    {
        $this->attributes['arkesel_api_key'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getArkeselApiKeyAttribute($value)
    {
        if (!$value) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getAppLogoUrlAttribute()
    {
        return $this->app_logo_path ? '/storage/'.$this->app_logo_path : null;
    }
}
