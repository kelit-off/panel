import http from '@/api/http';

export interface ServerDomain {
    id: number;
    domain: string;
    isVerified: boolean;
    verifiedAt: Date | null;
    lastCheckedAt: Date | null;
    createdAt: Date;
}

export interface ServerDomainList {
    domains: ServerDomain[];
    targetIps: string[];
    domainLimit: number;
}

const toServerDomain = (data: any): ServerDomain => ({
    id: data.id,
    domain: data.domain,
    isVerified: data.is_verified,
    verifiedAt: data.verified_at ? new Date(data.verified_at) : null,
    lastCheckedAt: data.last_checked_at ? new Date(data.last_checked_at) : null,
    createdAt: new Date(data.created_at),
});

export const getServerDomains = async (uuid: string): Promise<ServerDomainList> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/domains`);

    return {
        domains: (data.data || []).map((item: any) => toServerDomain(item.attributes)),
        targetIps: data.meta?.target_ips || [],
        domainLimit: data.meta?.domain_limit || 0,
    };
};

export const createServerDomain = async (uuid: string, domain: string): Promise<ServerDomain> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/domains`, { domain });

    return toServerDomain(data.attributes);
};

export const verifyServerDomain = async (uuid: string, id: number): Promise<ServerDomain> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/domains/${id}/verify`);

    return toServerDomain(data.attributes);
};

export const deleteServerDomain = async (uuid: string, id: number): Promise<void> => {
    await http.delete(`/api/client/servers/${uuid}/domains/${id}`);
};
