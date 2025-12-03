import { cn, formatCurrency, formatDate, formatTime } from './utils';

describe('lib/utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', { bar: true })).toBe('foo bar');
      expect(cn('foo', { bar: false })).toBe('foo');
      expect(cn('p-4', 'p-2')).toBe('p-2'); // Tailwind merge
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in Turkish Lira', () => {
      // Note: non-breaking space might be used by Intl.NumberFormat
      const result = formatCurrency(1234.56);
      expect(result).toContain('₺');
      expect(result).toContain('1.234,56');
    });
  });

  describe('formatDate', () => {
    it('should return "-" if date is null or undefined', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });

    it('should format date correctly', () => {
      const date = new Date('2023-10-25T14:30:00');
      const formatted = formatDate(date);
      // "25 Ekim 2023 14:30" or similar depending on locale implementation in Node environment
      expect(formatted).toContain('2023');
      expect(formatted).toContain(':30');
    });
  });

  describe('formatTime', () => {
    it('should return "-" if date is null or undefined', () => {
      expect(formatTime(null)).toBe('-');
      expect(formatTime(undefined)).toBe('-');
    });

    it('should format time correctly', () => {
      const date = new Date('2023-10-25T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toBe('14:30');
    });
  });
});
