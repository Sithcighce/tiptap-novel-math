import { Node, mergeAttributes, InputRule, PasteRule, Editor, ChainedCommands } from "@tiptap/core";
import { Plugin, PluginKey, type EditorState, type Transaction } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { KatexOptions } from "katex";
import texmath from "markdown-it-texmath";
import { MathNodeView } from "./math-node-view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathematics: {
      setLatex: (attrs: { latex: string; displayMode?: boolean }) => ReturnType;
      unsetLatex: () => ReturnType;
    };
  }
}

export interface MathematicsOptions {
  shouldRender: (state: EditorState, pos: number) => boolean;
  katexOptions?: KatexOptions;
  HTMLAttributes: Record<string, any>;
}

export const Mathematics = Node.create<MathematicsOptions>({
  name: "math",
  inline: true,
  group: "inline",
  atom: true,
  selectable: true,
  marks: "",

  addAttributes() {
    return {
      latex: {
        default: "",
      },
      displayMode: {
        default: false,
      },
    };
  },

  addStorage() {
    return {
      // tiptap-markdown looks for extension.storage.markdown to find serialization config
      markdown: {
        serialize(state: any, node: any) {
          const latex = node.attrs.latex || "";
          const displayMode = node.attrs.displayMode;

          if (displayMode) {
            state.write(`$$${latex}$$`);
          } else {
            state.write(`$${latex}$`);
          }
        },
        parse: {
          // Configure markdown-it to recognize $...$ and $$...$$ and not process their contents
          setup(markdownit: any) {
            // Custom parsing approach for multi-line block math ($$...$$)
            // This handles the case where nested $ inside $$ blocks would confuse texmath
            
            // Add a custom rule for multi-line block math that runs before texmath
            markdownit.block.ruler.before('fence', 'multiline_block_math', (state: any, startLine: number, endLine: number, silent: boolean) => {
              const startPos = state.bMarks[startLine] + state.tShift[startLine];
              const maxPos = state.eMarks[startLine];
              
              // Check if line starts with $$ (with nothing else on line, or just content for next line)
              if (startPos + 2 > maxPos) return false;
              if (state.src.charCodeAt(startPos) !== 0x24 /* $ */ ||
                  state.src.charCodeAt(startPos + 1) !== 0x24 /* $ */) {
                return false;
              }
              
              // Check if this is a multi-line block (no closing $$ on same line, or content continues)
              const firstLineContent = state.src.slice(startPos + 2, maxPos);
              const sameLineClose = firstLineContent.indexOf('$$');
              
              // If $$ closes on same line with no content before it, let texmath handle it
              if (sameLineClose === 0) {
                return false;
              }
              
              // If $$ closes on same line with content, this is a single-line block
              // Check if there are nested $ that would confuse texmath
              if (sameLineClose > 0) {
                const innerContent = firstLineContent.slice(0, sameLineClose);
                // If there's a single $ inside, texmath will mess this up
                if (!innerContent.includes('$')) {
                  return false; // Let texmath handle simple cases
                }
                
                // Handle single-line block with nested $
                if (silent) return true;
                
                const latex = innerContent.trim();
                const escaped = latex
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;");
                
                const token = state.push('html_block', '', 0);
                token.content = `<span data-type="math" data-latex="${escaped}" data-display-mode="true"></span>\n`;
                token.map = [startLine, startLine + 1];
                
                state.line = startLine + 1;
                return true;
              }
              
              // Multi-line block math: $$ on first line, content on following lines, $$ on closing line
              let nextLine = startLine;
              let found = false;
              
              for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
                const lineStartPos = state.bMarks[nextLine] + state.tShift[nextLine];
                const lineMaxPos = state.eMarks[nextLine];
                const lineContent = state.src.slice(lineStartPos, lineMaxPos);
                
                const closeIdx = lineContent.indexOf('$$');
                if (closeIdx !== -1) {
                  found = true;
                  break;
                }
              }
              
              if (!found) return false;
              if (silent) return true;
              
              // Extract full latex content
              let latex = '';
              for (let line = startLine; line <= nextLine; line++) {
                const lineStart = state.bMarks[line] + (line === startLine ? state.tShift[line] + 2 : 0);
                const lineEnd = state.eMarks[line];
                let lineContent = state.src.slice(lineStart, lineEnd);
                
                if (line === nextLine) {
                  const closeIdx = lineContent.indexOf('$$');
                  if (closeIdx !== -1) {
                    lineContent = lineContent.slice(0, closeIdx);
                  }
                }
                
                latex += (line > startLine ? '\n' : '') + lineContent;
              }
              
              const escaped = latex.trim()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
              
              const token = state.push('html_block', '', 0);
              token.content = `<span data-type="math" data-latex="${escaped}" data-display-mode="true"></span>\n`;
              token.map = [startLine, nextLine + 1];
              
              state.line = nextLine + 1;
              return true;
            });
            
            // Use texmath for inline math ($...$) and simple single-line block math ($$...$$)
            markdownit.use(texmath, {
              engine: {
                renderToString: (latex: string, options?: { displayMode?: boolean }) => {
                  const escaped = latex
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
                  const displayMode = options?.displayMode ? "true" : "false";
                  return `<span data-type="math" data-latex="${escaped}" data-display-mode="${displayMode}"></span>`;
                },
              },
              delimiters: "dollars",
            });
          },
        },
      },
    };
  },

  addOptions() {
    return {
      shouldRender: (state, pos) => {
        const $pos = state.doc.resolve(pos);
        if (!$pos.parent.isTextblock) {
          return false;
        }
        return $pos.parent.type.name !== "codeBlock";
      },
      katexOptions: {
        throwOnError: false,
      },
      HTMLAttributes: {},
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\$\$((?:.|[\r\n])*?)\$\$/,
        handler: ({ state, range, match, chain }) => {
          const { from, to } = range;
          const latex = match[1].trim();
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from, to },
                {
                  type: "math",
                  attrs: { latex, displayMode: true },
                }
              )
              .setTextSelection(from + 1)
              .run();
          }
        },
      }),
      new InputRule({
        find: /^\$\$\s$/,
        handler: ({ state, range, match, chain }) => {
          chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: "math",
              attrs: { latex: "", displayMode: true },
            })
            .run();
        },
      }),
      new InputRule({
        find: /\$([^$]+)\$/,
        handler: ({ state, range, match, chain }) => {
          const { from, to } = range;
          const latex = match[1].trim();
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from, to },
                {
                  type: "math",
                  attrs: { latex, displayMode: false },
                }
              )
              .setTextSelection(from + 1)
              .run();
          }
        },
      }),
    ];
  },

  addPasteRules() {
    // 使用自定义处理函数来正确解析多行块公式
    // 关键：先处理块公式（$$...$$），再处理内联公式（$...$）
    const extractBlockMath = (text: string): { matches: Array<{ start: number; end: number; latex: string; type: 'block' | 'inline' }> } => {
      const matches: Array<{ start: number; end: number; latex: string; type: 'block' | 'inline' }> = [];
      const usedRanges: Array<{ start: number; end: number }> = [];

      // 第一遍：提取所有块公式 \[...\] 和 $$...$$
      // 使用更健壮的方法处理多行块公式
      const blockPatterns = [
        { pattern: /\\\[([\s\S]*?)\\\]/g, type: 'block' as const },
        { pattern: /\$\$([\s\S]*?)\$\$/g, type: 'block' as const },
      ];

      for (const { pattern, type } of blockPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;
          // 检查是否与已有范围重叠
          const overlaps = usedRanges.some(r => 
            (start >= r.start && start < r.end) || (end > r.start && end <= r.end)
          );
          if (!overlaps) {
            matches.push({ start, end, latex: match[1].trim(), type });
            usedRanges.push({ start, end });
          }
        }
      }

      // 第二遍：提取内联公式 \(...\) 和 $...$
      const inlinePatterns = [
        { pattern: /\\\(([\s\S]*?)\\\)/g, type: 'inline' as const },
        { pattern: /\$([^$\n]+?)\$/g, type: 'inline' as const },
      ];

      for (const { pattern, type } of inlinePatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;
          // 检查是否与已有范围重叠（包括块公式范围）
          const overlaps = usedRanges.some(r => 
            (start >= r.start && start < r.end) || (end > r.start && end <= r.end) ||
            (start < r.start && end > r.end)
          );
          if (!overlaps) {
            matches.push({ start, end, latex: match[1].trim(), type });
            usedRanges.push({ start, end });
          }
        }
      }

      return { matches: matches.sort((a, b) => a.start - b.start) };
    };

    return [
      // 块公式 \[...\]
      new PasteRule({
        find: /\\\[([\s\S]*?)\\\]/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: true },
                }
              )
              .run();
          }
        },
      }),
      // 块公式 $$...$$（使用 [\s\S] 来匹配包括换行在内的所有字符）
      new PasteRule({
        find: /\$\$([\s\S]*?)\$\$/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: true },
                }
              )
              .run();
          }
        },
      }),
      // 内联公式 \(...\)
      new PasteRule({
        find: /\\\(([\s\S]*?)\\\)/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: false },
                }
              )
              .run();
          }
        },
      }),
      // 内联公式 $...$ （不匹配换行，且不在已匹配的块公式范围内）
      new PasteRule({
        find: /\$([^$\n]+?)\$/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: false },
                }
              )
              .run();
          }
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("mathHydration"),
        appendTransaction: (transactions, oldState, newState) => {
           // This plugin handles paste operations and any missed hydration
           // Initial hydration is handled by onCreate
           
           const tr = newState.tr;
           let modified = false;
           const replacements: { from: number; to: number; nodes: any[] }[] = [];
           
           newState.doc.descendants((node, pos, parent) => {
             if (node.type.name !== "text" || !node.text) return;
             if (parent && parent.type.name === "codeBlock") return;

             const text = node.text;
             // Create fresh regex to avoid lastIndex issues
             const latexRegex = /\\\[((?:.|[\r\n])*?)\\\]|\$\$([\s\S]+?)\$\$|\\\(((?:.|[\r\n])*?)\\\)|\$([^$\n]+?)\$/g;
             
             const nodes: any[] = [];
             let lastIndex = 0;
             let hasMatch = false;
             
             let match;
             while ((match = latexRegex.exec(text)) !== null) {
               hasMatch = true;
               if (match.index > lastIndex) {
                 nodes.push(newState.schema.text(text.slice(lastIndex, match.index)));
               }
               
               const latex = (match[1] || match[2] || match[3] || match[4] || "").trim();
               const displayMode = !!(match[1] || match[2]);
               
               if (latex) {
                  const mathNode = newState.schema.nodes.math?.create({ latex, displayMode });
                  if (mathNode) nodes.push(mathNode);
                  else nodes.push(newState.schema.text(match[0]));
               }
               
               lastIndex = latexRegex.lastIndex;
             }
             
             if (!hasMatch) return;
             
             if (lastIndex < text.length) {
               nodes.push(newState.schema.text(text.slice(lastIndex)));
             }
             
             if (nodes.length > 0) {
               replacements.push({ from: pos, to: pos + node.nodeSize, nodes });
             }
           });
           
           if (replacements.length > 0) {
             for (let i = replacements.length - 1; i >= 0; i--) {
               const { from, to, nodes } = replacements[i];
               tr.replaceWith(from, to, nodes);
             }
             modified = true;
           }
           
           return modified ? tr : null;
        }
      }),
      new Plugin({
        props: {
          transformPastedText(text) {
            // Clean invisible characters that break KaTeX
            text = text.replace(/[\uFFFC\u200B]/g, "");
            return text;
          },
          transformPastedHTML(html) {
             html = html.replace(/[\uFFFC\u200B]/g, "");
             return html;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setLatex:
        ({ latex, displayMode }: { latex: string; displayMode?: boolean }) =>
        ({ chain, state }: { chain: () => ChainedCommands; state: EditorState }) => {
          if (!latex) {
            return false;
          }
          
          // Strip existing delimiters
          if (latex.startsWith("$$") && latex.endsWith("$$")) {
             latex = latex.slice(2, -2);
             displayMode = true;
          } else if (latex.startsWith("$") && latex.endsWith("$")) {
             latex = latex.slice(1, -1);
          }
          
          const { from, to, $anchor } = state.selection;

          if (!this.options.shouldRender(state, $anchor.pos)) {
            return false;
          }

          return chain()
            .insertContentAt(
              { from: from, to: to },
              {
                type: "math",
                attrs: {
                  latex: latex,
                  displayMode: displayMode ?? false,
                },
              }
            )
            .setTextSelection({ from: from, to: from + 1 })
            .run();
        },
      unsetLatex:
        () =>
        ({ editor, state, chain }: { editor: Editor; state: EditorState; chain: () => ChainedCommands }) => {
          const latex = editor.getAttributes(this.name).latex;

          if (typeof latex !== "string") {
            return false;
          }

          const { from, to } = state.selection;
          const textToInsert = latex;

          return chain()
            .command(({ tr }: { tr: Transaction }) => {
              tr.insertText(textToInsert, from, to);
              return true;
            })
            .setTextSelection({
              from: from,
              to: from + textToInsert.length,
            })
            .run();
        },
    };
  },

  parseHTML() {
    return [
      {
        // Standard format: <span data-type="math" data-latex="...">
        tag: `span[data-type="${this.name}"]`,
        getAttrs: (element: HTMLElement) => {
          const latex = element.getAttribute("data-latex") || element.getAttribute("latex") || "";
          const displayMode = element.getAttribute("data-display-mode") === "true" || 
                              element.getAttribute("displayMode") === "true";
          return { latex, displayMode };
        },
      },
      {
        // Inline math from markdown-it-texmath: <eq><span>...</span></eq>
        tag: "eq",
        getAttrs: (element: HTMLElement) => {
          const span = element.querySelector("span[data-type='math']");
          if (span) {
            const latex = span.getAttribute("data-latex") || "";
            const displayMode = span.getAttribute("data-display-mode") === "true";
            return { latex, displayMode };
          }
          return false;
        },
      },
      {
        // Block math from markdown-it-texmath: <eqn><span>...</span></eqn>
        tag: "eqn",
        getAttrs: (element: HTMLElement) => {
          const span = element.querySelector("span[data-type='math']");
          if (span) {
            const latex = span.getAttribute("data-latex") || "";
            const displayMode = span.getAttribute("data-display-mode") === "true";
            return { latex, displayMode };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": this.name,
        "data-latex": node.attrs.latex,
      }),
    ];
  },

  renderText({ node }) {
    return node.attrs["latex"] ?? "";
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  onCreate() {
    const { state, view } = this.editor;
    const tr = state.tr;
    let modified = false;
    const replacements: { from: number; to: number; nodes: any[] }[] = [];

    // Initial hydration scan
    state.doc.descendants((node, pos, parent) => {
        if (node.type.name !== "text" || !node.text) return;
        // Skip code blocks - do not hydrate LaTeX inside code
        if (parent && parent.type.name === "codeBlock") return;
        
        const text = node.text;
        // Create a fresh regex for each text node to avoid lastIndex issues
        const latexRegex = /\\\[((?:.|[\r\n])*?)\\\]|\$\$([\s\S]+?)\$\$|\\\(((?:.|[\r\n])*?)\\\)|\$([^$\n]+?)\$/g;

        const nodes: any[] = [];
        let lastIndex = 0;
        let hasMatch = false;

        let match;
        while ((match = latexRegex.exec(text)) !== null) {
            hasMatch = true;
            if (match.index > lastIndex) {
                nodes.push(state.schema.text(text.slice(lastIndex, match.index)));
            }

            const latex = (match[1] || match[2] || match[3] || match[4] || "").trim();
            const displayMode = !!(match[1] || match[2]);

            if (latex) {
                const mathNode = state.schema.nodes.math?.create({ latex, displayMode });
                if (mathNode) nodes.push(mathNode);
                else nodes.push(state.schema.text(match[0]));
            }

            lastIndex = latexRegex.lastIndex;
        }

        if (!hasMatch) return;

        if (lastIndex < text.length) {
            nodes.push(state.schema.text(text.slice(lastIndex)));
        }

        if (nodes.length > 0) {
            replacements.push({ from: pos, to: pos + node.nodeSize, nodes });
        }
    });

    if (replacements.length > 0) {
        for (let i = replacements.length - 1; i >= 0; i--) {
            const { from, to, nodes } = replacements[i];
            tr.replaceWith(from, to, nodes);
        }
        modified = true;
    }

    if (modified) {
        view.dispatch(tr);
    }
  },
});
