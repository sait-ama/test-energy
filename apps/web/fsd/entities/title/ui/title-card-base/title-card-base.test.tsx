import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TestProviders } from '~shared/test-utils/test-providers';

import {
  TitleActionsRoot,
  TitleCardBookmarkState,
  TitleCardContent,
  TitleCardRating,
  TitleCardRoot,
  TitleCardSubtitle,
  TitleCardTitle,
  TitleImage,
} from './title-card-base';

interface MediaProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Mock the MediaPrimitive components
vi.mock('@re/ui-kit/ui/media', () => ({
  Root: ({ children, className, ...props }: MediaProps) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  MediaNativeImage: ({ className, ...props }: Omit<MediaProps, 'children'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} {...props} data-testid="media-image" />
  ),
  Fallback: ({ children, className, ...props }: MediaProps) => (
    <div className={className} {...props} data-testid="media-fallback">
      {children}
    </div>
  ),
}));

// Mock the UrlFormatter
vi.mock('~shared/utils/url-formatter', () => ({
  UrlFormatter: {
    media: (src: string) => (src ? `https://cdn.example.com${src}` : ''),
  },
}));

// Mock the Title placeholder icon
vi.mock('~shared/assets/placeholders/title', () => ({
  default: ({ size, className }: { size: number; className: string }) => (
    <svg width={size} height={size} className={className} data-testid="title-placeholder">
      <rect width={size} height={size} fill="currentColor" />
    </svg>
  ),
}));

// Mock the Star icon
vi.mock('@re/ui-kit/icons/star', () => ({
  default: ({ size, className }: { size: number; className: string }) => (
    <svg width={size} height={size} className={className} data-testid="star-icon">
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="currentColor" />
    </svg>
  ),
}));

describe('TitleCardRoot', () => {
  it('renders as div by default', () => {
    render(
      <TestProviders>
        <TitleCardRoot data-testid="card-root">
          <div>Test Content</div>
        </TitleCardRoot>
      </TestProviders>
    );

    const root = screen.getByTestId('card-root');
    expect(root.tagName).toBe('DIV');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders as child component when asChild is true', () => {
    render(
      <TestProviders>
        <TitleCardRoot asChild>
          <article data-testid="card-root">
            <div>Test Content</div>
          </article>
        </TitleCardRoot>
      </TestProviders>
    );

    const root = screen.getByTestId('card-root');
    expect(root.tagName).toBe('ARTICLE');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <TestProviders>
        <TitleCardRoot data-testid="card-root">Content</TitleCardRoot>
      </TestProviders>
    );

    const root = screen.getByTestId('card-root');
    expect(root).toHaveClass(
      'group',
      'cs-title-card',
      'cs-title-vertical-card',
      'relative',
      'flex',
      'h-full',
      'flex-col'
    );
  });

  it('merges custom className', () => {
    render(
      <TestProviders>
        <TitleCardRoot className="custom-class" data-testid="card-root">
          Content
        </TitleCardRoot>
      </TestProviders>
    );

    const root = screen.getByTestId('card-root');
    expect(root).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(
      <TestProviders>
        <TitleCardRoot data-custom="test-value" data-testid="card-root">
          Content
        </TitleCardRoot>
      </TestProviders>
    );

    const root = screen.getByTestId('card-root');
    expect(root).toHaveAttribute('data-custom', 'test-value');
  });
});

describe('TitleCardContent', () => {
  it('renders children with correct styling', () => {
    render(
      <TestProviders>
        <TitleCardContent data-testid="card-content">
          <div>Test Content</div>
        </TitleCardContent>
      </TestProviders>
    );

    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('flex', 'flex-col', 'gap-1', 'px-1', 'pb-1');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <TestProviders>
        <TitleCardContent className="custom-content" data-testid="card-content">
          Content
        </TitleCardContent>
      </TestProviders>
    );

    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('custom-content');
  });
});

describe('TitleCardTitle', () => {
  it('renders title text with correct styling', () => {
    render(
      <TestProviders>
        <TitleCardTitle data-testid="card-title">Test Title</TitleCardTitle>
      </TestProviders>
    );

    const title = screen.getByTestId('card-title');
    expect(title).toHaveClass('text-foreground');
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <TestProviders>
        <TitleCardTitle className="custom-title" data-testid="card-title">
          Title
        </TitleCardTitle>
      </TestProviders>
    );

    const title = screen.getByTestId('card-title');
    expect(title).toHaveClass('custom-title');
  });

  it('handles long text with line clamping', () => {
    const longTitle = 'This is a very long title that should be clamped to two lines maximum';
    render(
      <TestProviders>
        <TitleCardTitle data-testid="card-title">{longTitle}</TitleCardTitle>
      </TestProviders>
    );

    const title = screen.getByTestId('card-title');
    expect(title).toBeInTheDocument();
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});

describe('TitleActionsRoot', () => {
  it('renders children correctly', () => {
    render(
      <TestProviders>
        <TitleActionsRoot data-testid="actions-root">
          <button>Action 1</button>
          <button>Action 2</button>
        </TitleActionsRoot>
      </TestProviders>
    );

    const actionsRoot = screen.getByTestId('actions-root');
    expect(actionsRoot).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });
});

describe('TitleImage', () => {
  it('renders image with correct src and styling', () => {
    render(
      <TestProviders>
        <TitleImage src="/test-image.jpg" alt="Test Image" />
      </TestProviders>
    );

    const image = screen.getByTestId('media-image');
    expect(image).toHaveAttribute('alt', 'Test Image');
  });

  it('renders fallback when image fails to load', () => {
    render(
      <TestProviders>
        <TitleImage src="" alt="Test Image" />
      </TestProviders>
    );

    const fallback = screen.getByTestId('media-fallback');
    expect(fallback).toBeInTheDocument();

    const placeholder = screen.getByTestId('title-placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TestProviders>
        <TitleImage src="/test.jpg" className="custom-image" alt="Test" />
      </TestProviders>
    );

    const image = screen.getByTestId('media-image');
    expect(image).toHaveClass('custom-image');
  });

  it('renders slot content when provided', () => {
    render(
      <TestProviders>
        <TitleImage
          src="/test.jpg"
          alt="Test"
          slot={<div data-testid="slot-content">Slot Content</div>}
        />
      </TestProviders>
    );

    expect(screen.getByTestId('slot-content')).toBeInTheDocument();
  });
});

describe('TitleCardSubtitle', () => {
  it('renders subtitle with correct styling', () => {
    render(
      <TestProviders>
        <TitleCardSubtitle data-testid="card-subtitle">Test Subtitle</TitleCardSubtitle>
      </TestProviders>
    );

    const subtitle = screen.getByTestId('card-subtitle');
    expect(subtitle).toHaveClass('text-[12px]');
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <TestProviders>
        <TitleCardSubtitle className="custom-subtitle" data-testid="card-subtitle">
          Subtitle
        </TitleCardSubtitle>
      </TestProviders>
    );

    const subtitle = screen.getByTestId('card-subtitle');
    expect(subtitle).toHaveClass('custom-subtitle');
  });
});

describe('TitleCardRating', () => {
  it('renders rating with star icon', () => {
    render(
      <TestProviders>
        <TitleCardRating data-testid="card-rating">8.5</TitleCardRating>
      </TestProviders>
    );

    const rating = screen.getByTestId('card-rating');
    expect(rating).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
  });

  it('does not render when rating is "0.0"', () => {
    render(
      <TestProviders>
        <TitleCardRating data-testid="card-rating">0.0</TitleCardRating>
      </TestProviders>
    );

    expect(screen.queryByTestId('card-rating')).not.toBeInTheDocument();
  });

  it('does not render when rating is empty', () => {
    render(
      <TestProviders>
        <TitleCardRating data-testid="card-rating"></TitleCardRating>
      </TestProviders>
    );

    expect(screen.queryByTestId('card-rating')).not.toBeInTheDocument();
  });

  it('does not render when rating is null', () => {
    render(
      <TestProviders>
        <TitleCardRating data-testid="card-rating">{null}</TitleCardRating>
      </TestProviders>
    );

    expect(screen.queryByTestId('card-rating')).not.toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <TestProviders>
        <TitleCardRating data-testid="card-rating">7.8</TitleCardRating>
      </TestProviders>
    );

    const rating = screen.getByTestId('card-rating');
    expect(rating).toHaveClass(
      'bg-background/70',
      'flex',
      'flex-nowrap',
      'items-center',
      'gap-2',
      'rounded-md'
    );
  });

  it('merges custom className', () => {
    render(
      <TestProviders>
        <TitleCardRating className="custom-rating" data-testid="card-rating">
          9.1
        </TitleCardRating>
      </TestProviders>
    );

    const rating = screen.getByTestId('card-rating');
    expect(rating).toHaveClass('custom-rating');
  });
});

describe('TitleCardBookmarkState', () => {
  it('renders bookmark state text', () => {
    render(
      <TestProviders>
        <TitleCardBookmarkState data-testid="bookmark-state">Watching</TitleCardBookmarkState>
      </TestProviders>
    );

    const bookmark = screen.getByTestId('bookmark-state');
    expect(bookmark).toBeInTheDocument();
    expect(screen.getByText('Watching')).toBeInTheDocument();
  });

  it('truncates long text with ellipsis', () => {
    const longText = 'Very long bookmark state text that should be truncated';
    render(
      <TestProviders>
        <TitleCardBookmarkState data-testid="bookmark-state">{longText}</TitleCardBookmarkState>
      </TestProviders>
    );

    const bookmark = screen.getByTestId('bookmark-state');
    expect(bookmark).toBeInTheDocument();
    // Should be truncated to 12 characters + '...'
    expect(screen.getByText('Very long bo...')).toBeInTheDocument();
  });

  it('does not render when children is not a string', () => {
    render(
      <TestProviders>
        <TitleCardBookmarkState data-testid="bookmark-state">
          {123 as unknown as string}
        </TitleCardBookmarkState>
      </TestProviders>
    );

    expect(screen.queryByTestId('bookmark-state')).not.toBeInTheDocument();
  });

  it('does not render when children is empty', () => {
    render(
      <TestProviders>
        <TitleCardBookmarkState data-testid="bookmark-state">""</TitleCardBookmarkState>
      </TestProviders>
    );

    expect(screen.queryByTestId('bookmark-state')).not.toBeInTheDocument();
  });

  it('does not render when children is null', () => {
    render(
      <TestProviders>
        <TitleCardBookmarkState data-testid="bookmark-state">{null}</TitleCardBookmarkState>
      </TestProviders>
    );

    expect(screen.queryByTestId('bookmark-state')).not.toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <TestProviders>
        <TitleCardBookmarkState data-testid="bookmark-state">Reading</TitleCardBookmarkState>
      </TestProviders>
    );

    const bookmark = screen.getByTestId('bookmark-state');
    expect(bookmark).toHaveClass(
      'bg-secondary/60',
      'text-muted-foreground',
      'rounded-sm',
      'px-2',
      'py-1.5'
    );
  });

  it('merges custom className', () => {
    render(
      <TestProviders>
        <TitleCardBookmarkState className="custom-bookmark" data-testid="bookmark-state">
          Completed
        </TitleCardBookmarkState>
      </TestProviders>
    );

    const bookmark = screen.getByTestId('bookmark-state');
    expect(bookmark).toHaveClass('custom-bookmark');
  });
});
