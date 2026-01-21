import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormInput from '../FormInput';

describe('FormInput Component', () => {
  it('renders input with label', () => {
    render(
      <FormInput
        label="Username"
        name="username"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    render(
      <FormInput
        name="username"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByText('Username')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required asterisk when required is true', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={vi.fn()}
        required={true}
      />
    );

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-error');
  });

  it('displays placeholder text', () => {
    render(
      <FormInput
        name="username"
        value=""
        onChange={vi.fn()}
        placeholder="Enter username"
      />
    );

    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={vi.fn()}
        error="Email is required"
      />
    );

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-error');
  });

  it('calls onChange handler when input value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormInput
        name="username"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(
      <FormInput
        name="username"
        value="disabled"
        onChange={vi.fn()}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders with correct input type', () => {
    const { rerender } = render(
      <FormInput
        name="email"
        type="email"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(
      <FormInput
        name="password"
        type="password"
        value=""
        onChange={vi.fn()}
      />
    );

    const passwordInput = screen.getByPlaceholderText('') || document.querySelector('input[type="password"]');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('applies custom className', () => {
    render(
      <FormInput
        name="username"
        value=""
        onChange={vi.fn()}
        className="custom-input"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('passes additional props to input element', () => {
    render(
      <FormInput
        name="username"
        value=""
        onChange={vi.fn()}
        data-testid="custom-input"
        maxLength={50}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-testid', 'custom-input');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  it('displays the provided value', () => {
    render(
      <FormInput
        name="username"
        value="John Doe"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('John Doe');
  });
});
