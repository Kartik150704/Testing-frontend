"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface PreviewResult {
  success: boolean;
  mode: string;
  stats: {
    questionsFound: number;
    solutionsFound: number;
    paired: number;
    unpairedQuestions: number;
    unpairedSolutions: number;
  };
  questions: { id: number; preview: string }[];
  solutions: { id: number; preview: string }[];
  paired: { id: number; questionPreview: string; solutionPreview: string }[];
  error?: string;
}

export default function PreviewParser() {
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [solutionsFile, setSolutionsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionsFile || !solutionsFile) {
      setError("Both files are required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("questionsFile", questionsFile);
    formData.append("solutionsFile", solutionsFile);

    try {
      const response = await fetch(`${API_BASE}/latex/preview`, {
        method: "POST",
        body: formData,
      });
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
        <h2 className="text-xl font-semibold text-foreground">
          Preview Split (No AI)
        </h2>
        <p className="text-sm text-muted-foreground">
          Preview how files will be split without AI processing. Useful for
          testing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="questions-file">Questions File (.tex) *</Label>
            <input
              id="questions-file"
              type="file"
              accept=".tex"
              onChange={(e) => setQuestionsFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground"
            />
            {questionsFile && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3" />
                {questionsFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutions-file">Solutions File (.tex) *</Label>
            <input
              id="solutions-file"
              type="file"
              accept=".tex"
              onChange={(e) => setSolutionsFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground"
            />
            {solutionsFile && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3" />
                {solutionsFile.name}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !questionsFile || !solutionsFile}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Preview Split"
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          {result.success ? (
            <>
              <div className="grid gap-4 md:grid-cols-5">
                <StatCard
                  label="Questions Found"
                  value={result.stats.questionsFound}
                />
                <StatCard
                  label="Solutions Found"
                  value={result.stats.solutionsFound}
                />
                <StatCard
                  label="Paired"
                  value={result.stats.paired}
                  highlight
                />
                <StatCard
                  label="Unpaired Q"
                  value={result.stats.unpairedQuestions}
                  warning={result.stats.unpairedQuestions > 0}
                />
                <StatCard
                  label="Unpaired S"
                  value={result.stats.unpairedSolutions}
                  warning={result.stats.unpairedSolutions > 0}
                />
              </div>

              {result.paired.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-foreground">
                    Paired Questions & Solutions
                  </h3>
                  <div className="space-y-3">
                    {result.paired.map((pair) => (
                      <Card key={pair.id}>
                        <CardContent className="p-4">
                          <div className="mb-2 text-sm font-medium text-primary">
                            Question {pair.id}
                          </div>
                          <div className="mb-3 rounded bg-muted p-2 font-mono text-xs text-foreground">
                            {pair.questionPreview}
                          </div>
                          <Separator className="my-3" />
                          <div className="mb-2 text-sm font-medium text-primary">
                            Solution {pair.id}
                          </div>
                          <div className="rounded bg-muted p-2 font-mono text-xs text-foreground">
                            {pair.solutionPreview}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              {result.error || "Preview failed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  warning,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div
          className={`text-2xl font-bold ${
            highlight
              ? "text-primary"
              : warning
                ? "text-destructive"
                : "text-foreground"
          }`}
        >
          {value}
        </div>
        <Badge
          variant={highlight ? "default" : warning ? "destructive" : "secondary"}
          className="mt-2"
        >
          {label}
        </Badge>
      </CardContent>
    </Card>
  );
}
