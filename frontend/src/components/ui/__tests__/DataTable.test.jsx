import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../DataTable';

describe('DataTable Component', () => {
  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  it('renders table with columns and data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    // Check column headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders empty message when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} emptyMessage="No records found" />);

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(<DataTable columns={mockColumns} data={[]} loading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('applies striped class when striped prop is true', () => {
    const { container } = render(<DataTable columns={mockColumns} data={mockData} striped={true} />);
    
    const table = container.querySelector('table');
    expect(table).toHaveClass('table-zebra');
  });

  it('applies hoverable class when hoverable prop is true', () => {
    const { container } = render(<DataTable columns={mockColumns} data={mockData} hoverable={true} />);
    
    const table = container.querySelector('table');
    expect(table).toHaveClass('table-hover');
  });

  it('calls onRowClick when row is clicked', async () => {
    const handleRowClick = vi.fn();
    const user = userEvent.setup();

    render(<DataTable columns={mockColumns} data={mockData} onRowClick={handleRowClick} />);

    const firstRowCell = screen.getByText('John Doe');
    await user.click(firstRowCell.closest('tr'));

    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('renders custom cell content using render function', () => {
    const columnsWithRender = [
      { key: 'id', label: 'ID' },
      {
        key: 'name',
        label: 'Name',
        render: (value, row) => <strong data-testid="custom-name">{value.toUpperCase()}</strong>,
      },
    ];

    render(<DataTable columns={columnsWithRender} data={mockData} />);

    expect(screen.getByTestId('custom-name')).toHaveTextContent('JOHN DOE');
  });

  it('sorts data when sortable column header is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);

    // Check if data is sorted (ascending by name)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Bob Johnson');
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[2]).toHaveTextContent('John Doe');
  });

  it('does not sort when clicking non-sortable column', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={mockColumns} data={mockData} />);

    const emailHeader = screen.getByText('Email');
    await user.click(emailHeader);

    // Data should remain in original order
    const firstRow = screen.getByText('John Doe');
    expect(firstRow).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DataTable columns={mockColumns} data={mockData} className="custom-table" />
    );

    const tableWrapper = container.firstChild;
    expect(tableWrapper).toHaveClass('custom-table');
  });

  it('uses custom keyField for row keys', () => {
    const dataWithCustomKey = [
      { customId: 'a1', name: 'John' },
      { customId: 'a2', name: 'Jane' },
    ];

    const columns = [
      { key: 'customId', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(<DataTable columns={columns} data={dataWithCustomKey} keyField="customId" />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container, rerender } = render(
      <DataTable columns={mockColumns} data={mockData} size="xs" />
    );

    let table = container.querySelector('table');
    expect(table).toHaveClass('table-xs');

    rerender(<DataTable columns={mockColumns} data={mockData} size="lg" />);
    table = container.querySelector('table');
    expect(table).toHaveClass('table-lg');
  });
});
