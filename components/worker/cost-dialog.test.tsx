import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CostDialog } from './cost-dialog';

// Mocks
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

global.fetch = jest.fn();

// Mock ResizeObserver for Dialog
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Fix JSDOM missing implementations
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.PointerEvent = MouseEvent as any;

describe('CostDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    jobId: 'job-123',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CostDialog {...defaultProps} />);
    expect(screen.getByText('Masraf Ekle')).toBeInTheDocument();
    expect(screen.getByLabelText('Tutar (TL)')).toBeInTheDocument();
  });

  it('submits form correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Disable pointer events check which can be flaky with Radix in JSDOM
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CostDialog {...defaultProps} />);

    // Fill amount
    await user.type(screen.getByLabelText('Tutar (TL)'), '150');

    // Fill description
    await user.type(screen.getByLabelText('Açıklama'), 'Lunch');

    // Select category
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    // Wait for content
    const options = await screen.findAllByText('Yemek');
    await user.click(options[options.length - 1]);

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Kaydet' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/worker/costs', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"amount":150'),
      }));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/worker/costs', expect.objectContaining({
       body: expect.stringContaining('"category":"FOOD"'),
    }));
    expect(global.fetch).toHaveBeenCalledWith('/api/worker/costs', expect.objectContaining({
       body: expect.stringContaining('"description":"Lunch"'),
    }));

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles error on submit', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CostDialog {...defaultProps} />);

    // Fill form minimal
    await user.type(screen.getByLabelText('Tutar (TL)'), '100');
    await user.type(screen.getByLabelText('Açıklama'), 'Test');

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    const options = await screen.findAllByText('Diğer');
    await user.click(options[options.length - 1]);

    const submitBtn = screen.getByRole('button', { name: 'Kaydet' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // onSuccess should NOT be called
    expect(mockOnSuccess).not.toHaveBeenCalled();
    // Dialog should stay open
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });
});
