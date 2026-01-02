/**
 * 精确定位复杂公式解析问题
 */
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Complex Formula Debug", () => {

  const findAllMathNodes = (node: any): any[] => {
    const results: any[] = [];
    if (node.type === "math") {
      results.push(node);
    }
    if (node.content) {
      for (const child of node.content) {
        results.push(...findAllMathNodes(child));
      }
    }
    return results;
  };

  const testFormula = (name: string, formula: string) => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        MarkdownLatexParser,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    editor.commands.setContent(formula);
    const mathNodes = findAllMathNodes(editor.getJSON());
    
    console.log(name + ":", mathNodes.length > 0 ? "✓ OK" : "✗ FAILED");
    if (mathNodes.length === 0) {
      console.log("  Content:", JSON.stringify(editor.getJSON()).substring(0, 200));
    }
    
    editor.destroy();
    return mathNodes.length > 0;
  };

  it("should test progressively complex formulas", () => {
    // 简单公式 - 用户说这个可以
    const simple = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases}
\\end{align}
$$`;

    // 有空行的版本
    const withEmptyLine = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & x
\\end{cases} \\\\

  \\text{far field approximation:} & y
\\end{align}
$$`;

    // 嵌套 cases 的完整版本
    const nested = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = x \\\\
\\frac{\\omega}{c}|\\vec{r}-\\vec{\\xi} | & = y
\\end{cases}
\\end{align}
$$`;

    // 用户报告的完整公式
    const fullFormula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|} + (-\\vec{\\xi})\\cdot \\nabla \\frac{1}{|\\vec{r}|} + ((-\\vec{\\xi})\\cdot \\nabla)^{2} \\frac{1}{|\\vec{r}|} + \\dots & \\sim\\frac{{1}}{|r|}\\\\
\\frac{\\omega}{c}|\\vec{r}-\\vec{\\xi} | & = \\frac{\\omega}{c}\\times(|\\vec{r}| + (-\\vec{\\xi})\\cdot \\nabla |\\vec{r}| + \\dots) & \\\\
 & \\sim \\overset{\\text{Electrical Dipole} }{\\vec{k}\\cdot \\vec{r}} - \\overset{\\text{Magnetic Dipole and Electrical quadrupole}}{\\underline{\\underline{\\underline{ \\vec{k}\\cdot \\vec{\\xi} }}}}
\\end{cases}
\\end{align}
$$`;

    console.log("=== Testing formula complexity ===");
    
    const r1 = testFormula("1. Simple (no empty line)", simple);
    const r2 = testFormula("2. With empty line", withEmptyLine);
    const r3 = testFormula("3. Nested cases", nested);
    const r4 = testFormula("4. Full complex", fullFormula);

    expect(r1).toBe(true);
    expect(r2).toBe(true);
    expect(r3).toBe(true);
    expect(r4).toBe(true);
  });

  it("should test markdown parser directly on complex formula", () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        MarkdownLatexParser,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    const fullFormula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|} + (-\\vec{\\xi})\\cdot \\nabla \\frac{1}{|\\vec{r}|} + ((-\\vec{\\xi})\\cdot \\nabla)^{2} \\frac{1}{|\\vec{r}|} + \\dots & \\sim\\frac{{1}}{|r|}\\\\
\\frac{\\omega}{c}|\\vec{r}-\\vec{\\xi} | & = \\frac{\\omega}{c}\\times(|\\vec{r}| + (-\\vec{\\xi})\\cdot \\nabla |\\vec{r}| + \\dots) & \\\\
 & \\sim \\overset{\\text{Electrical Dipole} }{\\vec{k}\\cdot \\vec{r}} - \\overset{\\text{Magnetic Dipole and Electrical quadrupole}}{\\underline{\\underline{\\underline{ \\vec{k}\\cdot \\vec{\\xi} }}}}
\\end{cases}
\\end{align}
$$`;

    const storage = editor.storage.markdown;
    if (storage && storage.parser) {
      const html = storage.parser.parse(fullFormula);
      console.log("=== Markdown parser output ===");
      console.log("Contains data-type=math:", html.includes('data-type="math"'));
      console.log("HTML preview:", html.substring(0, 300));
      
      if (!html.includes('data-type="math"')) {
        console.log("FULL HTML:", html);
      }
    }

    editor.destroy();
  });
});
