import { describe, it, expect, vi } from 'vitest';
import { testProxyInfoByIp234 } from '../../src/channel/ip234';
import { TestProxyChannel, Fetcher } from '../../src/common';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfoByIp234', () => {
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

    const result = await testProxyInfoByIp234({ fetcher: mockFetcher });

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
      testProxyInfoByIp234({ fetcher: mockFetcher })
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

    const result = await testProxyInfoByIp234({ fetcher: mockFetcher });

    expect(result.latency).toBeGreaterThanOrEqual(40);
  });

  it('应该调用 fetcher 请求正确的 URL', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ip: '1.2.3.4',
        country: '美国',
        region: '加利福尼亚',
        city: '旧金山',
        timezone: 'America/Los_Angeles',
      })
    );

    await testProxyInfoByIp234({ fetcher: mockFetcher });

    expect(mockFetcher).toHaveBeenCalledWith('https://ip234.in/ip.json');
  });

  it('language 为 en-us 时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn();

    await expect(
      testProxyInfoByIp234({ fetcher: mockFetcher, language: 'en-us' })
    ).rejects.toThrow('IP234 检测渠道不支持英文');

    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('language 为 zh-hans 时应该正常工作', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ip: '1.2.3.4',
        country: '美国',
        region: '加利福尼亚',
        city: '旧金山',
        timezone: 'America/Los_Angeles',
      })
    );

    const result = await testProxyInfoByIp234({ fetcher: mockFetcher, language: 'zh-hans' });

    expect(result.ip).toBe('1.2.3.4');
    expect(mockFetcher).toHaveBeenCalled();
  });
});
