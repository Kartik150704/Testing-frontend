"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Trash2, RotateCcw, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MathRenderer from "./MathRenderer";

interface ParsedQuestion {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: string;
  solution: string;
  explanation: string;
  tags: {
    difficulty: string;
    chapter: string;
    topic: string;
    subtopic: string;
    concepts: string[];
    skills: string[];
    questionType: string;
    bloomsLevel: string;
  };
}

interface ParseResult {
  success: boolean;
  metadata?: {
    totalQuestions: number;
    successfullyParsed: number;
    failed: number;
    processingMode: string;
    totalProcessingTime: string;
    parsedAt: string;
    llmProvider: string;
    chapter?: string;
    sourceFiles?: {
      questions: string;
      solutions: string;
    };
    splitStats?: {
      questionsFound: number;
      solutionsFound: number;
      paired: number;
      unpairedQuestions: number;
      unpairedSolutions: number;
    };
  };
  questions?: ParsedQuestion[];
  errors?: string[];
  error?: string;
}

const STORAGE_KEY = "latex-parser-results";

export function saveToStorage(data: unknown, endpoint: string) {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const history = existing ? JSON.parse(existing) : [];
    history.unshift({
      id: Date.now(),
      endpoint,
      timestamp: new Date().toISOString(),
      data,
    });
    const trimmed = history.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function getFromStorage(): Array<{
  id: number;
  endpoint: string;
  timestamp: string;
  data: unknown;
}> {
  try {
    if (typeof window === "undefined") return [];
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

interface ResultDisplayProps {
  data: unknown;
  showHistory?: boolean;
  onLoadHistory?: (data: unknown) => void;
}

export default function ResultDisplay({
  data,
  showHistory = true,
  onLoadHistory,
}: ResultDisplayProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw" | "history">(
    "formatted"
  );
  const [history, setHistory] = useState<ReturnType<typeof getFromStorage>>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Add error handling for data parsing
  let result: ParseResult;
  try {
    result = data as ParseResult;
    // Validate result structure
    if (typeof result !== 'object' || result === null) {
      result = {
        success: false,
        error: "Invalid response format received from server"
      };
    }
  } catch (err) {
    result = {
      success: false,
      error: `Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }

  const loadHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      setHistory(getFromStorage());
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = () => {
    clearStorage();
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: (typeof history)[0]) => {
    if (onLoadHistory) {
      onLoadHistory(item.data);
    }
  };

  if (!result.success) {
    return (
      <Card className="mt-6 border-destructive/50 bg-destructive/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-destructive">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-destructive mb-1">Parsing Failed</div>
              <div className="text-sm text-destructive/90">
                {result.error || "An unknown error occurred during parsing"}
              </div>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-sm text-destructive/80 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>
        <div className="flex gap-1.5">
          <Button
            variant={viewMode === "formatted" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("formatted")}
          >
            Formatted
          </Button>
          <Button
            variant={viewMode === "raw" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("raw")}
          >
            Raw JSON
          </Button>
          {showHistory && isClient && (
            <Button
              variant={viewMode === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setViewMode("history");
                loadHistory();
              }}
            >
              <Clock className="size-3.5" />
              History ({history.length})
            </Button>
          )}
        </div>
      </div>

      {viewMode === "history" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Saved results from localStorage
            </span>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClearHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3" />
                Clear All
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No saved results yet
              </CardContent>
            </Card>
          ) : (
            history.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-foreground">
                      {item.endpoint}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleLoadHistoryItem(item)}
                  >
                    <RotateCcw className="size-3.5" />
                    Load
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : viewMode === "raw" ? (
        <Card>
          <CardContent className="p-0">
            <pre className="max-h-[600px] overflow-auto rounded-lg bg-muted p-4 font-mono text-xs text-foreground">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {result.metadata && <MetadataSection metadata={result.metadata} />}

          {result.questions && result.questions.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold text-foreground">
                Parsed Questions ({result.questions.length})
              </h4>
              <div className="space-y-4">
                {result.questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="mb-2 font-medium text-amber-700 dark:text-amber-400">
                  Warnings ({result.errors.length})
                </div>
                <ul className="list-inside list-disc text-sm text-amber-600 dark:text-amber-300">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function MetadataSection({
  metadata,
}: {
  metadata: NonNullable<ParseResult["metadata"]>;
}) {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <MetaItem label="Total" value={String(metadata.totalQuestions)} />
          <MetaItem
            label="Parsed"
            value={String(metadata.successfullyParsed)}
            className="text-green-600 dark:text-green-400"
          />
          <MetaItem
            label="Failed"
            value={String(metadata.failed)}
            className={
              metadata.failed > 0
                ? "text-destructive"
                : undefined
            }
          />
          <MetaItem label="Time" value={metadata.totalProcessingTime} />
          <MetaItem label="Provider" value={metadata.llmProvider} />
          <MetaItem label="Mode" value={metadata.processingMode} />
          {metadata.chapter && (
            <div className="md:col-span-3">
              <MetaItem label="Chapter" value={metadata.chapter} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetaItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium ${className || "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: ParsedQuestion }) {
  const [expanded, setExpanded] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Validate question data
  if (!question) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardContent className="pt-6">
          <div className="text-amber-700 dark:text-amber-400">
            Invalid question data
          </div>
        </CardContent>
      </Card>
    );
  }

  const difficultyVariant = (d: string) => {
    if (d === "easy") return "outline" as const;
    if (d === "medium") return "secondary" as const;
    return "destructive" as const;
  };

  // Safely access nested properties with fallbacks
  const tags = question.tags || {};
  const options = question.options || {};
  const questionText = question.question || "";
  const solution = question.solution || "No solution provided";
  const explanation = question.explanation || "No explanation provided";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <Badge variant="default">Q{question.id || "?"}</Badge>
          <div className="flex gap-1.5">
            {tags.difficulty && (
              <Badge variant={difficultyVariant(tags.difficulty)}>
                {tags.difficulty}
              </Badge>
            )}
            {tags.questionType && (
              <Badge variant="secondary">{tags.questionType}</Badge>
            )}
          </div>
        </div>

        {renderError ? (
          <div className="mb-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            Error rendering question: {renderError}
          </div>
        ) : (
          <div className="mb-4 text-foreground">
            <MathRenderer
              latex={questionText}
              className="text-sm leading-relaxed"
            />
          </div>
        )}

        {Object.keys(options).length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            {Object.entries(options).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-start gap-2 rounded-lg p-3 ${
                  key === question.correctAnswer
                    ? "border-2 border-green-500 bg-green-500/10"
                    : "bg-muted"
                }`}
              >
                <span className="shrink-0 font-semibold text-muted-foreground">
                  ({key})
                </span>
                <MathRenderer latex={value || ""} className="inline flex-1" />
                {key === question.correctAnswer && (
                  <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.topic && <Badge variant="outline">{tags.topic}</Badge>}
          {tags.subtopic && <Badge variant="outline">{tags.subtopic}</Badge>}
          {tags.bloomsLevel && <Badge variant="outline">{tags.bloomsLevel}</Badge>}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              Show more
            </>
          )}
        </Button>

        {expanded && (
          <div className="mt-3 space-y-4">
            <Separator />
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                Solution
              </div>
              <div className="rounded-lg bg-muted p-3">
                <MathRenderer
                  latex={solution}
                  className="text-sm text-foreground"
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                Explanation
              </div>
              <div className="text-sm text-foreground">
                {explanation}
              </div>
            </div>
            {tags.concepts && tags.concepts.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Concepts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.concepts.map((c, i) => (
                    <Badge key={i} variant="default">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {tags.skills && tags.skills.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.skills.map((s, i) => (
                    <Badge key={i} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
