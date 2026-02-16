import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditJobScreen from '../EditJobScreen';
import customerService from '../../../services/customer.service';
import teamService from '../../../services/team.service';

// Mock contexts
jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({ user: { role: 'ADMIN' } }),
}));

jest.mock('../../../context/AlertContext', () => ({
    useAlert: () => ({ showAlert: jest.fn() }),
}));

// Mock hook
jest.mock('../../../hooks/useJobForm', () => ({
    useJobForm: (initialJob) => ({
        formData: {
            title: initialJob.title,
            projectNo: initialJob.projectNo || '',
            budget: '100',
            status: 'PENDING',
            scheduledDate: new Date(),
            scheduledEndDate: new Date(),
        },
        setFormData: jest.fn(),
        steps: [],
        loading: false,
        addStep: jest.fn(),
        submitJob: jest.fn(),
    }),
}));

// Mock services
jest.mock('../../../services/customer.service', () => ({
    getAll: jest.fn(),
}));
jest.mock('../../../services/team.service', () => ({
    getAll: jest.fn(),
}));

const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
};

const mockRoute = {
    params: {
        job: {
            id: '1',
            title: 'Current Job',
            projectNo: 'PRJ-001',
        },
    },
};

describe('EditJobScreen', () => {
    beforeEach(() => {
        customerService.getAll.mockResolvedValue([]);
        teamService.getAll.mockResolvedValue([]);
    });

    it('renders correctly with job data', async () => {
        const { getByText, getByPlaceholderText } = render(
            <EditJobScreen route={mockRoute} navigation={mockNavigation} />
        );

        await waitFor(() => {
            expect(getByText('editJob.title')).toBeTruthy(); // Checks localized title if mocked, or key
        });

        // Check if ProjectNo (Issue #16/13) is visible
        expect(getByText('editJob.projectNo')).toBeTruthy();
    });
});
