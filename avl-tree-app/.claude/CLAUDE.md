# AVL Tree Learning App
Prototype web app teaching AVL trees to second-year CS students before the lecture.
Source of truth for requirements: openspec/specs. Background: docs/SE_Document.

## Rules
- Engine code in src/engine is pure TypeScript with no React imports.
- No authentication, no backend. Progress lives in localStorage behind StorageAdapter.
- Colour never carries meaning alone; follow docs/design tokens; text contrast >= 4.5:1.
- Questions and content are data files in src/content, validated at build time.
- Every change starts as an OpenSpec proposal. Reference FR IDs (e.g. FR-ENG-04) in commits.
- Write tests with the code. Run `npm test` and `npm run lint` before finishing a task.

## Commands
npm run dev | npm test | npm run lint | npm run build