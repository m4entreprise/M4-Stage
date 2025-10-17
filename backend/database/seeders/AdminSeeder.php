<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Seed the default platform administrator.
     */
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@m4stage.test'],
            [
                'tenant_id' => null,
                'name' => 'Platform Admin',
                'password' => 'password',
                'role' => 'platform_admin',
                'is_active' => true,
            ]
        );

        if (! $admin->email_verified_at) {
            $admin->forceFill(['email_verified_at' => now()])->save();
        }
    }
}

