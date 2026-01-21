import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormSelect from '../FormSelect';

describe('FormSelect Component', () => {
  const mockOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  it('renders select with label', () => {
    render(
      <FormSelect
        label="Choose Option"
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Choose Option')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(
      <FormSelect
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders all provided options', () => {
    render(
      <FormSelect
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('shows required asterisk when required is true', () => {
    render(
      <FormSelect
        label="Required Select"
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        required={true}
      />
    );

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-error');
  });

  it('displays error message when error prop is provided', () => {
    render(
      <FormSelect
        label="Option"
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('select-error');
  });

  it('calls onChange handler when selection changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormSelect
        name="option"
        value=""
        onChange={handleChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '2');

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(
      <FormSelect
        name="option"
        value="1"
        onChange={vi.fn()}
        options={mockOptions}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('displays the selected value', () => {
    render(
      <FormSelect
        name="option"
        value="2"
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('2');
  });

  it('applies custom className', () => {
    render(
      <FormSelect
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        className="custom-select"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });

  it('renders disabled options correctly', () => {
    const optionsWithDisabled = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2', disabled: true },
      { value: '3', label: 'Option 3' },
    ];

    render(
      <FormSelect
        name="option"
        value=""
        onChange={vi.fn()}
        options={optionsWithDisabled}
      />
    );

    const option2 = screen.getByRole('option', { name: 'Option 2' });
    expect(option2).toBeDisabled();
  });

  it('renders without label when not provided', () => {
    render(
      <FormSelect
        name="option"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    expect(screen.queryByText('Choose Option')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
