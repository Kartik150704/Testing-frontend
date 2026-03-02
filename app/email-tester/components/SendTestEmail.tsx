"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = "http://localhost:5003/api";

interface EmailResponse {
  success: boolean;
  message: string;
  details?: {
    success: boolean;
    messageId: string;
    accepted: string[];
    rejected: string[];
  };
  error?: string;
  missingFields?: string[];
}

const DEFAULT_SMTP = {
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_user: "",
  smtp_password: "",
  to_email: "",
  subject: "Test Email from VK Publications",
  message: "Hello! This is a test email sent from the Email Tester interface.",
};

export default function SendTestEmail() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_SMTP);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "smtp_port" ? parseInt(value) || 0 : value,
    }));
  };

  const sendEmail = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/email/test`, {
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

  const copyMessageId = async (messageId: string) => {
    await navigator.clipboard.writeText(messageId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Send Test Email</h2>
        <p className="text-sm text-muted-foreground">
          Send a test email using your SMTP configuration to verify email delivery.
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

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-3 font-medium text-foreground">Email Details</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="to_email">Recipient Email</Label>
                <Input
                  id="to_email"
                  name="to_email"
                  type="email"
                  value={formData.to_email}
                  onChange={handleChange}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Test Email"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your email message..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <Button onClick={sendEmail} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send Test Email
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
                      Email Sent Successfully
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-green-700 dark:text-green-400">{result.message}</p>
                    {result.details && (
                      <div className="space-y-2">
                        <div className="rounded-lg bg-background/50 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <Badge variant="outline">Message ID</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessageId(result.details!.messageId)}
                            >
                              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                            </Button>
                          </div>
                          <code className="break-all text-xs text-foreground">
                            {result.details.messageId}
                          </code>
                        </div>
                        {result.details.accepted.length > 0 && (
                          <div className="rounded-lg bg-background/50 p-3">
                            <Badge variant="outline" className="mb-1">
                              Accepted
                            </Badge>
                            <div className="text-sm text-foreground">
                              {result.details.accepted.join(", ")}
                            </div>
                          </div>
                        )}
                        {result.details.rejected.length > 0 && (
                          <div className="rounded-lg bg-background/50 p-3">
                            <Badge variant="destructive" className="mb-1">
                              Rejected
                            </Badge>
                            <div className="text-sm text-foreground">
                              {result.details.rejected.join(", ")}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <XCircle className="size-5" />
                      Failed to Send Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-destructive">{result.error || result.message}</p>
                    {result.missingFields && result.missingFields.length > 0 && (
                      <div className="rounded-lg bg-background/50 p-3">
                        <Badge variant="destructive" className="mb-2">
                          Missing Fields
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {result.missingFields.map((field) => (
                            <Badge key={field} variant="outline">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Gmail SMTP:</strong> smtp.gmail.com, Port 587 (TLS)
              </p>
              <p>
                <strong>Outlook SMTP:</strong> smtp.office365.com, Port 587
              </p>
              <p>
                <strong>Yahoo SMTP:</strong> smtp.mail.yahoo.com, Port 587
              </p>
              <p className="mt-2 rounded bg-amber-500/10 p-2 text-amber-700 dark:text-amber-400">
                For Gmail with 2FA, use an App Password from{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google Account Settings
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
