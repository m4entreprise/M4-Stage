<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $tenant = $this->tenantContext->current();

        $userQuery = User::query()->where('email', $credentials['email']);

        if ($tenant) {
            $userQuery->where('tenant_id', $tenant->id);
        } else {
            $userQuery->whereNull('tenant_id')->orWhere('role', 'platform_admin');
        }

        $user = $userQuery->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => __('Votre compte est désactivé.'),
            ]);
        }

        $token = $user->createToken('api', $this->abilitiesFor($user), $request->boolean('remember_me') ? now()->addMonths(6) : now()->addWeek());

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => $user->load('tenant'),
        ]);
    }

    public function logout(): JsonResponse
    {
        $user = request()->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json(['status' => 'ok']);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'user' => request()->user()->load('tenant'),
        ]);
    }

    protected function abilitiesFor(User $user): array
    {
        if ($user->isPlatformAdmin()) {
            return ['*'];
        }

        return [
            'events:read',
            'events:write',
            'tickets:read',
            'tickets:write',
            'orders:read',
        ];
    }
}
