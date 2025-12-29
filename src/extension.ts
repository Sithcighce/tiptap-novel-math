import { Node, mergeAttributes, InputRule, PasteRule, Editor, ChainedCommands } from "@tiptap/core";
import { Plugin, PluginKey, type EditorState, type Transaction } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { KatexOptions } from "katex";
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
      mathMarkdown: {
        serialize: {
          math: (state: any, node: any) => {
            const latex = node.attrs.latex || "";
            const displayMode = node.attrs.displayMode;

            if (displayMode) {
              state.write(`$$${latex}$$`);
            } else {
              state.write(`$${latex}$`);
            }
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
    return [
      new PasteRule({
        find: /\\\[((?:.|[\r\n])*?)\\\]/g,
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
      new PasteRule({
        find: /\$\$((?:.|[\r\n])*?)\$\$/g,
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
      new PasteRule({
        find: /\\\(((?:.|[\r\n])*?)\\\)/g,
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
    return [{ tag: `span[data-type="${this.name}"]` }];
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
