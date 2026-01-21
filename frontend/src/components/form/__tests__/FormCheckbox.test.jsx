import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormCheckbox from '../FormCheckbox';

describe('FormCheckbox Component', () => {
  it('renders checkbox with label', () => {
    render(
      <FormCheckbox
        label="Accept Terms"
        name="terms"
        checked={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders checkbox without label', () => {
    render(
      <FormCheckbox
        name="terms"
        checked={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByText('Accept Terms')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders as checked when checked prop is true', () => {
    render(
      <FormCheckbox
        label="Agree"
        name="agree"
        checked={true}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders as unchecked when checked prop is false', () => {
    render(
      <FormCheckbox
        label="Agree"
        name="agree"
        checked={false}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange handler when clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormCheckbox
        label="Accept"
        name="accept"
        checked={false}
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(
      <FormCheckbox
        label="Disabled"
        name="disabled"
        checked={false}
        onChange={vi.fn()}
        disabled={true}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <FormCheckbox
        label="Terms"
        name="terms"
        checked={false}
        onChange={vi.fn()}
        error="You must accept the terms"
      />
    );

    expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
        size="sm"
      />
    );

    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('checkbox-sm');

    rerender(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
        size="md"
      />
    );

    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('checkbox-md');

    rerender(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
        size="lg"
      />
    );

    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('checkbox-lg');
  });

  it('applies color classes correctly', () => {
    render(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
        color="success"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('checkbox-success');
  });

  it('applies custom className', () => {
    render(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
        className="custom-checkbox"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-checkbox');
  });

  it('uses default medium size when size not specified', () => {
    render(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('checkbox-md');
  });

  it('uses primary color by default when color not specified', () => {
    render(
      <FormCheckbox
        name="test"
        checked={false}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('checkbox-primary');
  });
});
