import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { App } from '../src/App';
import { startCopy } from '../src/content/start';

describe('App shell', () => {
  it('renders a heading and has no axe violations', async () => {
    const { container } = render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: startCopy.heading })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
