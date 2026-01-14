import jobService from '../job.service';
import api from '../api';

jest.mock('../api');

describe('JobService (Offline Support)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return queued message when completing a job offline', async () => {
    const mockResponse = {
      status: 202,
      data: {
        message: 'İşlem kuyruğa alındı ve bağlantı sağlandığında gönderilecek.',
        offline: true
      }
    };
    api.post.mockResolvedValue(mockResponse);

    const result = await jobService.completeJob('123');

    expect(api.post).toHaveBeenCalledWith('/api/worker/jobs/123/complete');
    expect(result.offline).toBe(true);
    expect(result.message).toContain('kuyruğa alındı');
  });

  it('should return queued message when updating a job offline', async () => {
    const mockResponse = {
      status: 202,
      data: {
        offline: true
      }
    };
    api.put.mockResolvedValue(mockResponse);

    const result = await jobService.update('123', { title: 'New' });

    expect(api.put).toHaveBeenCalledWith('/api/admin/jobs/123', { title: 'New' });
    expect(result.offline).toBe(true);
  });
});
