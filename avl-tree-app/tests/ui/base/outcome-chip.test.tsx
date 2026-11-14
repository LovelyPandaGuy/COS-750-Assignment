import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { baseCopy } from '../../../src/content/base';
import { CHIP_LEVELS, OutcomeChip } from '../../../src/ui/base';
import { baseCss, rule } from './css-helpers';

// Spec: add-ui-foundation / ui-foundation "OutcomeChip". Requirement IDs: NFR-02, D25, D3.
// [OPEN] The ID uses a fourth Bloom level, analyse (LO7, LO9); the design system styles only three.
// The chip takes only the designed three until the design adds analyse.

const TEXT = 'Fix an LR imbalance with two rotations';
const GLYPH = { remember: 'circle', understand: 'diamond', apply: 'triangle' } as const;

describe('NFR-02 D25 word, glyph and text', () => {
  it('apply: word from content, hidden triangle glyph, then the text, in the apply tokens', () => {
    const { container } = render(<OutcomeChip level="apply" text={TEXT} />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip).toHaveClass('chip', 'chip-apply');
    expect(chip).toHaveTextContent(`${baseCopy.bloom.apply}${TEXT}`);
    const glyph = chip.querySelector('svg')!;
    expect(glyph).toHaveAttribute('data-glyph', 'triangle');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    const css = rule(baseCss(), '.chip-apply');
    expect(css).toContain('var(--bloom-apply)');
    expect(css).toContain('var(--bloom-apply-tint)');
  });
  it.each(CHIP_LEVELS)('%s has its own glyph and tokens', (level) => {
    const { container } = render(<OutcomeChip level={level} text={TEXT} />);
    expect(container.querySelector('svg')).toHaveAttribute('data-glyph', GLYPH[level]);
    expect(container).toHaveTextContent(baseCopy.bloom[level]);
    expect(rule(baseCss(), `.chip-${level}`)).toContain(`var(--bloom-${level})`);
  });
});

describe('[OPEN] analyse', () => {
  it('the chip levels are the three the design system styles', () => {
    expect(CHIP_LEVELS).toEqual(['remember', 'understand', 'apply']);
  });
});

describe('NFR-02 static by default', () => {
  it('no link, no button, not focusable', () => {
    const { container } = render(<OutcomeChip level="understand" text={TEXT} />);
    expect(container.querySelector('a, button, [tabindex]')).toBeNull();
  });
});

describe('NFR-02 D3 interactive with a target', () => {
  it('with href it is a link to that address', () => {
    render(<OutcomeChip level="apply" text={TEXT} href="/module/C6/example" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/module/C6/example');
    expect(link).toHaveTextContent(TEXT);
    expect(link).toHaveClass('chip-interactive');
  });
  it('with onSelect it is a button that calls the handler', () => {
    const onSelect = vi.fn();
    render(<OutcomeChip level="apply" text={TEXT} onSelect={onSelect} />);
    const b = screen.getByRole('button');
    expect(b).toHaveAttribute('type', 'button');
    expect(b).toHaveClass('chip-interactive');
    fireEvent.click(b);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
  it('a disabled interactive chip is not activated', () => {
    const onSelect = vi.fn();
    render(<OutcomeChip level="apply" text={TEXT} onSelect={onSelect} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).not.toHaveBeenCalled();
  });
  it('targets and hover come from the stylesheet', () => {
    const css = baseCss();
    const target = rule(css, '.chip-interactive');
    expect(target).toMatch(/min-height:\s*var\(--target-min\)/);
    expect(target).toMatch(/min-width:\s*var\(--target-min\)/);
    expect(rule(css, '.chip-interactive:hover:not(:disabled)')).toMatch(/text-decoration:\s*underline/);
  });
});

describe('NFR-02 OutcomeChip axe', () => {
  it.each(CHIP_LEVELS)('%s static and interactive have no violations', async (level) => {
    const { container } = render(
      <div>
        <OutcomeChip level={level} text={TEXT} />
        <OutcomeChip level={level} text={TEXT} href="/readiness" />
        <OutcomeChip level={level} text={TEXT} onSelect={() => {}} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
