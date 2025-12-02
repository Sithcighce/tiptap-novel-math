import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

/**
 * This extension parses pasted text for LaTeX patterns ($...$ and $$...$$)
 * and converts them into math nodes. It runs after the Markdown parser.
 */
export const MarkdownLatexParser = Extension.create({
  name: "markdownLatexParser",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("markdownLatexParser"),
        appendTransaction: (transactions, oldState, newState) => {
          // Only process paste operations
          const isPaste = transactions.some(
            (tr) => tr.getMeta("paste") || tr.getMeta("uiEvent") === "paste"
          );

          if (!isPaste) {
            return null;
          }

          const tr = newState.tr;
          let modified = false;
          const replacements: { from: number; to: number; nodes: ProseMirrorNode[] }[] = [];

          // Traverse document to find text nodes containing LaTeX
          newState.doc.descendants((node, pos, parent) => {
            if (node.type.name !== "text" || !node.text) {
              return;
            }

            // Do not process inside code blocks
            if (parent && parent.type.name === "codeBlock") {
              return;
            }

            const text = node.text;
            // Regex to match $$...$$ (block) or $...$ (inline)
            const latexRegex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
            
            if (!latexRegex.test(text)) {
              return;
            }

            // Parse and replace
            const nodes: ProseMirrorNode[] = [];
            let lastIndex = 0;
            latexRegex.lastIndex = 0; // Reset regex

            let match: RegExpExecArray | null;
            while ((match = latexRegex.exec(text)) !== null) {
              // Add text before match
              if (match.index > lastIndex) {
                const beforeText = text.slice(lastIndex, match.index);
                nodes.push(newState.schema.text(beforeText));
              }

              // Add math node
              const latex = (match[1] ?? match[2] ?? "").trim();
              const displayMode = !!match[1]; // Group 1 is for $$...$$
              
              if (latex) {
                const mathNode = newState.schema.nodes.math?.create({ latex, displayMode });
                if (mathNode) {
                  nodes.push(mathNode);
                } else {
                    // Fallback: keep original text
                    nodes.push(newState.schema.text(match[0]));
                }
              }

              lastIndex = latexRegex.lastIndex;
            }

            // Add remaining text
            if (lastIndex < text.length) {
              nodes.push(newState.schema.text(text.slice(lastIndex)));
            }

            // Record replacement if changes found
            if (nodes.length > 0) {
              replacements.push({
                from: pos,
                to: pos + node.nodeSize,
                nodes,
              });
            }
          });

          // Apply replacements in reverse order to avoid position shift issues
          if (replacements.length > 0) {
            for (let i = replacements.length - 1; i >= 0; i--) {
              const { from, to, nodes } = replacements[i];
              tr.replaceWith(from, to, nodes);
            }
            modified = true;
          }

          return modified ? tr : null;
        },
      }),
    ];
  },
});
