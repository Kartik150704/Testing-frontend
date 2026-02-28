"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUploadParser from "./components/FileUploadParser";
import JsonParser from "./components/JsonParser";
import PreviewParser from "./components/PreviewParser";
import HealthCheck from "./components/HealthCheck";
import MathPreview from "./components/MathPreview";
import LatexEditor from "./components/LatexEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const tabs: { id: string; label: string; description: string }[] = [
  { id: "file-upload", label: "File Upload", description: "POST /api/latex/parse" },
  { id: "json-parse", label: "JSON Parse", description: "POST /api/latex/parse-text" },
  { id: "preview", label: "Preview Split", description: "POST /api/latex/preview" },
  { id: "health", label: "Health Check", description: "GET /api/latex/health" },
  { id: "math-preview", label: "Math Preview", description: "Test MathJax Renderer" },
  { id: "latex-editor", label: "LaTeX Editor", description: "Split View Editor & Preview" },
];

export default function LatexParserPage() {
  const [activeTab, setActiveTab] = useState("file-upload");

  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash.replace('#', '');
    if (hash && tabs.some(tab => tab.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">LaTeX MCQ Parser</h1>
              <p className="text-sm text-muted-foreground">API Testing Interface</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex w-full flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-start gap-0.5 px-4 py-3">
                <span className="font-medium">{tab.label}</span>
                <span className="text-xs opacity-70">{tab.description}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="file-upload">
            <Card>
              <CardContent className="p-6">
                <FileUploadParser />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="json-parse">
            <Card>
              <CardContent className="p-6">
                <JsonParser />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preview">
            <Card>
              <CardContent className="p-6">
                <PreviewParser />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="health">
            <Card>
              <CardContent className="p-6">
                <HealthCheck />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="math-preview">
            <Card>
              <CardContent className="p-6">
                <MathPreview />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="latex-editor">
            <Card>
              <CardContent className="p-6">
                <LatexEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
