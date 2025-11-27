import React from 'react';
import { render, screen } from '@testing-library/react';
import NotableRecordingLinks from './NotableRecordingLinks';

describe('NotableRecordingLinks', () => {
  it('renders links with correct attributes', () => {
    const links = [
      { label: 'YouTube', url: 'https://youtube.com/watch?v=abc', type: 'youtube' },
      { label: 'Archive', url: 'https://archive.org/details/xyz' }
    ];

    render(<NotableRecordingLinks links={links} />);

    const anchors = screen.getAllByRole('link');
    expect(anchors).toHaveLength(2);
    expect(anchors[0]).toHaveAttribute('href', 'https://youtube.com/watch?v=abc');
    expect(anchors[0]).toHaveAttribute('target', '_blank');
    expect(anchors[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(anchors[0]).toHaveAttribute('title', 'YouTube');

    expect(anchors[1]).toHaveAttribute('href', 'https://archive.org/details/xyz');
    expect(anchors[1]).toHaveAttribute('target', '_blank');
    expect(anchors[1]).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
