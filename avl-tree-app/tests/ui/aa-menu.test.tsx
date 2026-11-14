import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { App } from '../../src/App';
import { AaMenu } from '../../src/ui/AaMenu';
import { ThemeProvider } from '../../src/ui/ThemeContext';
import { createSettingsStorage } from '../../src/state/storage';

// Spec: add-design-tokens-and-shell / app-shell, "Aa menu stub". Requirement IDs: NFR-02, NFR-05, FR-VIS-10.
// The panel's Dark theme switch (add-dark-mode-toggle) is tested in theme-switch.test.tsx.
const btn = () => screen.getByRole('button', { name: 'Display and read-aloud settings' });

afterEach(() => vi.restoreAllMocks());

describe('NFR-02 Aa menu stub', () => {
  it('starts closed with a named, labelled button', () => {
    render(<App />);
    expect(btn()).toHaveTextContent('Aa');
    expect(btn()).toHaveAttribute('aria-expanded', 'false');
    const id = btn().getAttribute('aria-controls')!;
    expect(id).toBeTruthy();
    expect(screen.queryByRole('region', { name: /display and read-aloud/i })).toBeNull();
  });

  it('is a native button, so Enter and Space activate it as click', () => {
    render(<AaMenu />);
    expect(btn().tagName).toBe('BUTTON');
    expect(btn()).not.toHaveAttribute('tabindex', '-1');
    expect(btn()).toHaveAttribute('type', 'button');
  });

  // add-narration: the placeholder line is gone, so the panel's content is the settings, which need the
  // theme provider the app always mounts.
  it('opens on click and shows the panel copy', () => {
    render(
      <ThemeProvider settings={createSettingsStorage(null)} initial="light">
        <AaMenu />
      </ThemeProvider>,
    );
    fireEvent.click(btn());
    expect(btn()).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region', { name: /display and read-aloud/i });
    expect(panel).toBeVisible();
    expect(panel.id).toBe(btn().getAttribute('aria-controls'));
    expect(panel.textContent!.trim().length).toBeGreaterThan(0);
  });

  it('closes on Escape and returns focus to the button', () => {
    render(<AaMenu />);
    fireEvent.click(btn());
    screen.getByRole('region', { name: /display and read-aloud/i }).focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(btn()).toHaveAttribute('aria-expanded', 'false');
    expect(btn()).toHaveFocus();
  });

  it('closes when the button is activated again', () => {
    render(<AaMenu />);
    fireEvent.click(btn());
    fireEvent.click(btn());
    expect(btn()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a click outside the panel', () => {
    render(
      <div>
        <AaMenu />
        <p>elsewhere</p>
      </div>,
    );
    fireEvent.click(btn());
    fireEvent.mouseDown(screen.getByText('elsewhere'));
    fireEvent.click(screen.getByText('elsewhere'));
    expect(btn()).toHaveAttribute('aria-expanded', 'false');
  });

  it('stays open on a click inside the panel', () => {
    render(<AaMenu />);
    fireEvent.click(btn());
    const panel = screen.getByRole('region', { name: /display and read-aloud/i });
    fireEvent.mouseDown(panel);
    fireEvent.click(panel);
    expect(btn()).toHaveAttribute('aria-expanded', 'true');
  });

  it('NFR-05 writes no storage and makes no network request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const before = localStorage.length;
    render(<AaMenu />);
    fireEvent.click(btn());
    fireEvent.click(btn());
    expect(localStorage.length).toBe(before);
    expect(setItem).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('takes its name and copy from src/content/shell.ts', () => {
    const src = readFileSync('src/ui/AaMenu.tsx', 'utf8');
    expect(src).not.toMatch(/Display and read-aloud settings/);
  });

  it('has no axe violations when open', async () => {
    const { container } = render(<App />);
    fireEvent.click(btn());
    expect(await axe(container)).toHaveNoViolations();
  });
});
