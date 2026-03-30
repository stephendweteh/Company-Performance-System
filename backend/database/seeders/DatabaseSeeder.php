<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@performance.local'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@12345'),
                'role' => 'super_admin',
                'company_id' => null,
                'team_id' => null,
            ]
        );
    }
}
