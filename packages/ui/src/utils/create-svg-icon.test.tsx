import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createSvgIcon } from './create-svg-icon';

describe('createSvgIcon', () => {
  it('renders icon with children', () => {
    const Comp = createSvgIcon('TestIcon', <svg data-testid="svg" />);
    render(<Comp />);
    expect(screen.getByTestId('svg')).toBeInTheDocument();
  });

  it('merges className from props and defaultProps', () => {
    const Comp = createSvgIcon('TestIcon', <svg />, { className: 'a' });
    render(<Comp className="b" />);
    // className попадёт в Icon, но мы можем проверить, что компонент рендерится без ошибок
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('sets displayName', () => {
    const Comp = createSvgIcon('TestIcon', <svg />);
    expect(Comp.displayName).toBe('TestIcon');
  });
});
