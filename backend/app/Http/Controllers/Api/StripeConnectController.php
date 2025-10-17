<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Stripe\StripeConnectService;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class StripeConnectController extends Controller
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly StripeConnectService $stripeConnect
    ) {
    }

    public function createLink(): JsonResponse
    {
        $tenant = $this->tenantContext->ensureResolved();
        $user = request()->user();

        if (! $user || (! $user->isPlatformAdmin() && ! $user->isTenantStaff())) {
            throw new AccessDeniedHttpException();
        }

        $link = $this->stripeConnect->createOnboardingLink($tenant);

        return response()->json([
            'stripe_status' => $tenant->fresh()->stripe_status,
            'onboarding_url' => $link['url'],
            'expires_at' => $link['expires_at'],
        ]);
    }

    public function status(): JsonResponse
    {
        $tenant = $this->tenantContext->ensureResolved();
        $tenant = $this->stripeConnect->syncAccountStatus($tenant);

        return response()->json([
            'stripe_status' => $tenant->stripe_status,
            'stripe_account_id' => $tenant->stripe_account_id,
        ]);
    }
}
