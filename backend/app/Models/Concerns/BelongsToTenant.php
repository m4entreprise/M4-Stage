<?php

namespace App\Models\Concerns;

use App\Scopes\TenantScope;
use App\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function (Model $model) {
            $context = app(TenantContext::class);

            if (! $context->id()) {
                return;
            }

            if (! $model->getAttribute($model->getTenantForeignKey())) {
                $model->setAttribute($model->getTenantForeignKey(), $context->id());
            }
        });
    }

    protected function getTenantForeignKey(): string
    {
        return 'tenant_id';
    }

    public function scopeForTenant(Builder $query, string $tenantId): Builder
    {
        return $query->where($this->getTable().'.tenant_id', $tenantId);
    }

    public function tenant()
    {
        return $this->belongsTo(\App\Models\Tenant::class);
    }
}
