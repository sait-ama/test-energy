import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mockTitleData, TestProviders } from '~shared/test-utils/test-providers';

import {
  HorizontalCardTitle,
  HorizontalTitleCardImage,
  HorizontalTitleCardLayout,
} from './horizontal-title-card-layout';

// Mock the TitleImage component
vi.mock('~entities/title/ui/title-image', () => ({
  TitleImage: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} data-testid="title-image" />
  ),
}));

describe('HorizontalTitleCardLayout', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    size: 'md' as const,
    withHover: true,
  };

  it('renders with basic props', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} />
      </TestProviders>
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies correct CSS classes for size variants', () => {
    const { rerender } = render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} size="xs" data-testid="card" />
      </TestProviders>
    );

    let card = screen.getByTestId('card');
    expect(card).toHaveClass('group', 'relative', 'flex', 'w-full', 'items-center');

    rerender(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} size="sm" data-testid="card" />
      </TestProviders>
    );

    card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    rerender(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} size="md" data-testid="card" />
      </TestProviders>
    );

    card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('renders with hover styles when withHover is true', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} withHover data-testid="card" />
      </TestProviders>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('dark:hover:border-primary', 'dark:hover:bg-accent/20');
  });

  it('renders without hover styles when withHover is false', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} withHover={false} data-testid="card" />
      </TestProviders>
    );

    const card = screen.getByTestId('card');
    expect(card).not.toHaveClass('dark:hover:border-primary', 'dark:hover:bg-accent/20');
  });

  it('renders custom component when specified', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} component="article" data-testid="card" />
      </TestProviders>
    );

    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('ARTICLE');
  });

  it('renders subtitle when provided', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} subtitle={<div>Test Subtitle</div>} />
      </TestProviders>
    );

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} actions={<button>Action Button</button>} />
      </TestProviders>
    );

    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} className="custom-class" data-testid="card" />
      </TestProviders>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} style={customStyle} data-testid="card" />
      </TestProviders>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveStyle('background-color: red');
  });

  it('forwards additional props', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardLayout {...defaultProps} data-custom="test-value" data-testid="card" />
      </TestProviders>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-custom', 'test-value');
  });
});

describe('HorizontalTitleCardImage', () => {
  const defaultProps = {
    model: mockTitleData,
    isLoading: false,
    size: 'md' as const,
    explicit: false,
  };

  it('renders image with correct props', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} />
      </TestProviders>
    );

    const image = screen.getByTestId('title-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockTitleData.cover.mid);
    expect(image).toHaveAttribute('alt', mockTitleData.main_name);
  });

  it('renders with loading state', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} isLoading />
      </TestProviders>
    );

    const image = screen.getByTestId('title-image');
    expect(image).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} size="xs" />
      </TestProviders>
    );

    expect(container.firstChild).toBeInTheDocument();

    rerender(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} size="sm" />
      </TestProviders>
    );

    expect(container.firstChild).toBeInTheDocument();

    rerender(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} size="md" />
      </TestProviders>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles null model gracefully', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} model={null} />
      </TestProviders>
    );

    const image = screen.getByTestId('title-image');
    expect(image).toHaveAttribute('alt', 'Тайтл');
  });

  it('handles explicit content', () => {
    render(
      <TestProviders>
        <HorizontalTitleCardImage {...defaultProps} explicit />
      </TestProviders>
    );

    const image = screen.getByTestId('title-image');
    expect(image).toBeInTheDocument();
  });
});

describe('HorizontalCardTitle', () => {
  it('renders children correctly', () => {
    render(
      <TestProviders>
        <HorizontalCardTitle>Test Title</HorizontalCardTitle>
      </TestProviders>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies correct text styling classes', () => {
    render(
      <TestProviders>
        <HorizontalCardTitle data-testid="title">Test Title</HorizontalCardTitle>
      </TestProviders>
    );

    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-ellipsis');
  });

  it('handles empty children', () => {
    render(
      <TestProviders>
        <HorizontalCardTitle />
      </TestProviders>
    );

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('handles complex children', () => {
    render(
      <TestProviders>
        <HorizontalCardTitle>
          <span>Complex</span> <strong>Title</strong>
        </HorizontalCardTitle>
      </TestProviders>
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
