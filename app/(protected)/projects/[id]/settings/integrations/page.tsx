'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {createJSClient} from "@/lib/supabase/client";

type Integration = {
    provider: string;
    status: 'connected' | 'not_connected';
    external_id: string | null;
    expires_at: string | null;
};

export default function ProjectIntegrationsPage() {
    const params = useParams();
    const projectId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [integrations, setIntegrations] = useState<Integration[]>([]);

    useEffect(() => {
        const fetchIntegrations = async () => {
            const supabase = createJSClient();
            const { data, error } = await supabase
                .from('integrations')
                .select('provider, status, external_id, expires_at')
                .eq('project_id', projectId);

            if (!error && data) {
                setIntegrations(data);
            } else {
                console.error('Error loading integrations', error);
            }

            setLoading(false);
        };

        if (projectId) fetchIntegrations();
    }, [projectId]);

    const renderStatusBadge = (status: Integration['status']) => {
        return (
            <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
                {status === 'connected' ? 'Connected' : 'Not Connected'}
            </Badge>
        );
    };

    return (
        <main className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold mb-6">Integrations</h1>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {['google_analytics', 'google_ads'].map((provider) => {
                        const integration = integrations.find((i) => i.provider === provider);
                        const isConnected = integration?.status === 'connected';

                        return (
                            <Card key={provider}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {provider === 'google_analytics' ? 'Google Analytics 4' : 'Google Ads'}
                                        {renderStatusBadge(integration?.status || 'not_connected')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-2">
                                    <div>
                                        <strong>External ID:</strong>{' '}
                                        {integration?.external_id || '—'}
                                    </div>
                                    <div>
                                        <strong>Expires:</strong>{' '}
                                        {integration?.expires_at
                                            ? new Date(integration.expires_at).toLocaleString()
                                            : '—'}
                                    </div>
                                    <Button size="sm" className="mt-4" variant={isConnected ? 'secondary' : 'default'}>
                                        {isConnected ? 'Reconnect' : 'Connect'}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </main>
    );
}