<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class EventPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isPlatformAdmin() || $user->isTenantStaff();
    }

    public function view(User $user, Event $event): bool
    {
        return $this->hasTenantAccess($user, $event->tenant_id);
    }

    public function create(User $user): bool
    {
        return $user->isTenantStaff();
    }

    public function update(User $user, Event $event): bool
    {
        return $this->hasTenantAccess($user, $event->tenant_id);
    }

    public function delete(User $user, Event $event): bool
    {
        return $this->hasTenantAccess($user, $event->tenant_id);
    }
}
