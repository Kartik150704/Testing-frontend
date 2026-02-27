"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ResultDisplay, { saveToStorage, getFromStorage } from "./ResultDisplay";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5003/api";

export default function FileUploadParser() {
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [solutionsFile, setSolutionsFile] = useState<File | null>(null);
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const history = getFromStorage();
    if (history.length > 0) {
      setResult(history[0].data);
    }
  }, []);

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
    if (chapter) {
      formData.append("chapter", chapter);
    }

    try {
      const response = await fetch(`${API_BASE}/latex/parse`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
      if (data.success) {
        saveToStorage(data, "/api/latex/parse");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (data: unknown) => {
    setResult(data);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Parse LaTeX Files
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload LaTeX question and solution files to get parsed JSON with tags.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="questions-file" className="text-foreground">
              Questions File (.tex) *
            </Label>
            <input
              id="questions-file"
              type="file"
              accept=".tex"
              onChange={(e) => setQuestionsFile(e.target.files?.[0] || null)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground file:font-medium"
            />
            {questionsFile && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" />
                {questionsFile.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="solutions-file" className="text-foreground">
              Solutions File (.tex) *
            </Label>
            <input
              id="solutions-file"
              type="file"
              accept=".tex"
              onChange={(e) => setSolutionsFile(e.target.files?.[0] || null)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground file:font-medium"
            />
            {solutionsFile && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" />
                {solutionsFile.name}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chapter" className="text-foreground">
            Chapter (optional)
          </Label>
          <Input
            id="chapter"
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g., Relations and Functions"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !questionsFile || !solutionsFile}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Parse MCQs
            </>
          )}
        </Button>
      </form>
      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}
      {result != null && <ResultDisplay data={result} onLoadHistory={handleLoadHistory} />}
    </div>
  );
}
