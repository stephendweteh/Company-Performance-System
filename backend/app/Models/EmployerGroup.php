<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_name',
        'manager_id',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function employers()
    {
        return $this->belongsToMany(User::class, 'employer_group_members', 'employer_group_id', 'employer_id');
    }
}
