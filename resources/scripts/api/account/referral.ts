import useSWR, { SWRResponse } from 'swr';
import { AxiosError } from 'axios';
import http from '@/api/http';
import useUserSWRContextKey from '@/plugins/useUserSWRContextKey';

export interface ReferralEntry {
    name: string;
    status: 'pending' | 'rewarded' | 'rejected';
    paidMonths: number;
    rewardAmount: number | null;
    createdAt: Date;
}

export interface ReferralOverview {
    enabled: boolean;
    code: string;
    link: string;
    terms: { discountPercent: number; rewardAmount: number; requiredPaidMonths: number };
    credit: number;
    totalEarned: number;
    referrals: ReferralEntry[];
}

const useReferral = (): SWRResponse<ReferralOverview, AxiosError> => {
    const key = useUserSWRContextKey([ 'account', 'referral' ]);

    return useSWR(key, async () => {
        const { data } = await http.get('/api/client/referral');

        return {
            enabled: data.enabled,
            code: data.code,
            link: data.link,
            terms: {
                discountPercent: data.terms.discount_percent,
                rewardAmount: data.terms.reward_amount,
                requiredPaidMonths: data.terms.required_paid_months,
            },
            credit: data.credit,
            totalEarned: data.total_earned,
            referrals: (data.referrals as any[]).map(r => ({
                name: r.name,
                status: r.status,
                paidMonths: r.paid_months,
                rewardAmount: r.reward_amount,
                createdAt: new Date(r.created_at),
            })),
        } as ReferralOverview;
    }, { revalidateOnMount: true });
};

export { useReferral };
