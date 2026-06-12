import { describe, it, expect } from 'vitest';
import { cn, formatNumber, formatDate, getScoreColor, getScoreBadgeColor, truncate, getApiErrorMessage } from '../lib/utils';

describe('cn (className merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('resolves tailwind conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('handles undefined/null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('formatNumber', () => {
  it('formats integers', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('formats decimals to 1 place by default', () => {
    expect(formatNumber(123.456)).toBe('123.5');
  });

  it('formats with custom decimal places', () => {
    expect(formatNumber(1.2345, 3)).toBe('1.235');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-06-01'));
    expect(result).toContain('2024');
  });
});

describe('getScoreColor', () => {
  it('returns green for excellent scores', () => {
    expect(getScoreColor(80)).toContain('green');
  });

  it('returns yellow for good scores', () => {
    expect(getScoreColor(60)).toContain('yellow');
  });

  it('returns orange for average scores', () => {
    expect(getScoreColor(30)).toContain('orange');
  });

  it('returns red for poor scores', () => {
    expect(getScoreColor(10)).toContain('red');
  });
});

describe('getScoreBadgeColor', () => {
  it('returns green classes for high scores', () => {
    const result = getScoreBadgeColor(90);
    expect(result).toContain('green');
  });

  it('returns red classes for very low scores', () => {
    const result = getScoreBadgeColor(5);
    expect(result).toContain('red');
  });
});

describe('truncate', () => {
  it('truncates strings longer than maxLen', () => {
    const result = truncate('Hello World', 8);
    expect(result).toBe('Hello Wo...');
    expect(result.length).toBe(11);
  });

  it('returns original string if within limit', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('getApiErrorMessage', () => {
  it('extracts axios error message', () => {
    const err = {
      response: { data: { error: { message: 'Invalid input' } } },
    };
    expect(getApiErrorMessage(err)).toBe('Invalid input');
  });

  it('extracts Error message', () => {
    expect(getApiErrorMessage(new Error('Network error'))).toBe('Network error');
  });

  it('returns fallback for unknown errors', () => {
    expect(getApiErrorMessage('some string')).toBe('An unexpected error occurred');
  });

  it('returns fallback for null', () => {
    expect(getApiErrorMessage(null)).toBe('An unexpected error occurred');
  });
});
