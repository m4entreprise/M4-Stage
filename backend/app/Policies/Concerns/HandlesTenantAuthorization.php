<?php

namespace App\Policies\Concerns;

use App\Models\Tenant;
use App\Models\User;

trait HandlesTenantAuthorization
{
    protected function hasTenantAccess(User $user, ?string $tenantId): bool
    {
        if ($user->isPlatformAdmin()) {
            return true;
        }

        if (! $tenantId) {
            return false;
        }

        return $user->tenant_id === $tenantId && $user->is_active;
    }
}
