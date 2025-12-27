# 需求：tiptap-novel-math 原生支持 Markdown 序列化

## 1. 背景与现状
目前，当 `tiptap-novel-math` 与 `tiptap-markdown` 配合使用时，由于缺失针对 `math` 节点的序列化逻辑，导致调用 `editor.storage.markdown.getMarkdown()` 时，数学公式被错误地转换成了 HTML 标签（如 `<span data-type="math">...</span>`），而非 Markdown 标准的 LaTeX 语法（`$E=mc^2$`）。

## 2. 目标
在 `tiptap-novel-math` 插件内部实现 `addStorage` 接口，使其能自动告诉 `tiptap-markdown` 如何处理数学公式。

**达成效果：**
用户无需在自己的项目中编写 `MathMarkdownSerializer` 补丁，直接使用插件即可获得正确的 Markdown 输出。

## 3. 需要添加的代码逻辑

请在您的 Extension 定义中（通常是 `Extension.create` 配置对象里），添加 `addStorage` 方法。

**代码参考 (TypeScript):**

```typescript
// 假设这是您的插件定义文件
import { Extension } from '@tiptap/core'

export const MathExtension = Extension.create({
  name: 'math',

  // ... 其他现有配置 (addAttributes, parseHTML, renderHTML 等) ...

  // [新增] 告诉 tiptap-markdown 如何处理这个节点
  addStorage() {
    return {
      markdown: {
        serialize: {
          // 这里的键名 'math' 必须与您的节点 name 保持一致
          math: (state: any, node: any) => {
            // 获取公式内容和显示模式
            // 请根据您实际的 addAttributes 定义调整属性名
            const latex = node.attrs.latex || '';
            const displayMode = node.attrs.displayMode === true; // 或者是 'block'，视您的实现而定

            // 构造 Markdown 字符串
            // 行内公式用 $...$, 块级公式用 $$...$$
            if (displayMode) {
              state.write(`$$${latex}$$`);
            } else {
              state.write(`$${latex}$`);
            }
          },
        },
        // [可选] 解析逻辑
        // 如果您希望插件也能负责 markdown -> node 的解析配置，可以在这里写 parse
        // 但通常 parsing 需要 markdown-it 的插件配合，这里只做 serialize 就能解决保存 HTML 的问题。
        parse: {
            // setup ...
        }
      },
    }
  },
})
```

## 4. 这里的参数说明
- **`state`**: `MarkdownSerializerState` 对象（来自 `prosemirror-markdown`）。调用 `state.write(string)` 即可向输出流写入 Markdown 文本。
- **`node`**: 当前的 ProseMirror 节点实例。您可以从 `node.attrs` 中获取公式源码（latex）和显示属性。

## 5. 之后我会如何调用？

一旦您发布了包含上述改动的新版本（例如 `v1.0.x`），我在项目中只需做两件事：

1. **更新依赖**：
   ```bash
   npm update tiptap-novel-math
   ```

2. **直接调用**（现有代码完全不用改）：
   ```typescript
   // 在我的编辑器组件中
   const markdownContent = editor.storage.markdown.getMarkdown();
   
   // 此时 markdownContent 里的公式将自动变成：
   // "这是一个公式 $E=mc^2$ 完美！"
   // 而不再是 HTML。
   ```

感谢大佬修复！期待新版本。
