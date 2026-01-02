/**
 * 测试 markdown-it 对带空行公式的处理
 */
import { describe, it, expect } from "vitest";
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";

describe("Markdown-it Behavior", () => {
  it("should test how markdown-it handles formula with empty line", () => {
    const md = new MarkdownIt();
    md.use(texmath, {
      engine: { renderToString: (latex: string) => latex },
      delimiters: "dollars",
    });

    // 公式中间有空行
    const formulaWithEmptyLine = `$$
\\begin{align}
first \\\\

second
\\end{align}
$$`;

    const result = md.render(formulaWithEmptyLine);
    console.log("=== markdown-it render (with empty line) ===");
    console.log("Input:");
    console.log(formulaWithEmptyLine);
    console.log("\nOutput:");
    console.log(result);
  });

  it("should test formula without empty line", () => {
    const md = new MarkdownIt();
    md.use(texmath, {
      engine: { renderToString: (latex: string) => latex },
      delimiters: "dollars",
    });

    // 公式中间没有空行
    const formulaNoEmptyLine = `$$
\\begin{align}
first \\\\
second
\\end{align}
$$`;

    const result = md.render(formulaNoEmptyLine);
    console.log("=== markdown-it render (no empty line) ===");
    console.log("Input:");
    console.log(formulaNoEmptyLine);
    console.log("\nOutput:");
    console.log(result);
  });

  it("should test user reported complex formula", () => {
    const md = new MarkdownIt();
    md.use(texmath, {
      engine: { renderToString: (latex: string) => `[MATH:${latex.substring(0, 50)}...]` },
      delimiters: "dollars",
    });

    const formula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|}
\\end{cases}
\\end{align}
$$`;

    const result = md.render(formula);
    console.log("=== User formula (with empty line in middle) ===");
    console.log("Contains [MATH:", result.includes("[MATH:"));
    console.log("\nOutput:");
    console.log(result);
  });
});
