/**
 * 调试 PasteRule 的 regex 行为
 */
import { describe, it, expect } from "vitest";

describe("PasteRule Regex Debug", () => {
  
  it("should match complex formula with $$...$$ regex", () => {
    // 用户报告的无法解析的公式
    const formula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|} + (-\\vec{\\xi})\\cdot \\nabla \\frac{1}{|\\vec{r}|} + \\dots & \\sim\\frac{{1}}{|r|}\\\\
\\frac{\\omega}{c}|\\vec{r}-\\vec{\\xi} | & = \\frac{\\omega}{c}\\times(|\\vec{r}| + (-\\vec{\\xi})\\cdot \\nabla |\\vec{r}| + \\dots) & \\\\
 & \\sim \\overset{\\text{Electrical Dipole} }{\\vec{k}\\cdot \\vec{r}}
\\end{cases}
\\end{align}
$$`;

    // 这是 addPasteRules 中使用的正则
    const pasteRuleRegex = /\$\$([\s\S]*?)\$\$/g;
    
    const matches = formula.match(pasteRuleRegex);
    console.log("=== PasteRule regex test ===");
    console.log("Input length:", formula.length);
    console.log("Matches found:", matches?.length || 0);
    
    if (matches) {
      console.log("Match length:", matches[0].length);
      console.log("Match preview:", matches[0].substring(0, 100) + "...");
    }
    
    expect(matches).toBeTruthy();
    expect(matches!.length).toBe(1);
  });

  it("should extract latex from match groups", () => {
    const formula = `$$
\\begin{align}
test
\\end{align}
$$`;

    const regex = /\$\$([\s\S]*?)\$\$/g;
    let match;
    
    console.log("=== Testing exec ===");
    while ((match = regex.exec(formula)) !== null) {
      console.log("Full match:", match[0]);
      console.log("Group 1 (latex):", match[1]);
      console.log("Group 1 trimmed:", match[1].trim());
    }
  });

  it("should test the MarkdownLatexParser regex", () => {
    const formula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\end{cases}
\\end{align}
$$`;

    // 这是 MarkdownLatexParser 中使用的正则
    const latexRegex = /\\\[((?:.|[\r\n])*?)\\\]|\$\$([\s\S]+?)\$\$|\\\(((?:.|[\r\n])*?)\\\)|\$([^$\n]+?)\$/g;
    
    console.log("=== MarkdownLatexParser regex test ===");
    
    let match;
    while ((match = latexRegex.exec(formula)) !== null) {
      console.log("Full match:", match[0].substring(0, 50) + "...");
      console.log("Group 1 (\\[\\]):", match[1]);
      console.log("Group 2 ($$):", match[2]?.substring(0, 50));
      console.log("Group 3 (\\(\\)):", match[3]);
      console.log("Group 4 ($):", match[4]);
    }
  });

  it("should test formula with empty line in middle", () => {
    const formulaWithEmptyLine = `$$
\\begin{align}
first part \\\\

second part
\\end{align}
$$`;

    const regex = /\$\$([\s\S]*?)\$\$/g;
    const matches = formulaWithEmptyLine.match(regex);
    
    console.log("=== Formula with empty line ===");
    console.log("Matches:", matches?.length || 0);
    
    if (matches) {
      console.log("Match:", matches[0]);
    }
    
    expect(matches).toBeTruthy();
    expect(matches!.length).toBe(1);
  });
});
