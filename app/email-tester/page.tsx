"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SendTestEmail from "./components/SendTestEmail";
import VerifySmtp from "./components/VerifySmtp";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const tabs: { id: string; label: string; description: string }[] = [
  { id: "send-email", label: "Send Test Email", description: "POST /api/email/test" },
  { id: "verify-smtp", label: "Verify SMTP", description: "POST /api/email/verify" },
];

export default function EmailTesterPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Email Tester</h1>
              <p className="text-sm text-muted-foreground">SMTP Testing Interface</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="send-email" className="w-full">
          <TabsList className="mb-6 flex w-full flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-start gap-0.5 px-4 py-3">
                <span className="font-medium">{tab.label}</span>
                <span className="text-xs opacity-70">{tab.description}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="send-email">
            <Card>
              <CardContent className="p-6">
                <SendTestEmail />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="verify-smtp">
            <Card>
              <CardContent className="p-6">
                <VerifySmtp />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
