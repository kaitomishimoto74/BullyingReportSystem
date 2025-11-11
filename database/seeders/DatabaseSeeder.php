<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // call the admin seeder
        $this->call(\Database\Seeders\AdminSeed::class);
    }
}
