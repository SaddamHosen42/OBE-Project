import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders loading spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with default medium size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-md');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-sm');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-lg');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="my-custom-class" />);
    const wrapper = container.querySelector('.flex');
    expect(wrapper).toHaveClass('my-custom-class');
  });

  it('renders centered by default', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.querySelector('.flex');
    expect(wrapper).toHaveClass('items-center', 'justify-center');
  });
});
