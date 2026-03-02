"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = "http://localhost:5003/api";

interface VerifyResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
}

const DEFAULT_SMTP = {
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_user: "",
  smtp_password: "",
};

export default function VerifySmtp() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [formData, setFormData] = useState(DEFAULT_SMTP);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "smtp_port" ? parseInt(value) || 0 : value,
    }));
  };

  const verifyConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        message: "Request failed",
        error: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Verify SMTP Connection</h2>
        <p className="text-sm text-muted-foreground">
          Test your SMTP credentials without sending an email. Useful for validating configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-3 font-medium text-foreground">SMTP Configuration</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    name="smtp_host"
                    value={formData.smtp_host}
                    onChange={handleChange}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">Port</Label>
                  <Input
                    id="smtp_port"
                    name="smtp_port"
                    type="number"
                    value={formData.smtp_port}
                    onChange={handleChange}
                    placeholder="587"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="smtp_user">SMTP Username</Label>
                <Input
                  id="smtp_user"
                  name="smtp_user"
                  type="email"
                  value={formData.smtp_user}
                  onChange={handleChange}
                  placeholder="your-email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_password">SMTP Password / App Password</Label>
                <Input
                  id="smtp_password"
                  name="smtp_password"
                  type="password"
                  value={formData.smtp_password}
                  onChange={handleChange}
                  placeholder="Your app password"
                />
              </div>
            </div>
          </div>

          <Button onClick={verifyConnection} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                Verify Connection
              </>
            )}
          </Button>
        </div>

        <div>
          {result && (
            <div>
              {result.success ? (
                <Card className="border-green-500/50 bg-green-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="size-5" />
                      Connection Verified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 dark:text-green-400">{result.message}</p>
                    <div className="mt-3 rounded-lg bg-background/50 p-3">
                      <Badge variant="outline" className="mb-2">
                        Configuration
                      </Badge>
                      <div className="space-y-1 text-sm text-foreground">
                        <p>
                          <span className="text-muted-foreground">Host:</span> {formData.smtp_host}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Port:</span> {formData.smtp_port}
                        </p>
                        <p>
                          <span className="text-muted-foreground">User:</span> {formData.smtp_user}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <XCircle className="size-5" />
                      Connection Failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-destructive">{result.error || result.message}</p>
                    {result.details && (
                      <div className="rounded-lg bg-background/50 p-3">
                        <Badge variant="destructive" className="mb-2">
                          Details
                        </Badge>
                        <p className="text-sm text-foreground">{result.details}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Common SMTP Ports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded bg-muted p-2">
                  <span className="text-muted-foreground">Port 587</span>
                  <Badge variant="secondary">TLS (Recommended)</Badge>
                </div>
                <div className="flex items-center justify-between rounded bg-muted p-2">
                  <span className="text-muted-foreground">Port 465</span>
                  <Badge variant="secondary">SSL</Badge>
                </div>
                <div className="flex items-center justify-between rounded bg-muted p-2">
                  <span className="text-muted-foreground">Port 25</span>
                  <Badge variant="outline">Unencrypted (Not recommended)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Authentication failed?</strong> Make sure you&apos;re using an App Password
                if 2FA is enabled.
              </p>
              <p>
                <strong>Connection timeout?</strong> Check if your firewall allows outbound
                connections on the SMTP port.
              </p>
              <p>
                <strong>Invalid credentials?</strong> Verify your username is the full email
                address.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
