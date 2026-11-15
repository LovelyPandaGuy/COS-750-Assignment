import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { App } from '../../src/App';
import { AppShell } from '../../src/ui/AppShell';
import { TopBar } from '../../src/ui/TopBar';

// Spec: add-design-tokens-and-shell / app-shell. Requirement IDs: NFR-02, NFR-04, FR-VIS-10.
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

describe('NFR-02 AppShell landmarks', () => {
  it('renders one banner then one main holding the children', () => {
    const { container } = render(
      <AppShell title="AVL Trees">
        <p>child</p>
      </AppShell>,
    );
    const banner = screen.getByRole('banner');
    const main = screen.getByRole('main');
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(banner.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(main).toContainElement(screen.getByText('child'));
    expect(container.querySelector('header, [role=banner]')).toContainElement(banner);
  });

  it('App has no axe violations', async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NFR-02 skip link', () => {
  it('is the first focusable element, ahead of the Aa button and actions', () => {
    const { container } = render(
      <AppShell title="AVL Trees" actions={[{ label: 'Sandbox', onClick: () => {} }]}>
        <p>x</p>
      </AppShell>,
    );
    const first = container.querySelector(FOCUSABLE);
    expect(first).toBe(screen.getByRole('link', { name: /skip to main content/i }));
  });

  it('moves focus to main when activated', () => {
    render(
      <AppShell title="AVL Trees">
        <button>inside</button>
      </AppShell>,
    );
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('targets an id on main, which has tabindex -1', () => {
    render(<AppShell title="AVL Trees" />);
    const href = screen.getByRole('link', { name: /skip to main content/i }).getAttribute('href')!;
    expect(href.startsWith('#')).toBe(true);
    const main = screen.getByRole('main');
    expect(main.id).toBe(href.slice(1));
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('takes its label from src/content/shell.ts', () => {
    expect(readFileSync('src/ui/SkipLink.tsx', 'utf8')).not.toMatch(/skip to main content/i);
  });
});

describe('NFR-02 TopBar content comes from its props', () => {
  it('renders title, breadcrumb, actions in order, Settings last (no pill, D157)', () => {
    render(
      <TopBar
        title="AVL Trees"
        breadcrumb="Crumb"
        actions={[
          { label: 'Sandbox', onClick: () => {} },
          { label: 'Lecture questions', onClick: () => {} },
        ]}
      />,
    );
    const order = ['AVL Trees', 'Crumb', 'Sandbox', 'Lecture questions'].map((t) =>
      screen.getByText(t),
    );
    const aa = screen.getByRole('button', { name: /^settings/i });
    const all = [...order, aa];
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].compareDocumentPosition(all[i]) & Node.DOCUMENT_POSITION_FOLLOWING, `item ${i}`).toBeTruthy();
    }
  });

  it('renders no empty optional containers when only a title is given', () => {
    const { container } = render(<TopBar title="AVL Trees" />);
    expect(container.querySelector('.topbar-breadcrumb, .topbar-status, .topbar-actions')).toBeNull();
    expect(screen.getByRole('button', { name: /^settings/i })).toBeInTheDocument();
  });

  it('calls an action handler on click', () => {
    let n = 0;
    render(<TopBar title="t" actions={[{ label: 'Sandbox', onClick: () => n++ }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sandbox' }));
    expect(n).toBe(1);
  });

  it('does not make the title a heading: App has only the heading in main', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(1);
    expect(screen.getByRole('main')).toContainElement(headings[0]);
  });
});

describe('NFR-04 / FR-VIS-10 stylesheet wiring', () => {
  it('imports shell.css from the shell', () => {
    expect(readFileSync('src/ui/AppShell.tsx', 'utf8')).toMatch(/import\s+['"]\.\/shell\.css['"]/);
  });
});

// Spec: add-routing-and-screen-skeleton / app-shell, "TopBar content comes from its props" (link action).
describe('NFR-02 TopBar link action', () => {
  it('renders an action with an href as a link and one without as a button', () => {
    const calls: string[] = [];
    render(<TopBar title="t" actions={[{ label: 'Sandbox', href: '#/sandbox' }, { label: 'Other', onClick: () => calls.push('x') }]} />);
    const link = screen.getByRole('link', { name: 'Sandbox' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#/sandbox');
    expect(screen.queryByRole('button', { name: 'Sandbox' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Other' }));
    expect(calls).toEqual(['x']);
  });
});

// Spec: add-ui-foundation / app-shell, "TopBar content comes from its props" (progress area). NFR-02, D20, D23.
describe('NFR-02 TopBar progress area', () => {
  const css = () => readFileSync('src/ui/shell.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  it('sits after the breadcrumb and before the actions, inside a nav named by its label', () => {
    render(
      <TopBar
        title="AVL Trees"
        breadcrumb="Crumb"
        progress={<span>Progress content</span>}
        progressLabel="Your progress"
        actions={[{ label: 'Sandbox', onClick: () => {} }]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Your progress' });
    expect(nav).toContainElement(screen.getByText('Progress content'));
    expect(nav.textContent).toBe('Progress content');
    const all = ['AVL Trees', 'Crumb', 'Progress content', 'Sandbox'].map((t) => screen.getByText(t));
    all.push(screen.getByRole('button', { name: /^settings/i }));
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].compareDocumentPosition(all[i]) & Node.DOCUMENT_POSITION_FOLLOWING, `item ${i}`).toBeTruthy();
    }
  });
  it('is absent when not given', () => {
    const { container } = render(<TopBar title="AVL Trees" />);
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(container.querySelector('.topbar-progress')).toBeNull();
  });
  it('NFR-04 wraps onto its own row on a phone and sits inline from 768px', () => {
    const text = css();
    const base = /\.topbar-progress\s*\{([^}]*)\}/.exec(text)?.[1] ?? '';
    expect(base).toMatch(/flex-basis:\s*100%/);
    const wide = /@media \(min-width: 768px\)\s*\{([\s\S]*?\})\s*\}/.exec(text)?.[1] ?? '';
    expect(wide).toMatch(/\.topbar-progress\s*\{[^}]*flex-basis:\s*auto/);
  });
  it('axe clean with a progress area', async () => {
    const { container } = render(
      <AppShell title="AVL Trees" progress={<span>C3 of C9</span>} progressLabel="Your progress">
        <h1>Page</h1>
      </AppShell>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
