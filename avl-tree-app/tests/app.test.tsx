import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { App } from '../src/App';

describe('App shell', () => {
  it('renders a heading and has no axe violations', async () => {
    const { container } = render(<App />);
    expect(screen.getByRole('heading', { name: /avl primer/i })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
