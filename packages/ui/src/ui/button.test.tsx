import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Click me');
  });

  it('applies variant, color, size', () => {
    render(
      <Button variant="outline" color="danger" size="lg">
        Test
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/outline/);
    expect(btn.className).toMatch(/danger/);
    expect(btn.className).toMatch(/lg/);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders startIcon and endIcon', () => {
    const Icon = () => <svg data-testid="icon" />;
    render(
      <Button startIcon={<Icon />} endIcon={<Icon />}>
        With Icons
      </Button>
    );
    const icons = screen.getAllByTestId('icon');
    expect(icons.length).toBe(2);
  });

  it('renders children', () => {
    render(<Button>Child</Button>);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('passes extra props', () => {
    render(<Button data-testid="my-btn">Extra</Button>);
    expect(screen.getByTestId('my-btn')).toBeInTheDocument();
  });
});
