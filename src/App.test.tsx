import React from 'react';
import { render, screen } from '@testing-library/react';
import MapBox from './MapBox';

test('renders learn react link', () => {
  render(
  <MapBox CENTER_ID='35' config={{
    KIOSK: "102",
    CAMERA: {
      minDistance: 2000,
      maxDistance: 3000
    },
    STATS: '1',
    DEBUG: '1',
    ROLE: 'PORTAL',
  }}/>
);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
