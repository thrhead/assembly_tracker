import { getValidImageUrl } from '../index';
import { API_BASE_URL } from '../../services/api';

jest.mock('../../services/api', () => ({
  API_BASE_URL: 'https://test-api.com',
}));

describe('getValidImageUrl', () => {
  it('returns null if path is falsy', () => {
    expect(getValidImageUrl(null)).toBeNull();
    expect(getValidImageUrl('')).toBeNull();
  });

  it('returns full http url as is', () => {
    const url = 'https://example.com/image.jpg';
    expect(getValidImageUrl(url)).toBe(url);
  });

  it('returns full file url as is', () => {
    const url = 'file:///local/image.jpg';
    expect(getValidImageUrl(url)).toBe(url);
  });

  it('prepends API_BASE_URL to relative path starting with /', () => {
    const path = '/uploads/image.jpg';
    expect(getValidImageUrl(path)).toBe('https://test-api.com/uploads/image.jpg');
  });

  it('prepends API_BASE_URL to relative path not starting with /', () => {
    const path = 'uploads/image.jpg';
    expect(getValidImageUrl(path)).toBe('https://test-api.com/uploads/image.jpg');
  });
});
