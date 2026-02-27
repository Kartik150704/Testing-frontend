"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = "http://localhost:5003/api";

interface HealthResponse {
  success: boolean;
  service: string;
  status: string;
  provider: string;
  endpoint: string;
  model: string;
  error?: string;
}

export default function HealthCheck() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/latex/health`);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Health Check</h2>
        <p className="text-sm text-muted-foreground">
          Check if the LaTeX parser service is ready.
        </p>
      </div>
      <Button onClick={checkHealth} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Activity className="size-4" />
            Check Health
          </>
        )}
      </Button>
      {error && (
        <Card className="mt-4 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="size-6 text-destructive" />
              <div>
                <div className="font-medium text-destructive">Service Unavailable</div>
                <div className="text-sm text-destructive/90">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {result && (
        <div className="mt-4">
          {result.success ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-500" />
                  Service Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoRow label="Service" value={result.service} />
                  <InfoRow label="Status" value={result.status} />
                  <InfoRow label="Provider" value={result.provider} />
                  <InfoRow label="Model" value={result.model} />
                  <div className="md:col-span-2">
                    <InfoRow label="Endpoint" value={result.endpoint} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <XCircle className="size-6 text-destructive" />
                  <div>
                    <div className="font-medium text-destructive">Service Not Ready</div>
                    <div className="text-sm text-destructive/90">
                      {result.error || "Unknown error"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <Badge variant="outline" className="mb-1.5">
        {label}
      </Badge>
      <div className="font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
