<?php

namespace App\Support;

use App\Models\Tenant;
use Illuminate\Support\Facades\App;

class TenantContext
{
    protected ?Tenant $tenant = null;

    public function set(?Tenant $tenant): void
    {
        $this->tenant = $tenant;
        App::instance(self::class, $this);
    }

    public function current(): ?Tenant
    {
        return $this->tenant;
    }

    public function id(): ?string
    {
        return $this->tenant?->getKey();
    }

    public function isResolved(): bool
    {
        return $this->tenant !== null;
    }

    public function ensureResolved(): Tenant
    {
        if (!$this->tenant) {
            throw new \RuntimeException('No tenant resolved for the current request.');
        }

        return $this->tenant;
    }

    public function forget(): void
    {
        $this->tenant = null;
    }
}
