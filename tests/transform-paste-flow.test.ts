/**
 * 测试 tiptap-markdown 的 transformPastedText 流程
 */
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Transform Paste Flow", () => {

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

  it("should test markdown parser output for complex formula", () => {
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

    const formula = "$$\n\\begin{align}\n \\text{test} & x \\\\\n\nmore\n\\end{align}\n$$";

    // 测试 markdown parser
    const storage = editor.storage.markdown;
    if (storage && storage.parser) {
      const html = storage.parser.parse(formula);
      console.log("=== Markdown parser output ===");
      console.log("HTML:", html);
      console.log("Contains data-type=math:", html.includes('data-type="math"'));
    }

    editor.destroy();
  });

  it("should test setContent vs insertContent", () => {
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

    const formula = "$$\n\\begin{align}\ntest \\\\\n\nmore\n\\end{align}\n$$";

    // Test 1: setContent
    editor.commands.setContent(formula);
    let mathNodes = findAllMathNodes(editor.getJSON());
    console.log("=== setContent ===");
    console.log("Math nodes:", mathNodes.length);

    // Reset
    editor.commands.setContent("<p></p>");

    // Test 2: insertContent
    editor.commands.insertContent(formula);
    mathNodes = findAllMathNodes(editor.getJSON());
    console.log("=== insertContent ===");
    console.log("Math nodes:", mathNodes.length);

    editor.destroy();
    expect(mathNodes.length).toBe(1);
  });
});
