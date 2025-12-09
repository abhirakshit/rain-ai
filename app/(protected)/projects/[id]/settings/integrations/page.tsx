'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createJSClient } from '@/lib/supabase/client'
import {useAuth} from "@/hooks/authContext";

type IntegrationProvider = 'google_analytics' | 'google_ads'

type Integration = {
    provider: IntegrationProvider
    status: 'connected' | 'not_connected'
    external_id: string | null
    expires_at: string | null
}

const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
    google_analytics: 'Google Analytics 4',
    google_ads: 'Google Ads',
}

export default function ProjectIntegrationsPage() {
    const params = useParams()
    const { user } = useAuth();
    const projectId = params?.id as string

    const [loading, setLoading] = useState(true)
    const [integrations, setIntegrations] = useState<Integration[]>([])

    useEffect(() => {
        const fetchIntegrations = async () => {
            const supabase = createJSClient()
            const { data, error } = await supabase
                .from('project_integrations')
                .select('provider, external_id, expires_at')
                .eq('project_id', projectId)

            if (!error && data) {
                const enriched: Integration[] = ['google_analytics', 'google_ads'].map((provider) => {
                    const match = data.find((d) => d.provider === provider)
                    return {
                        provider,
                        status: match ? 'connected' : 'not_connected',
                        external_id: match?.external_id || null,
                        expires_at: match?.expires_at || null,
                    }
                })
                setIntegrations(enriched)
            } else {
                console.error('Error loading integrations', error)
            }

            setLoading(false)
        }

        if (projectId) fetchIntegrations()
    }, [projectId])

    const handleConnect = async (provider: IntegrationProvider) => {
        if (!user || !user.id) {
            alert("Please sign in to connect integrations.");
            return;
        }

        const state = encodeURIComponent(JSON.stringify({ projectId }));
        const res = await fetch(`/api/oauth/${provider}/start?state=${state}`);
        const { url } = await res.json();
        window.location.href = url;
    };

    const renderStatusBadge = (status: Integration['status']) => {
        return (
            <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
                {status === 'connected' ? 'Connected' : 'Not Connected'}
            </Badge>
        )
    }

    return (
        <main className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold mb-6">Integrations</h1>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {integrations.map((integration) => {
                        const isConnected = integration.status === 'connected'

                        return (
                            <Card key={integration.provider}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {PROVIDER_LABELS[integration.provider]}
                                        {renderStatusBadge(integration.status)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-2">
                                    <div>
                                        <strong>External ID:</strong>{' '}
                                        {integration.external_id || '—'}
                                    </div>
                                    <div>
                                        <strong>Expires:</strong>{' '}
                                        {integration.expires_at
                                            ? new Date(integration.expires_at).toLocaleString()
                                            : '—'}
                                    </div>
                                    <Button
                                        size="sm"
                                        className="mt-4"
                                        variant={isConnected ? 'secondary' : 'default'}
                                        onClick={() => handleConnect(integration.provider)}
                                    >
                                        {isConnected ? 'Reconnect' : 'Connect'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </main>
    )
}