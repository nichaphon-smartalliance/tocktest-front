# tocktest-front

## Docs editor pipeline

Workflow order on the repository **Docs** tab:

```
Docs pipeline (status box)
        ↓
Full Tiptap implementation (rich text editor)
        ↓
เขียนเอกสาร repository ด้วย markdown (collapsible Markdown source)
```

The legacy empty-state **"สร้าง docs"** button was removed. An empty repo now opens
the editor directly (AI build/refresh still live in the top toolbar).

### Tiptap editor

- Component: `src/components/ui/TiptapEditor/TiptapEditor.tsx`.
- Built on Tiptap v2 (`@tiptap/react`, `@tiptap/starter-kit`) plus extensions:
  `Image`, `Link`, `Placeholder`, `Table`/`TableRow`/`TableHeader`/`TableCell`,
  and `tiptap-markdown` for Markdown import/export.
- Toolbar: bold, italic, strikethrough, inline code, H1–H3, bullet/ordered lists,
  blockquote, code block, horizontal rule, link, image, table, undo/redo.
- **Images**: uploaded inline as base64 data URLs (≤ 2 MB, image MIME only) — no
  upload endpoint needed.
- **Markdown is the single source of truth.** The editor emits Markdown on every
  change; the collapsible "Markdown source" textarea edits the same string and
  syncs back into the editor.
- SSR-safe (`immediatelyRender: false`); raw HTML disabled in the Markdown parser
  (`html: false`) to avoid injection.

### Storage / backend integration

No schema change. Doc content is saved/loaded as Markdown through the existing
endpoints (`GET/PUT /api/v1/repositories/:repoId/docs`) via
`src/services/docs.service.ts` and the `useProjectDoc` hook. Backend caps body
size (12 MB) and content length to accommodate embedded images. See the backend
README for API details.
