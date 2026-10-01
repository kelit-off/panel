<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Throwable;
use Illuminate\Support\Str;
use Pterodactyl\Models\Referral;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Services\Referrals\ReferralService;
use Pterodactyl\Http\Requests\Api\Client\AccountApiRequest;

class ReferralController extends ClientApiController
{
    public function __construct(private ReferralService $referrals)
    {
        parent::__construct();
    }

    /**
     * The authenticated customer's referral code, the terms of the programme,
     * their Stripe credit and the people they referred.
     */
    public function index(AccountApiRequest $request): JsonResponse
    {
        $user = $request->user();
        $code = $this->referrals->codeFor($user);

        $referrals = Referral::query()
            ->where('referrer_id', $user->id)
            ->with('referee:id,username')
            ->orderByDesc('created_at')
            ->get();

        $credit = 0;
        if (!empty($user->stripe_id)) {
            try {
                // A negative Stripe balance is money owed to the customer.
                $credit = max(0, -$user->rawBalance()) / 100;
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return response()->json([
            'enabled' => $this->referrals->enabled(),
            'code' => $code,
            'link' => url('/auth/register?ref=' . $code),
            'terms' => [
                'discount_percent' => (int) config('referral.referee_discount_percent'),
                'reward_amount' => (float) config('referral.reward_amount'),
                'required_paid_months' => (int) config('referral.required_paid_months'),
            ],
            'credit' => $credit,
            'total_earned' => (float) $referrals->where('status', Referral::STATUS_REWARDED)->sum('reward_amount'),
            'referrals' => $referrals->map(fn (Referral $referral) => [
                'name' => Str::mask($referral->referee->username ?? '?', '*', 2),
                'status' => $referral->status,
                'paid_months' => count($referral->paid_invoice_ids ?? []),
                'reward_amount' => $referral->reward_amount,
                'created_at' => $referral->created_at->toIso8601String(),
            ])->values(),
        ]);
    }
}
