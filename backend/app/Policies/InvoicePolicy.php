<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class InvoicePolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isTenantStaff() || $user->isPlatformAdmin();
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->hasTenantAccess($user, $invoice->tenant_id);
    }
}
