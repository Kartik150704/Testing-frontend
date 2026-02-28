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
  const result = data as ParseResult;

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
          <div className="font-medium text-destructive">Error</div>
          <div className="text-sm text-destructive/90">
            {result.error || "Unknown error occurred"}
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

  const difficultyVariant = (d: string) => {
    if (d === "easy") return "outline" as const;
    if (d === "medium") return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <Badge variant="default">Q{question.id}</Badge>
          <div className="flex gap-1.5">
            <Badge variant={difficultyVariant(question.tags.difficulty)}>
              {question.tags.difficulty}
            </Badge>
            <Badge variant="secondary">{question.tags.questionType}</Badge>
          </div>
        </div>

        <div className="mb-4 text-foreground">
          <MathRenderer
            latex={question.question}
            className="text-sm leading-relaxed"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          {Object.entries(question.options).map(([key, value]) => (
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
              <MathRenderer latex={value} className="inline flex-1" />
              {key === question.correctAnswer && (
                <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
              )}
            </div>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge variant="outline">{question.tags.topic}</Badge>
          <Badge variant="outline">{question.tags.subtopic}</Badge>
          <Badge variant="outline">{question.tags.bloomsLevel}</Badge>
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
                  latex={question.solution}
                  className="text-sm text-foreground"
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                Explanation
              </div>
              <div className="text-sm text-foreground">
                {question.explanation}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                Concepts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {question.tags.concepts.map((c, i) => (
                  <Badge key={i} variant="default">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {question.tags.skills.map((s, i) => (
                  <Badge key={i} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
