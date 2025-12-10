import { describe, it, expect, vi } from 'vitest';
import { testProxyInfo, TestProxyChannel, Fetcher } from '../../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('IP9 通道测试', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: '美国',
          prov: '加利福尼亚',
          city: '旧金山',
        },
      })
    );

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.IP9,
    });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('美国');
    expect(result.province).toBe('加利福尼亚');
    expect(result.city).toBe('旧金山');
    expect(result.timezone).toBeUndefined();
    expect(result.channel).toBe(TestProxyChannel.IP9);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('ret 不为 200 时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 500,
        data: null,
      })
    );

    await expect(
      testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.IP9,
      })
    ).rejects.toThrow('IP9 检测渠道异常: 500');
  });

  it('data 为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 200,
        data: null,
      })
    );

    await expect(
      testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.IP9,
      })
    ).rejects.toThrow('IP9 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockResponse({
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: '美国',
          prov: '加利福尼亚',
          city: '旧金山',
        },
      });
    });

    const result = await testProxyInfo({
      fetcher: mockFetcher,
      channel: TestProxyChannel.IP9,
    });

    expect(result.latency).toBeGreaterThanOrEqual(40);
  });
});
