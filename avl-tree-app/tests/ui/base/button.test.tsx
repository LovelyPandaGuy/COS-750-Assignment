import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../../src/ui/base';
import { baseCss, rule } from './css-helpers';

// Spec: add-ui-foundation / ui-foundation "Button". Requirement IDs: NFR-02, D3, FR-VIS-10.
// Keyboard activation (Enter, Space) is checked in the browser: tests/visual/foundation.spec.ts.

const VARIANTS = ['primary', 'secondary', 'quiet'] as const;

describe('NFR-02 Button variants render as native buttons', () => {
  it.each(VARIANTS)('%s is a <button type="button"> with its variant class', (variant) => {
    render(<Button variant={variant}>Continue</Button>);
    const b = screen.getByRole('button', { name: 'Continue' });
    expect(b.tagName).toBe('BUTTON');
    expect(b).toHaveAttribute('type', 'button');
    expect(b).toHaveClass('btn', `btn-${variant}`);
  });
  it('defaults to secondary', () => {
    render(<Button>Replay</Button>);
    expect(screen.getByRole('button', { name: 'Replay' })).toHaveClass('btn-secondary');
  });
});

describe('NFR-02 Button states come from tokens', () => {
  it('default: primary, secondary and quiet take the design-system roles', () => {
    const css = baseCss();
    const primary = rule(css, '.btn-primary');
    expect(primary).toContain('var(--action-primary)');
    expect(primary).toContain('var(--bg-surface)');
    const secondary = rule(css, '.btn-secondary');
    expect(secondary).toContain('var(--border-control)');
    expect(secondary).toContain('var(--action-primary)');
    const quiet = rule(css, '.btn-quiet');
    expect(quiet).toContain('var(--action-primary)');
    expect(quiet).not.toMatch(/var\(--border-control\)|var\(--bg-surface\)/);
  });
  it('hover: primary darkens, secondary tints, quiet underlines; never while disabled', () => {
    const css = baseCss();
    expect(rule(css, '.btn-primary:hover:not(:disabled)')).toContain('var(--action-primary-hover)');
    expect(rule(css, '.btn-secondary:hover:not(:disabled)')).toContain('var(--action-primary-tint)');
    expect(rule(css, '.btn-quiet:hover:not(:disabled)')).toMatch(/text-decoration:\s*underline/);
  });
  it('pressed: primary and quiet use the pressed token, secondary the tint, quiet stays underlined', () => {
    const css = baseCss();
    expect(rule(css, '.btn-primary:active:not(:disabled)')).toContain('var(--action-primary-pressed)');
    expect(rule(css, '.btn-secondary:active:not(:disabled)')).toContain('var(--action-primary-tint)');
    const quiet = rule(css, '.btn-quiet:active:not(:disabled)');
    expect(quiet).toContain('var(--action-primary-pressed)');
    expect(quiet).toMatch(/text-decoration:\s*underline/);
  });
  it('focus: the base stylesheet leaves the shared ring alone', () => {
    const css = baseCss();
    expect(css).not.toMatch(/outline|:focus/);
  });
  it('disabled: readable disabled tokens', () => {
    const css = baseCss();
    const d = rule(css, '.btn:disabled');
    expect(d).toContain('var(--disabled-text)');
    expect(d).toContain('var(--disabled-bg)');
  });
  it('D3 FR-VIS-10 targets are at least --target-min', () => {
    const b = rule(baseCss(), '.btn');
    expect(b).toMatch(/min-height:\s*var\(--target-min\)/);
    expect(b).toMatch(/min-width:\s*var\(--target-min\)/);
  });
});

describe('NFR-02 Button behaviour', () => {
  it('an enabled button calls its handler once per click', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>Continue</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onClick).toHaveBeenCalledTimes(2);
  });
  it('a disabled button is disabled and is not activated', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" disabled onClick={onClick}>Continue</Button>);
    const b = screen.getByRole('button', { name: 'Continue' });
    expect(b).toBeDisabled();
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });
  it('a disabled reason is shown next to the button and described by it', () => {
    render(<Button variant="secondary" disabled disabledReason="Answer first to see the replay">Replay</Button>);
    const b = screen.getByRole('button', { name: 'Replay' });
    const reason = screen.getByText('Answer first to see the replay');
    expect(reason).toBeVisible();
    expect(b).toHaveAttribute('aria-describedby', reason.id);
    expect(b).toHaveAccessibleDescription('Answer first to see the replay');
  });
  it('no reason is rendered while enabled', () => {
    render(<Button disabledReason="Answer first">Replay</Button>);
    expect(screen.queryByText('Answer first')).toBeNull();
    expect(screen.getByRole('button', { name: 'Replay' })).not.toHaveAttribute('aria-describedby');
  });
  it('passes type through when asked for submit', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit');
  });
});

describe('NFR-02 Button axe', () => {
  it.each(VARIANTS)('%s default and disabled have no violations', async (variant) => {
    const { container } = render(
      <div>
        <Button variant={variant}>Continue</Button>
        <Button variant={variant} disabled disabledReason="Answer first">Continue later</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
