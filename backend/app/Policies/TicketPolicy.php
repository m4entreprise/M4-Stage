<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class TicketPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isTenantStaff() || $user->isPlatformAdmin();
    }

    public function view(User $user, Ticket $ticket): bool
    {
        return $this->hasTenantAccess($user, $ticket->tenant_id);
    }

    public function create(User $user): bool
    {
        return $user->isTenantStaff();
    }

    public function update(User $user, Ticket $ticket): bool
    {
        return $this->hasTenantAccess($user, $ticket->tenant_id);
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return $this->hasTenantAccess($user, $ticket->tenant_id);
    }
}
