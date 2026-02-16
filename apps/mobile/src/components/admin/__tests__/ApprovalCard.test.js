import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ApprovalCard from '../ApprovalCard';

// Using global mocks from jest.setup.js
// Mocking Modal since it can be tricky in tests, though react-native mock usually handles it.
// Default mock is fine.

describe('ApprovalCard', () => {
    const mockItem = {
        id: '1',
        type: 'COST',
        title: 'Test Expense',
        requester: 'John Doe',
        date: '30.01.2026',
        raw: {
            category: 'Food',
            notes: 'Lunch',
            amount: 100,
            currency: 'TRY',
            attachments: ['https://example.com/image.jpg']
        }
    };

    const mockOnApprove = jest.fn();
    const mockOnReject = jest.fn();

    it('renders correctly', () => {
        const { getByText } = render(
            <ApprovalCard
                item={mockItem}
                onApprove={mockOnApprove}
                onReject={mockOnReject}
            />
        );

        expect(getByText('Test Expense')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('MASRAF ONAYI')).toBeTruthy();
    });

    it('expands to show details', () => {
        const { getByText, queryByText } = render(
            <ApprovalCard
                item={mockItem}
                onApprove={mockOnApprove}
                onReject={mockOnReject}
            />
        );

        // Initially details hidden (except what is shown in summary?) 
        // Wait, code says details block is conditional {isExpanded && ...}
        // Summary shows Title and Requester.

        // Press header to expand
        fireEvent.press(getByText('MASRAF ONAYI')); // Pressing the type badge or header area

        // Now details should be visible
        expect(getByText('Kategori:')).toBeTruthy();
        expect(getByText('Food')).toBeTruthy();
        expect(getByText('Notlar:')).toBeTruthy();
        expect(getByText('Lunch')).toBeTruthy();
    });

    it('calls onApprove when approve button pressed', () => {
        const { getByText } = render(
            <ApprovalCard
                item={mockItem}
                onApprove={mockOnApprove}
                onReject={mockOnReject}
            />
        );

        fireEvent.press(getByText('Onayla'));
        expect(mockOnApprove).toHaveBeenCalledWith(mockItem);
    });

    it('calls onReject when reject button pressed', () => {
        const { getByText } = render(
            <ApprovalCard
                item={mockItem}
                onApprove={mockOnApprove}
                onReject={mockOnReject}
            />
        );

        fireEvent.press(getByText('Reddet'));
        expect(mockOnReject).toHaveBeenCalledWith(mockItem);
    });

    it('renders Job approval type correctly', () => {
        const jobItem = {
            ...mockItem,
            type: 'JOB',
            title: 'Fix Machine',
            raw: {
                customer: { company: 'Acme Corp', address: '123 Main St' }
            }
        };

        const { getByText } = render(
            <ApprovalCard
                item={jobItem}
                onApprove={mockOnApprove}
                onReject={mockOnReject}
            />
        );

        expect(getByText('İŞ ONAYI')).toBeTruthy();

        // Expand
        fireEvent.press(getByText('İŞ ONAYI'));

        expect(getByText('Müşteri:')).toBeTruthy();
        expect(getByText('Acme Corp')).toBeTruthy();
    });
});
