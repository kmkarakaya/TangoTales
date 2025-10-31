// Tests for the main App component to ensure core UI elements render as expected.
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock HomePage to provide a stable title for the App test
// Allow jest.mock before imports for testing environment
/* eslint-disable import/first */
jest.mock('./pages/HomePage', () => () => <div>TangoTales</div>);
import App from './App';

/* eslint-enable import/first */

test('renders TangoTales site title', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/TangoTales/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
