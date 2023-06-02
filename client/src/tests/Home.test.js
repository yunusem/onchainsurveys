import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../components/Home';
import '@testing-library/jest-dom';

const mockCasperWalletEventTypes = {
    Disconnected: 'Disconnected',
    ActiveKeyChanged: 'ActiveKeyChanged',
};

global.window = Object.create(window);
Object.defineProperty(window, 'CasperWalletEventTypes', {
    value: mockCasperWalletEventTypes,
    writable: true,
});


// Mock the CasperWalletContext
jest.mock('../contexts/CasperWalletContext', () => {
    const React = require('react');
    return {
        _esModule: true,
        default: (() => React.createContext())(),
    };
});

// Mock the useUserActivation hook
jest.mock('../contexts/UserActivationContext', () => {
    return {
        useUserActivation: () => [false],
    };
});

describe('Home', () => {
    test('renders Home component', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        const createVoteElements = await screen.findAllByText(/Create|Vote/i);
        expect(createVoteElements.length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
    });
});
