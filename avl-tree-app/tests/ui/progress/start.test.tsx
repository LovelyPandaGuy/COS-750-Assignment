import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { startCopy } from '../../../src/content/start';
import { ResetProgressLink } from '../../../src/ui/progress/ResetProgressLink';
import { StartView } from '../../../src/ui/progress/StartView';
import { D3_INTRO, dialog, renderAt, startPanel, textNodes } from './fixtures';

// Spec: revamp-progress-and-hub / ui-progress "Start screen", "Reset needs confirmation and says what is
// erased", "Components show state and words they are given". Wireframe 1b; D3.

const privacy = { text: 'Example: stored on this device only, nothing is sent anywhere.' };
const resume = { heading: 'Example welcome back', line: 'Example: you stopped at C4', resumeLabel: 'Example resume' };

function view(withResume: boolean, onResume = vi.fn(), onStart = vi.fn(), onReset = vi.fn()) {
  return renderAt(
    <StartView
      panel={{ ...startPanel, onStart }}
      resume={withResume ? { ...resume, onResume } : undefined}
      privacy={privacy}
      reset={{ label: 'Example reset my progress', dialog, onReset }}
    />,
  );
}

const primaries = (root: Element) => Array.from(root.querySelectorAll('a, button')).filter((el) => /primary/.test(el.className));

describe('FR-ONB-02 NFR-05 first visit', () => {
  it('no ResumeCard, one primary button (start), privacy text visible', () => {
    const { container } = view(false);
    expect(screen.queryByText('Example welcome back')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Example resume' })).toBeNull();
    const p = primaries(container);
    expect(p).toHaveLength(1);
    expect(p[0]).toHaveTextContent('Example start');
    const notice = screen.getByText(privacy.text);
    expect(notice).toBeVisible();
    expect(notice.closest('a, button, details, [hidden]')).toBeNull();
  });

  it('the start button calls onStart', async () => {
    const onStart = vi.fn();
    view(false, vi.fn(), onStart);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example start' }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('D3 the session length is the given intro, with no duration added', () => {
    const { container } = view(false);
    expect(screen.getByText(D3_INTRO)).toBeVisible();
    const others = textNodes(container).filter((t) => t !== D3_INTRO);
    for (const t of others) expect(t).not.toMatch(/\bminutes?\b|\bmin\b|\bhours?\b/i);
  });
});

describe('FR-ONB-03 returning', () => {
  it('the ResumeCard shows the line and Resume calls onResume once', async () => {
    const onResume = vi.fn();
    view(true, onResume);
    expect(screen.getByText('Example: you stopped at C4')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example resume' }));
    expect(onResume).toHaveBeenCalledTimes(1);
  });
});

describe('FR-ONB-01 no credential fields', () => {
  it.each([false, true])('with resume %s', (withResume) => {
    const { container } = view(withResume);
    expect(container.querySelector('input[type="password"], input[type="email"]')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});

describe('FR-ONB-04 reset needs confirmation', () => {
  const setup = () => {
    const onReset = vi.fn();
    renderAt(<ResetProgressLink label="Example reset my progress" dialog={dialog} onReset={onReset} />);
    return { onReset, link: screen.getByRole('button', { name: 'Example reset my progress' }), user: userEvent.setup() };
  };

  it('confirm resets once and closes the dialog', async () => {
    const { onReset, link, user } = setup();
    await user.click(link);
    await user.click(screen.getByRole('button', { name: 'Example reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Cancel and Escape do nothing and return focus to the link', async () => {
    const { onReset, link, user } = setup();
    await user.click(link);
    await user.click(screen.getByRole('button', { name: 'Example cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(link).toHaveFocus();
    await user.click(link);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(link).toHaveFocus();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('the dialog names what is erased, and focus starts on Cancel', async () => {
    const { link, user } = setup();
    await user.click(link);
    const d = screen.getByRole('dialog', { name: dialog.title });
    expect(d).toHaveAccessibleDescription(dialog.body);
    expect(screen.getByRole('button', { name: 'Example cancel' })).toHaveFocus();
  });

  it("the app's own wording names the answers and the lecture questions and says it cannot be undone", () => {
    expect(startCopy.dialogBody).toMatch(/answers/i);
    expect(startCopy.dialogBody).toMatch(/lecture questions/i);
    expect(startCopy.dialogBody).toMatch(/can.t be undone|cannot be undone/i);
  });
});

describe('D18 only given words appear', () => {
  it('every text node is a fixture string', () => {
    const { container } = view(true);
    const given = new Set([
      startPanel.heading, startPanel.intro, ...startPanel.points, startPanel.startLabel,
      resume.heading, resume.line, resume.resumeLabel, privacy.text, 'Example reset my progress',
    ]);
    for (const t of textNodes(container)) expect(given, t).toContain(t);
  });
});

describe('NFR-02 axe', () => {
  it.each([false, true])('StartView, resume %s', async (withResume) => {
    const { container } = view(withResume);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('with the dialog open', async () => {
    const { container } = view(true);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example reset my progress' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
