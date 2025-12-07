/**
 * @vitest-environment jsdom
 * 
 * 测试 MathNodeView 组件的渲染行为
 * 特别是 KaTeX CSS 导入后，确保不会出现公式双重显示问题
 */

import { describe, it, expect, beforeAll } from "vitest";
import katex from "katex";

describe("MathNodeView Rendering", () => {
  describe("KaTeX CSS Integration", () => {
    it("should produce HTML with both .katex-mathml and .katex-html elements", () => {
      const html = katex.renderToString("E=mc^2", { throwOnError: false });
      
      // KaTeX 输出两部分：
      // 1. .katex-mathml - 包含 MathML 和原始 LaTeX（用于无障碍）
      // 2. .katex-html - 实际的视觉渲染（带 aria-hidden）
      expect(html).toContain("katex-mathml");
      expect(html).toContain("katex-html");
    });

    it("should include raw LaTeX in annotation element for accessibility", () => {
      const html = katex.renderToString("\\sum_{i=1}^n i", { throwOnError: false });
      
      // <annotation encoding="application/x-tex"> 包含原始 LaTeX
      expect(html).toContain("<annotation");
      expect(html).toContain("\\sum_{i=1}^n i");
    });

    it("should mark visual rendering with aria-hidden", () => {
      const html = katex.renderToString("x^2", { throwOnError: false });
      
      // .katex-html 应该有 aria-hidden="true"
      expect(html).toContain('aria-hidden="true"');
    });

    it("should handle displayMode correctly", () => {
      const inlineHtml = katex.renderToString("x", { displayMode: false });
      const blockHtml = katex.renderToString("x", { displayMode: true });
      
      // 块级公式会有不同的渲染结构
      expect(inlineHtml).not.toBe(blockHtml);
      // 块级公式使用 katex-display class
      expect(blockHtml).toContain("katex-display");
      expect(inlineHtml).not.toContain("katex-display");
    });

    it("should handle invalid LaTeX gracefully when throwOnError is false", () => {
      // 无效的 LaTeX 不应该抛出错误
      const html = katex.renderToString("\\invalid{command}", { throwOnError: false });
      
      // 应该返回包含错误标记的 HTML (红色文本)
      expect(html).toContain("cc0000"); // KaTeX 使用红色标记无效命令
    });

    it("should throw error for invalid LaTeX when throwOnError is true", () => {
      expect(() => {
        katex.renderToString("\\invalid{", { throwOnError: true });
      }).toThrow();
    });
  });

  describe("Common LaTeX Formulas", () => {
    const testCases = [
      { name: "Einstein equation", latex: "E = mc^2" },
      { name: "Quadratic formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
      { name: "Summation", latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
      { name: "Integral", latex: "\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}" },
      { name: "Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { name: "Greek letters", latex: "\\alpha, \\beta, \\gamma, \\delta, \\epsilon" },
      { name: "Fractions", latex: "\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}" },
      { name: "Square root", latex: "\\sqrt{x^2 + y^2}" },
      { name: "Limits", latex: "\\lim_{x \\to \\infty} \\frac{1}{x} = 0" },
      { name: "Derivative", latex: "\\frac{df}{dx} = f'(x)" },
    ];

    testCases.forEach(({ name, latex }) => {
      it(`should render ${name} without error`, () => {
        expect(() => {
          const html = katex.renderToString(latex, { throwOnError: true });
          expect(html).toBeTruthy();
          expect(html.length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });
  });

  describe("CSS Import Verification", () => {
    it("should verify that katex.min.css is imported in math-node-view.tsx", async () => {
      // 这个测试验证源代码中确实导入了 CSS
      const fs = await import("fs");
      const path = await import("path");
      
      const mathNodeViewPath = path.resolve(__dirname, "../src/math-node-view.tsx");
      const content = fs.readFileSync(mathNodeViewPath, "utf-8");
      
      // 验证 CSS 导入存在
      expect(content).toContain('import "katex/dist/katex.min.css"');
    });
  });
});

describe("Edge Cases", () => {
  it("should handle empty string", () => {
    const html = katex.renderToString("", { throwOnError: false });
    expect(html).toBeTruthy();
  });

  it("should handle whitespace-only string", () => {
    const html = katex.renderToString("   ", { throwOnError: false });
    expect(html).toBeTruthy();
  });

  it("should handle very long equations", () => {
    const longEquation = Array(50).fill("x").join(" + ");
    const html = katex.renderToString(longEquation, { throwOnError: false });
    expect(html).toBeTruthy();
  });

  it("should handle nested structures", () => {
    const nested = "\\frac{\\frac{\\frac{1}{2}}{3}}{4}";
    const html = katex.renderToString(nested, { throwOnError: false });
    expect(html).toBeTruthy();
    expect(html).toContain("katex");
  });

  it("should handle special characters", () => {
    const special = "x < y > z \\& \\%";
    const html = katex.renderToString(special, { throwOnError: false });
    expect(html).toBeTruthy();
  });
});
