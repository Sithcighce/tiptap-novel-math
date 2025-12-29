"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import { useCallback, useEffect, useRef, useState } from "react";
import katex from "katex";
// import "katex/dist/katex.min.css"; // 关键：确保 KaTeX 样式被加载，否则 .katex-mathml 不会被隐藏
import * as Popover from "@radix-ui/react-popover";
import { Check, Trash2, Sigma } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MathNodeView = ({ node, updateAttributes, deleteNode, editor }: NodeViewProps) => {
  const [latex, setLatex] = useState(node.attrs.latex);
  const [displayMode, setDisplayMode] = useState(node.attrs.displayMode);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLatex(node.attrs.latex);
    setDisplayMode(node.attrs.displayMode);
  }, [node.attrs.latex, node.attrs.displayMode]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const renderMath = useCallback((content: string, isBlock: boolean) => {
    try {
      return katex.renderToString(content || "E = mc^2", {
        throwOnError: false,
        displayMode: isBlock,
      });
    } catch (e) {
      return "Invalid Equation";
    }
  }, []);

  const handleSave = () => {
    updateAttributes({
      latex: latex,
      displayMode: displayMode,
    });
    setIsOpen(false);
    editor.commands.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const isSelected = editor.isActive("math");

  return (
    <NodeViewWrapper as="span" className={cn("inline-block", displayMode && "w-full text-center")}>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <span
            className={cn(
              "cursor-pointer rounded transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
              !node.attrs.latex && "bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 inline-flex items-center gap-1",
              isSelected && "ring-2 ring-black dark:ring-white ring-offset-1"
            )}
            onClick={() => setIsOpen(true)}
          >
            {!node.attrs.latex ? (
              <>
                <Sigma className="h-4 w-4" />
                <span className="text-sm">New Equation</span>
              </>
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: renderMath(node.attrs.latex, node.attrs.displayMode),
                }}
              />
            )}
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            className="z-50 w-80 rounded-md border border-slate-200 bg-white p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
            align="center" 
            sideOffset={5}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Edit Equation</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports LaTeX syntax.
                </p>
              </div>
              
              <textarea
                ref={inputRef}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 font-mono"
                placeholder="e.g. E = mc^2"
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="block-mode"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-300"
                    checked={displayMode}
                    onChange={(e) => setDisplayMode(e.target.checked)}
                  />
                  <label htmlFor="block-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Block Mode
                  </label>
                </div>
                <div className="flex gap-1">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={deleteNode}
                    title="Delete Equation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 h-8 w-8"
                    onClick={handleSave} 
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </NodeViewWrapper>
  );
};
