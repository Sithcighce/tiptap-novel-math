# Changelog

## [0.1.2] - 2025-12-07
### Changed
- **Compatibility**: Extended `peerDependencies` to support React 19 (`^18.0.0 || ^19.0.0`)

## [0.1.1] - 2025-12-07
### Fixed
- **Critical**: Added missing `katex/dist/katex.min.css` import in `MathNodeView` component. Without this CSS, the `.katex-mathml` element (containing raw LaTeX source for accessibility) was not hidden, causing "rendered formula + raw text" to display simultaneously.

---

## [0.1.0] - 2025-12-02
### Added
- Project initialized: Tiptap/Novel math formula extension
- Support for `$...$` (inline) and `$$...$$` (block) auto conversion
- Click-to-edit math popover
- Smart paste: auto-detect LaTeX and convert
- Demo page

### Changed
- None

### Fixed
- None

---

