# 粘贴规则增强验证

- [x] [Auto] 单元测试验证 `\( ... \)` 行内公式粘贴转换 (通过 `tests/paste.test.ts`)
- [x] [Auto] 单元测试验证 `\[ ... \]` 块级公式粘贴转换 (通过 `tests/paste.test.ts`)
- [x] [Auto] 回归测试 `$` 和 `$$` 粘贴支持 (通过 `tests/paste.test.ts`)
- [x] [Auto] 验证真实世界测试文本 `测试文本.md` (通过 `tests/paste.test.ts`)
- [x] [Manual] 引入 `PasteRule` 机制以应对 `tiptap-markdown` 可能的转义干扰
- [x] [Manual] 引入 `transformPastedText` / `transformPastedHTML` 预处理机制，在 Markdown 解析前规范化 LaTeX 格式。
- [x] [Manual] 实现“全链路字符清洗”：自动移除 `\uFFFC` (OBJ) 和 `\u200B` (ZWSP)，完美解决富文本/AI网页复制带来的渲染报错问题。