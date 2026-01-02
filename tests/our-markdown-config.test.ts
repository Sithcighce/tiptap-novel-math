/**
 * 测试我们自定义的 markdown-it 配置
 */
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics } from "../src/index";

describe("Our Markdown Config", () => {
  it("should test our custom markdown parser on formula with empty line", () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    const formula = `$$
\\begin{align}
first \\\\

second
\\end{align}
$$`;

    const storage = editor.storage.markdown;
    if (storage && storage.parser) {
      const html = storage.parser.parse(formula);
      console.log("=== Our parser output (with empty line) ===");
      console.log("Input:");
      console.log(formula);
      console.log("\nOutput:");
      console.log(html);
      console.log("\nContains data-type=math:", html.includes('data-type="math"'));
    }

    editor.destroy();
  });

  it("should test our custom markdown parser on user formula", () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
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

    const storage = editor.storage.markdown;
    if (storage && storage.parser) {
      const html = storage.parser.parse(formula);
      console.log("=== Our parser output (user formula) ===");
      console.log("Contains data-type=math:", html.includes('data-type="math"'));
      console.log("\nOutput:");
      console.log(html);
    }

    editor.destroy();
  });

  it("should test inline parsing mode", () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    const formula = `$$
\\begin{align}
test
\\end{align}
$$`;

    const storage = editor.storage.markdown;
    if (storage && storage.parser) {
      // tiptap-markdown 可能使用 inline: true 模式
      console.log("=== Parser modes ===");
      
      // Block mode
      const blockHtml = storage.parser.parse(formula, { inline: false });
      console.log("Block mode:", blockHtml.includes('data-type="math"') ? "✓" : "✗");
      
      // Inline mode (tiptap-markdown uses this for paste)
      try {
        const inlineHtml = storage.parser.parse(formula, { inline: true });
        console.log("Inline mode:", inlineHtml.includes('data-type="math"') ? "✓" : "✗");
        console.log("Inline output:", inlineHtml.substring(0, 300));
      } catch (e) {
        console.log("Inline mode error:", e);
      }
    }

    editor.destroy();
  });
});
