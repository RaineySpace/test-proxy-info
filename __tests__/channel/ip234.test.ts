import { describe, it, expect, vi } from 'vitest';
import { testProxyInfo, TestProxyChannel, Fetcher } from '../../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('IP234 通道测试', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ip: '1.2.3.4',
        country: '美国',
        region: '加利福尼亚',
        city: '旧金山',
        timezone: 'America/Los_Angeles',
      })
    );

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.IP234,
    });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('美国');
    expect(result.province).toBe('加利福尼亚');
    expect(result.city).toBe('旧金山');
    expect(result.timezone).toBe('America/Los_Angeles');
    expect(result.channel).toBe(TestProxyChannel.IP234);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('数据为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse(null as unknown as object)
    );

    await expect(
      testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.IP234,
      })
    ).rejects.toThrow('IP234 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockResponse({
        ip: '1.2.3.4',
        country: '美国',
        region: '加利福尼亚',
        city: '旧金山',
        timezone: 'America/Los_Angeles',
      });
    });

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.IP234,
    });

    expect(result.latency).toBeGreaterThanOrEqual(50);
  });
});
