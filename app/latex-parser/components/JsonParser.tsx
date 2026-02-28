"use client";

import { useState, useEffect } from "react";
import { Loader2, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResultDisplay, { saveToStorage, getFromStorage } from "./ResultDisplay";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const sampleInput = {
  chapter: "Relations and Functions",
  questions: [
    {
      id: 1,
      question: `A relation $R$ is defined from $\\{2,3,4,5\\}$ to $\\{3,6,7,10\\}$ by $x R y \\Leftrightarrow x$ is relatively prime to $y$. Then, domain of $R$ is:\\\\
(a) $\\{2,3,5\\}$\\\\
(b) $\\{3,5\\}$\\\\
(c) $\\{2,3,4\\}$\\\\
(d) $\\{2,3,4,5\\}$`,
      solution: `Domain of $R=\\{2,3,4,5\\}$\\\\
$\\therefore$ Option $(d)$ is correct.`,
    },
    {
      id: 2,
      question: `The function $f: \\mathbb{R} \\rightarrow \\mathbb{R}$ given by $f(x)=2x-3$ is:\\\\
(a) one-one and onto\\\\
(b) many-one and onto\\\\
(c) one-one and into\\\\
(d) many one and into`,
      solution: `$f(x)=2x-3$ is one-one and onto.\\\\
$\\therefore$ Option (a) is correct.`,
    },
  ],
};

export default function JsonParser() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleInput, null, 2));
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
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Validate JSON first
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (parseErr) {
        throw new Error(`Invalid JSON: ${parseErr instanceof Error ? parseErr.message : 'Parse error'}`);
      }
      
      // Validate required fields
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("JSON must contain a 'questions' array");
      }
      
      if (parsed.questions.length === 0) {
        throw new Error("Questions array cannot be empty");
      }
      
      const response = await fetch(`${API_BASE}/latex/parse-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error("No data received from server");
      }
      
      setResult(data);
      if (data.success) {
        saveToStorage(data, "/api/latex/parse-text");
      }
    } catch (err) {
      console.error("Parse error:", err);
      setError(err instanceof Error ? err.message : "Request failed. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (data: unknown) => {
    setResult(data);
  };
  const loadSample = () => {
    setJsonInput(JSON.stringify(sampleInput, null, 2));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Parse LaTeX from JSON</h2>
        <p className="text-sm text-muted-foreground">Parse LaTeX MCQs from JSON input (no file upload needed).</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="json-input" className="text-foreground">
              JSON Input
            </Label>
            <Button type="button" variant="link" size="xs" onClick={loadSample}>
              <FileJson className="size-3" />
              Load Sample
            </Button>
          </div>
          <Textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={16}
            className="font-mono"
            placeholder="Enter JSON with chapter and questions array..."
          />
        </div>
        <Button type="submit" disabled={loading || !jsonInput.trim()}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Parsing...
            </>
          ) : (
            "Parse MCQs"
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
