"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import MathRenderer from "./MathRenderer";

const sampleLatex = `A relation $R$ is defined from $\\{2,3,4,5\\}$ to $\\{3,6,7,10\\}$ by $x R y \\Leftrightarrow x$ is relatively prime to $y$.

The quadratic formula is:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Using equation environment:
\\begin{equation}
E = mc^2
\\end{equation}

System of equations with align:
\\begin{align}
x + y &= 10 \\\\
2x - y &= 5
\\end{align}

Consider the integral: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

Matrix example:
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$

Summation: $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

Set notation: $x \\in A$ but $y \\notin B$

Greek letters: $\\alpha, \\beta, \\gamma, \\Delta, \\Omega$

Fractions and roots: $\\frac{1}{\\sqrt{2\\pi}} e^{-x^2/2}$

Cases:
$$f(x) = \\begin{cases}
x^2 & \\text{if } x \\geq 0 \\\\
-x & \\text{if } x < 0
\\end{cases}$$`;

export default function LatexEditor() {
  const [latex, setLatex] = useState(sampleLatex);
  const [renderedLatex, setRenderedLatex] = useState(sampleLatex);
  const [key, setKey] = useState(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounce the rendering to avoid too many updates
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setRenderedLatex(latex);
      setKey((k) => k + 1);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [latex]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">LaTeX Editor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit LaTeX on the left and see the compiled result on the right in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - Editor */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">LaTeX Source</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Use $ for inline math and $$ for display math
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="font-mono text-sm resize-none min-h-[400px] w-full"
              placeholder="Enter your LaTeX code here..."
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Characters: {latex.length} | Lines: {latex.split('\n').length}
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Compiled Result */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Compiled Output</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live preview of your LaTeX (updates after 0.5s)
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="min-h-[400px] p-4 bg-muted/30 rounded-md overflow-auto">
              {renderedLatex ? (
                <MathRenderer
                  key={key}
                  latex={renderedLatex}
                  className="text-foreground leading-relaxed"
                />
              ) : (
                <div className="text-muted-foreground italic">
                  Start typing LaTeX to see the preview...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Reference Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Math */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Basic Math</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Inline Math:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">$x^2$</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Display Math:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">$$x^2$$</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Fraction:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">\frac{"{a}"}{"{b}"}</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Square Root:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">\sqrt{"{x}"}</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Summation:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">\sum_{"{i=1}"}^{"{n}"}</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Integral:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">\int_{"{a}"}^{"{b}"}</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Greek Letters:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">\alpha \beta</code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Set Notation:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">\in \notin</code>
                </div>
              </div>
            </div>

            {/* Environments */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Math Environments</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Equation (numbered):</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs whitespace-pre">
{`\\begin{equation}
  E = mc^2
\\end{equation}`}
                  </code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Align (multi-line):</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs whitespace-pre">
{`\\begin{align}
  x + y &= 10 \\\\
  2x - y &= 5
\\end{align}`}
                  </code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Matrix:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs whitespace-pre">
{`\\begin{pmatrix}
  a & b \\\\
  c & d
\\end{pmatrix}`}
                  </code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Cases:</div>
                  <code className="block bg-muted px-2 py-1 rounded text-xs whitespace-pre">
{`\\begin{cases}
  x^2 & x \\geq 0 \\\\
  -x & x < 0
\\end{cases}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

