import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  it('renders search input with placeholder', () => {
    render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        placeholder="Search users..."
      />
    );

    const input = screen.getByPlaceholderText('Search users...');
    expect(input).toBeInTheDocument();
  });

  it('renders with default placeholder when not provided', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);

    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'search');

    expect(handleChange).toHaveBeenCalled();
  });

  it('shows clear button when value is not empty', () => {
    render(<SearchBar value="test" onChange={vi.fn()} />);

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="test" onChange={vi.fn()} onClear={handleClear} />);

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(handleClear).toHaveBeenCalled();
  });

  it('calls onChange with empty value when clear is clicked without onClear prop', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="test" onChange={handleChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith({ target: { value: '' } });
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<SearchBar value="" onChange={vi.fn()} disabled={true} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeDisabled();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<SearchBar value="" onChange={vi.fn()} size="sm" />);

    let input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('input-sm');

    rerender(<SearchBar value="" onChange={vi.fn()} size="lg" />);
    input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('input-lg');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SearchBar value="" onChange={vi.fn()} className="my-search" />
    );

    const formControl = container.querySelector('.form-control');
    expect(formControl).toHaveClass('my-search');
  });

  it('displays search icon', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('uses medium size by default', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('input-md');
  });
});
