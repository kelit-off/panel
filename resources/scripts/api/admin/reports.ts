import http from '@/api/http';

export interface ContentReport {
    id: number;
    reporterName: string;
    reporterEmail: string;
    category: string;
    target: string;
    description: string;
    status: 'open' | 'processed';
    adminResponse: string | null;
    handledBy: string | null;
    respondedAt: Date | null;
    createdAt: Date;
}

const transform = (data: any): ContentReport => ({
    id: data.id,
    reporterName: data.reporter_name,
    reporterEmail: data.reporter_email,
    category: data.category,
    target: data.target,
    description: data.description,
    status: data.status,
    adminResponse: data.admin_response,
    handledBy: data.handled_by,
    respondedAt: data.responded_at ? new Date(data.responded_at) : null,
    createdAt: new Date(data.created_at),
});

export const getReports = async (): Promise<ContentReport[]> => {
    const { data } = await http.get('/api/application/reports');

    return data.data.map(transform);
};

export const respondToReport = async (id: number, response: string): Promise<ContentReport> => {
    const { data } = await http.post(`/api/application/reports/${id}/respond`, { response });

    return transform(data.data);
};
