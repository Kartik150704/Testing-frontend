"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import MathRenderer from "./MathRenderer";

const sampleLatex = `A relation $R$ is defined from $\\{2,3,4,5\\}$ to $\\{3,6,7,10\\}$ by $x R y \\Leftrightarrow x$ is relatively prime to $y$.

The quadratic formula is: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Consider the integral: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

Matrix example:
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$

Summation: $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

Greek letters: $\\alpha, \\beta, \\gamma, \\Delta, \\Omega$

Fractions and roots: $\\frac{1}{\\sqrt{2\\pi}} e^{-x^2/2}$

**Negation with \\not command:** $x \\not= y$, $A \\not\\subset B$, $x \\not\\in S$, $p \\not\\equiv q \\pmod{n}$

**Standard negation symbols (preferred):** $x \\neq y$, $x \\notin S$, $A \\nsubseteq B$, $x \\nleq y$, $x \\ngeq y$

**More negations:** $\\not\\exists x$, $\\not\\forall x$, $\\nmid$, $\\nparallel$, $\\nprec$

**Cancellation:** $\\frac{\\cancel{5}x}{\\cancel{5}y} = \\frac{x}{y}$, $\\bcancel{removed}$, $\\xcancel{crossed}$

**Colors:** $\\color{red}{red text}$, $\\color{blue}{blue: x^2 + y^2 = z^2}$, $\\color{green}{\\int f(x)dx}$

**Bold symbols:** $\\boldsymbol{\\alpha}$, $\\mathbf{x}$, $\\pmb{\\beta}$

**Boxed equations:** $\\boxed{E = mc^2}$, $\\boxed{\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}}$

**Quantum mechanics:** $\\bra{\\psi}$, $\\ket{\\phi}$, $\\braket{\\psi|\\phi}$, $\\bra{\\psi}\\hat{H}\\ket{\\psi}$

**Chemical formulas:** $\\ce{H2O}$, $\\ce{CO2}$, $\\ce{H2SO4}$, $\\ce{2H2 + O2 -> 2H2O}$

**Extended arrows:** $A \\xrightarrow{f} B$, $C \\xleftarrow[below]{above} D$

**Math operators:** $\\sin x$, $\\cos x$, $\\tan x$, $\\log x$, $\\ln x$, $\\lim_{x \\to 0}$

**Set notation:** $\\mathbb{R}$, $\\mathbb{N}$, $\\mathbb{Z}$, $\\mathbb{Q}$, $\\mathbb{C}$`;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Inline Math:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">$x^2$</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Display Math:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">$$x^2$$</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Fraction:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\frac{"{a}"}{"{b}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Square Root:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\sqrt{"{x}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Summation:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\sum_{"{i=1}"}^{"{n}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Integral:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\int_{"{a}"}^{"{b}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Matrix:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\begin{"{pmatrix}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Greek Letters:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\alpha \beta</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Negation:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\not= or \neq</code>
              <div className="text-xs text-muted-foreground mt-1">Use \neq, \notin, etc. for best results</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Cancel:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\cancel{"{x}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Color:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\color{"{red}"}{"{text}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Bold:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\boldsymbol{"{x}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Boxed:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\boxed{"{E=mc^2}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Bra-Ket:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\braket{"{\\psi|\\phi}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Chemistry:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\ce{"{H2O}"}</code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Extended Arrow:</div>
              <code className="block bg-muted px-2 py-1 rounded text-xs">\xrightarrow{"{text}"}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

