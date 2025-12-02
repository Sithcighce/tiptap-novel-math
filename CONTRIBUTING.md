# Contributing to tiptap-novel-math

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them.

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)

## I Have a Question

If you want to ask a question, we assume that you have read the available [Documentation](./README.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/Sithcighce/tiptap-novel-math/issues) that might help you. In case you've found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

## I Want To Contribute

### Reporting Bugs

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report.

### Your First Code Contribution

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/tiptap-novel-math.git
   cd tiptap-novel-math
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes.
5. **Make changes** and test them using the demo (`npm run dev -w novel-demo`).
6. **Commit** your changes.
7. **Push** to your fork and submit a **Pull Request**.

### Development

This project uses a workspace structure.
- The core library is in `src/`.
- The demo application is in `examples/novel-demo/`.

To build the library:
```bash
npm run build
```

To run the demo:
```bash
npm run dev -w novel-demo
```
