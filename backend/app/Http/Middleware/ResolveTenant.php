<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ResolveTenant
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        $tenant = $this->resolveTenant($request);

        if ($tenant) {
            $this->tenantContext->set($tenant);
            $request->attributes->set('tenant', $tenant);
        } else {
            $this->tenantContext->forget();
        }

        /** @var \Illuminate\Http\Response|\Illuminate\Http\JsonResponse $response */
        $response = $next($request);

        $this->tenantContext->forget();

        return $response;
    }

    protected function resolveTenant(Request $request): ?Tenant
    {
        if ($request->attributes->get('tenant')) {
            return $request->attributes->get('tenant');
        }

        foreach (config('tenant.support_headers', []) as $header) {
            $headerValue = $request->headers->get($header);
            if ($headerValue) {
                return Tenant::query()
                    ->where(fn ($query) => $query
                        ->where('id', $headerValue)
                        ->orWhere('slug', $headerValue)
                        ->orWhere('subdomain', $headerValue))
                    ->where('is_active', true)
                    ->first();
            }
        }

        if ($request->user() && $request->user()->tenant_id) {
            return $request->user()->tenant;
        }

        $host = $request->getHost();
        $baseDomain = config('tenant.base_domain');

        if (! $host || ! $baseDomain) {
            return null;
        }

        if ($host === $baseDomain) {
            return null;
        }

        if (Str::endsWith($host, '.'.$baseDomain)) {
            $subdomain = Str::before($host, '.'.$baseDomain);
        } else {
            $subdomain = $request->route('tenant') ?? null;
        }

        if (! $subdomain) {
            return null;
        }

        return Tenant::query()
            ->where('subdomain', $subdomain)
            ->where('is_active', true)
            ->first();
    }
}
