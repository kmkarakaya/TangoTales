import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating Component', () => {
  test('renders 5 stars', () => {
    render(<StarRating rating={0} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  test('displays correct number of filled stars', () => {
    const { container } = render(<StarRating rating={3} />);
    const filledStars = container.querySelectorAll('button');
    let filledCount = 0;
    filledStars.forEach(star => {
      if (star.textContent === '★') filledCount++;
    });
    expect(filledCount).toBe(3);
  });

  test('calls onRate when star is clicked', () => {
    const handleRate = jest.fn();
    render(<StarRating rating={0} onRate={handleRate} />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]); // Click third star
    
    expect(handleRate).toHaveBeenCalledWith(3);
  });

  test('does not call onRate when readonly', () => {
    const handleRate = jest.fn();
    render(<StarRating rating={3} onRate={handleRate} readonly={true} />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[4]);
    
    expect(handleRate).not.toHaveBeenCalled();
  });

  test('displays rating count when provided', () => {
    render(<StarRating rating={4.5} totalRatings={23} />);
    expect(screen.getByText('(23 ratings)')).toBeInTheDocument();
  });

  test('shows singular "rating" for count of 1', () => {
    render(<StarRating rating={5} totalRatings={1} />);
    expect(screen.getByText('(1 rating)')).toBeInTheDocument();
  });

  test('has proper accessibility labels', () => {
    render(<StarRating rating={0} onRate={() => {}} />);
    expect(screen.getByLabelText('Rate 1 star')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument();
  });

  test('displays numeric average when showAverage is true', () => {
    render(<StarRating rating={4.2} totalRatings={23} showAverage={true} />);
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('(23 ratings)')).toBeInTheDocument();
  });

  test('does not display numeric average when showAverage is false', () => {
    const { container } = render(<StarRating rating={4.2} totalRatings={23} showAverage={false} />);
    expect(container.textContent).not.toContain('4.2');
    expect(screen.getByText('(23 ratings)')).toBeInTheDocument();
  });

  test('shows loading indicator when isLoading is true', () => {
    render(<StarRating rating={3} onRate={() => {}} isLoading={true} />);
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  test('does not allow rating clicks when isLoading', () => {
    const handleRate = jest.fn();
    render(<StarRating rating={0} onRate={handleRate} isLoading={true} />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]);
    
    expect(handleRate).not.toHaveBeenCalled();
  });
});
