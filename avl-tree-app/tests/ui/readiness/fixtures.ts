// Neutral fixtures for the readiness components (revamp-readiness). Every string says "Example" except the
// objective IDs, so a test can tell fixture text from anything a component adds. LO1 to LO7, LO7 optional (ID 5.1).
import type { ReadinessSummaryProps } from '../../../src/ui/readiness/ReadinessSummary';
import type { ObjectiveRow, ReadinessStatus } from '../../../src/ui/readiness/types';

export const LO = ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7'] as const;

export const statusLabels = {
  words: { ready: 'Example ready', revise: 'Example revise' } as Record<ReadinessStatus, string>,
  symbols: { ready: '✓', revise: '↻' } as Record<ReadinessStatus, string>,
  optional: 'Example optional',
};

export const columns = {
  caption: 'Example objectives',
  objective: 'Example objective',
  level: 'Example level',
  status: 'Example status',
  change: 'Example change',
  review: 'Example review column',
};

const LEVELS: Record<string, { level: string; word: string }[]> = {
  LO1: [{ level: 'understand', word: 'Example understand' }],
  LO3: [
    { level: 'apply', word: 'Example apply' },
    { level: 'understand', word: 'Example understand' },
  ],
  LO6: [{ level: 'evaluate', word: 'Example evaluate' }],
};

export function rows(statuses: Partial<Record<string, ReadinessStatus>> = {}, extra: (id: string) => Partial<ObjectiveRow> = () => ({})): ObjectiveRow[] {
  return LO.map((id, i) => ({
    id,
    name: `Example name ${id}`,
    levels: LEVELS[id] ?? [{ level: 'apply', word: 'Example apply' }],
    status: statuses[id] ?? 'ready',
    note: i === 2 ? undefined : `Example note ${id}`,
    optional: id === 'LO7' || undefined,
    review: { href: `/module/C${i + 2}`, label: 'Example review' },
    ...extra(id),
  }));
}

export const questionLabels = {
  heading: 'Example bring these',
  empty: 'Example: nothing to bring this time',
  edit: 'Example edit',
  remove: 'Example remove',
  save: 'Example save',
  cancel: 'Example cancel',
  field: 'Example your question',
};

export const exportLabels = {
  group: 'Example export',
  print: 'Example print',
  copy: 'Example copy',
  save: 'Example save file',
  copied: 'Example copied',
  saved: 'Example saved',
  fallback: 'Example: copy the text below',
  fallbackLabel: 'Example summary text',
};

export function summary(over: Partial<ReadinessSummaryProps> = {}): ReadinessSummaryProps {
  return {
    headingLevel: 2,
    headline: {
      status: 'ready',
      heading: 'Example ready heading',
      line: 'Example ready line',
      title: { words: 'Example title words', message: 'Example title message' },
    },
    table: { rows: rows({ LO7: 'revise' }), labels: statusLabels, columns },
    flags: {
      heading: 'Example flags heading',
      symbol: '⚑',
      items: [
        { id: 'LO2', text: 'Example: you were sure, worth a second look', link: { href: '/module/C3', label: 'Example look again' } },
        { id: 'LO4', text: 'Example: you were sure, worth a second look', link: { href: '/module/C5', label: 'Example look again' } },
      ],
    },
    listen: { heading: 'Example listen heading', points: ['Example point one', 'Example point two', 'Example point three'] },
    questions: {
      questions: [
        { id: 's1', text: 'Example question one' },
        { id: 'o1', text: 'Example question two', editable: true, removable: true },
      ],
      labels: questionLabels,
      onEdit: () => {},
      onRemove: () => {},
    },
    exports: { fileName: 'example.txt', labels: exportLabels },
    ...over,
  };
}
