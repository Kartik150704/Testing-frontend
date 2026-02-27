"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MathRenderer from "./MathRenderer";

const sampleLatex = `A relation $R$ is defined from $\\{2,3,4,5\\}$ to $\\{3,6,7,10\\}$ by $x R y \\Leftrightarrow x$ is relatively prime to $y$.

The quadratic formula is: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Consider the integral: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

Matrix example:
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$`;

export default function MathPreview() {
  const [latex, setLatex] = useState(sampleLatex);
  const [key, setKey] = useState(0);

  const handleRender = () => {
    setKey((k) => k + 1);
  };
  const loadSample = () => {
    setLatex(sampleLatex);
    setKey((k) => k + 1);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Math Preview</h2>
        <p className="text-sm text-muted-foreground">
          Test the MathJax 3 LaTeX renderer with any LaTeX code.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="latex-input" className="text-foreground">
              LaTeX Input
            </Label>
            <Button variant="link" size="xs" type="button" onClick={loadSample}>
              <RotateCcw className="size-3" />
              Load Sample
            </Button>
          </div>
          <Textarea
            id="latex-input"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            rows={14}
            className="font-mono"
            placeholder="Enter LaTeX code here..."
          />
          <Button onClick={handleRender} className="mt-3">
            <Play className="size-4" />
            Render
          </Button>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rendered Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px]">
                <MathRenderer
                  key={key}
                  latex={latex}
                  className="text-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Usage Guide</CardTitle>
          <CardDescription>
            Syntax reference for LaTeX math in the preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Inline math:</strong> Use{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                $...$
              </code>{" "}
              or{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                \(...\)
              </code>
            </p>
            <p>
              <strong className="text-foreground">Display math:</strong> Use{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                $$...$$
              </code>{" "}
              or{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                \[...\]
              </code>
            </p>
            <p>
              <strong className="text-foreground">Line breaks:</strong> Use{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                \\
              </code>{" "}
              or newlines
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base text-primary">Component Usage</CardTitle>
          <CardDescription>
            How to use MathRenderer in your code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-card p-3 text-xs text-foreground">
            {`import { MathRenderer } from "./components";

// Basic usage
<MathRenderer latex="$x^2 + y^2 = z^2$" />

// With custom styling
<MathRenderer 
  latex="$$\\int_0^1 x^2 dx$$" 
  className="text-lg"
  block={true}
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
