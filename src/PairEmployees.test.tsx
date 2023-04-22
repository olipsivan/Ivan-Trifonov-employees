import React from 'react';
import { render, screen } from '@testing-library/react';
import PairEmployees from './PairEmployees';

test('renders learn react link', () => {
  render(<PairEmployees />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
