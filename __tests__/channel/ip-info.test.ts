import { describe, it, expect, vi } from 'vitest';
import { testProxyInfo, TestProxyChannel, Fetcher } from '../../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('IPInfo 通道测试', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ip: '1.2.3.4',
        country: 'US',
        region: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
      })
    );

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.IPInfo,
    });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('US');
    expect(result.province).toBe('California');
    expect(result.city).toBe('San Francisco');
    expect(result.timezone).toBe('America/Los_Angeles');
    expect(result.channel).toBe(TestProxyChannel.IPInfo);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('数据为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse(null as unknown as object)
    );

    await expect(
      testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.IPInfo,
      })
    ).rejects.toThrow('IPInfo 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockResponse({
        ip: '1.2.3.4',
        country: 'US',
        region: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
      });
    });

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.IPInfo,
    });

    expect(result.latency).toBeGreaterThanOrEqual(40);
  });
});
