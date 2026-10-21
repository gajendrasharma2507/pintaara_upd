<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@pintaara.com')->first();
        if ($admin) {
            $admin->update([
                'name' => 'Darshit Soni',
                'role' => 'super_admin',
                'email_verified_at' => now(),
                'password' => Hash::make('PintaaraAdmin@2026!'),
            ]);
        } else {
            User::create([
                'name' => 'Darshit Soni',
                'email' => 'admin@pintaara.com',
                'role' => 'super_admin',
                'email_verified_at' => now(),
                'password' => Hash::make('PintaaraAdmin@2026!'),
            ]);
        }
    }
}
