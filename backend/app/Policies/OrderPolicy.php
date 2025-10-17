<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class OrderPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isTenantStaff() || $user->isPlatformAdmin();
    }

    public function view(User $user, Order $order): bool
    {
        return $this->hasTenantAccess($user, $order->tenant_id);
    }
}
