import React from 'react';
import { render, screen } from '@testing-library/react';
import MapBox from './MapBox';

test('renders learn react link', () => {
  render(<MapBox CENTER_ID={"8"} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
