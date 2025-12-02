"use client";

import { defaultContent } from "@/lib/content";
import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  type EditorInstance,
} from "novel";
import { handleCommandNavigation } from "novel/extensions";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { defaultExtensions, suggestionItems } from "./extensions";
import { ColorSelector } from "./color-selector";
import { LinkSelector } from "./link-selector";
import { MathSelector } from "./math-selector";
import { NodeSelector } from "./node-selector";
import { TextButtons } from "./text-buttons";
import { Separator } from "@/components/ui/separator";

const extensions = [...defaultExtensions];

const insertImageAtSelection = (view: any, src: string) => {
  const { state, dispatch } = view;
  const imageNode = state.schema.nodes.image?.create({ src });
  if (!imageNode) return;
  const transaction = state.tr.replaceSelectionWith(imageNode).scrollIntoView();
  dispatch(transaction);
};

export default function NovelEditor() {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);

  // Pure frontend: Create a local object URL for the image
  const onUpload = useCallback((file: File) => {
    return Promise.resolve(URL.createObjectURL(file));
  }, []);

  const slashItems = useMemo(() => [...suggestionItems], []);

  const handleFileUpload = useCallback(
    (view: any, file: File) => {
      const uploadPromise = onUpload(file).then((src) => {
        insertImageAtSelection(view, src);
        return src;
      });

      toast.promise(uploadPromise, {
        loading: "Processing image...",
        success: "Image inserted",
        error: "Failed to insert image",
      });
    },
    [onUpload]
  );

  return (
    <div className="relative w-full max-w-screen-lg mx-auto">
      <EditorRoot>
        <EditorContent
          initialContent={defaultContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => {
              const file = event.clipboardData?.files?.[0];
              if (file) {
                event.preventDefault();
                handleFileUpload(view, file);
                return true;
              }
              return false;
            },
            handleDrop: (view, event, _slice, moved) => {
              if (!moved && event.dataTransfer?.files?.[0]) {
                event.preventDefault();
                handleFileUpload(view, event.dataTransfer.files[0]);
                return true;
              }
              return false;
            },
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full p-12",
            },
          }}
          slotAfter={
            <div className="px-12 py-4 text-sm text-muted-foreground">
              <p>
                Tip: Type <kbd className="px-1 py-0.5 rounded bg-muted">/</kbd> to open the command menu.
              </p>
            </div>
          }
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {slashItems.map((item) => (
                <EditorCommandItem
                  key={item.title}
                  value={item.title}
                  onCommand={({ editor, range }) => {
                    item.command?.({ editor, range });
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
          >
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}