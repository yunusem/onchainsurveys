import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';
import '@testing-library/jest-dom';

// Mock the UserActivationContext
jest.mock('../components/UserActivationContext', () => {
    return {
        useUserActivation: () => [false, () => { }],
    };
});

// Mock the CasperWalletEvents
jest.mock('../components/CasperWalletEvents', () => {
    return () => ({});
});

describe('Login', () => {
    test('renders Login component', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        const walletConnectedElements = await screen.findAllByText(/Wallet|Connected!/i);
        expect(walletConnectedElements.length).toBeGreaterThanOrEqual(2);


        expect(screen.getByText(/Verify Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/E-mail address/i)).toBeInTheDocument();
        expect(screen.getByText(/CSPR.live/i)).toBeInTheDocument();
    });
});
