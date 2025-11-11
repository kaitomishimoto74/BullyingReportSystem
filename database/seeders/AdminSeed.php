<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@example.com');
        $username = env('ADMIN_USERNAME', 'admin');
        $password = env('ADMIN_PASSWORD', 'ChangeMe123!');

        if (User::where('email', $email)->orWhere('username', $username)->exists()) {
            $this->command->info("Admin user already exists ({$email} / {$username}).");
            return;
        }

        $user = new User();
        $user->name = 'Administrator';
        $user->first_name = 'Admin';
        $user->last_name = 'User';
        $user->username = $username;
        $user->email = $email;
        $user->role = 'admin';
        $user->is_approved = true;
        $user->email_verified_at = now();
        $user->password = Hash::make($password);
        $user->save();

        $this->command->info("Admin user created: {$email} (username: {$username})");
        $this->command->info("Password: {$password} — change after first login.");
    }
}