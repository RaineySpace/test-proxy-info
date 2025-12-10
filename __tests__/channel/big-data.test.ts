import { describe, it, expect, vi } from 'vitest';
import { testProxyInfo, TestProxyChannel, Fetcher } from '../../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('BigData 通道测试', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation((url: string) => {
      if (url.includes('client-ip')) {
        return Promise.resolve(mockResponse({ ipString: '1.2.3.4' }));
      }
      return Promise.resolve(mockResponse({
        countryName: 'United States',
        principalSubdivision: 'California',
        city: 'San Francisco',
      }));
    });

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.BigData,
    });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('United States');
    expect(result.province).toBe('California');
    expect(result.city).toBe('San Francisco');
    expect(result.timezone).toBeUndefined();
    expect(result.channel).toBe(TestProxyChannel.BigData);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('ipString 为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation((url: string) => {
      if (url.includes('client-ip')) {
        return Promise.resolve(mockResponse({ ipString: null }));
      }
      return Promise.resolve(mockResponse({
        countryName: 'United States',
        principalSubdivision: 'California',
        city: 'San Francisco',
      }));
    });

    await expect(
      testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.BigData,
      })
    ).rejects.toThrow('BigData 检测渠道异常');
  });

  it('data 为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation((url: string) => {
      if (url.includes('client-ip')) {
        return Promise.resolve(mockResponse({ ipString: '1.2.3.4' }));
      }
      return Promise.resolve(mockResponse(null as unknown as object));
    });

    await expect(
      testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.BigData,
      })
    ).rejects.toThrow('BigData 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async (url: string) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      if (url.includes('client-ip')) {
        return mockResponse({ ipString: '1.2.3.4' });
      }
      return mockResponse({
        countryName: 'United States',
        principalSubdivision: 'California',
        city: 'San Francisco',
      });
    });

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.BigData,
    });

    expect(result.latency).toBeGreaterThanOrEqual(40);
  });
});
