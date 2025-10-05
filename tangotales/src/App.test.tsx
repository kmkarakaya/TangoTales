// Tests for the main App component to ensure core UI elements render as expected.
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TangoTales site title', () => {
  render(<App />);
  const titleElement = screen.getByText(/TangoTales/i);
  expect(titleElement).toBeInTheDocument();
});
