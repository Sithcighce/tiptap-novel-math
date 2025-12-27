import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics, MarkdownLatexParser } from "../src/index";

const createEditor = () => {
  return new Editor({
    extensions: [StarterKit, Mathematics, MarkdownLatexParser],
    content: "<p></p>",
  });
};

describe("Markdown Latex Parser (Paste)", () => {
  it("should convert pasted inline latex $...$ to math node", () => {
    const editor = createEditor();
    
    // Simulate a paste transaction
    // We manually create a transaction that inserts text and marks it as 'paste'
    editor.view.dispatch(
      editor.state.tr
        .insertText("Check this out: $E=mc^2$")
        .setMeta("paste", true) // This triggers the plugin
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    // Expected structure: Text("Check this out: "), Math("E=mc^2")
    expect(content).toHaveLength(2);
    expect(content?.[0].text).toBe("Check this out: ");
    expect(content?.[1].type).toBe("math");
    expect(content?.[1].attrs?.latex).toBe("E=mc^2");
  });

  it("should convert pasted block latex $$...$$ to math node with displayMode", () => {
    const editor = createEditor();
    
    editor.view.dispatch(
      editor.state.tr
        .insertText("Block: $$\\sum_{i=1}^n i$$")
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    const mathNode = content?.[1];
    expect(mathNode?.type).toBe("math");
    expect(mathNode?.attrs?.latex).toBe("\\sum_{i=1}^n i");
    expect(mathNode?.attrs?.displayMode).toBe(true);
  });

  it("should convert pasted inline latex \\(...\\) to math node", () => {
    const editor = createEditor();
    
    editor.view.dispatch(
      editor.state.tr
        .insertText("Inline: \\( a^2 + b^2 = c^2 \\)")
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    expect(content).toHaveLength(2);
    expect(content?.[0].text).toBe("Inline: ");
    expect(content?.[1].type).toBe("math");
    expect(content?.[1].attrs?.latex).toBe("a^2 + b^2 = c^2");
    expect(content?.[1].attrs?.displayMode).toBe(false);
  });

  it("should convert pasted block latex \\[...\\] to math node", () => {
    const editor = createEditor();
    
    editor.view.dispatch(
      editor.state.tr
        .insertText("Block: \\[ E = mc^2 \\]")
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    const mathNode = content?.[1];
    expect(mathNode?.type).toBe("math");
    expect(mathNode?.attrs?.latex).toBe("E = mc^2");
    expect(mathNode?.attrs?.displayMode).toBe(true);
  });

  it("should convert real-world text from 测试文本.md", () => {
    const editor = createEditor();
    const text = "对于 \\( n \\times n \\) 矩阵 \\( A \\)";
    
    editor.view.dispatch(
      editor.state.tr
        .insertText(text)
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    // Expected: Text("对于 "), Math("n \times n"), Text(" 矩阵 "), Math("A")
    expect(content).toHaveLength(4);
    expect(content?.[0].text).toBe("对于 ");
    expect(content?.[1].type).toBe("math");
    expect(content?.[1].attrs?.latex).toBe("n \\times n");
    expect(content?.[2].text).toBe(" 矩阵 ");
    expect(content?.[3].type).toBe("math");
    expect(content?.[3].attrs?.latex).toBe("A");
  });
});
