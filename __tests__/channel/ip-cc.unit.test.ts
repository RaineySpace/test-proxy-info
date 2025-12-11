import { describe, it, expect, vi } from 'vitest';
import { testProxyInfoByIPCC } from '../../src/channel/ip-cc';
import { TestProxyChannel, Fetcher } from '../../src/common';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfoByIPCC', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        code: 200,
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          },
        },
        msg: 'success',
      })
    );

    const result = await testProxyInfoByIPCC({ fetcher: mockFetcher });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('美国');
    expect(result.province).toBe('加利福尼亚');
    expect(result.city).toBe('旧金山');
    expect(result.timezone).toBe('America/Los_Angeles');
    expect(result.channel).toBe(TestProxyChannel.IPCC);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('code 不为 200 时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        code: 500,
        data: null,
        msg: '服务器错误',
      })
    );

    await expect(
      testProxyInfoByIPCC({ fetcher: mockFetcher })
    ).rejects.toThrow('IPCC 检测渠道异常: 服务器错误');
  });

  it('数据为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        code: 200,
        data: null,
        msg: 'success',
      })
    );

    await expect(
      testProxyInfoByIPCC({ fetcher: mockFetcher })
    ).rejects.toThrow('IPCC 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockResponse({
        code: 200,
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          },
        },
        msg: 'success',
      });
    });

    const result = await testProxyInfoByIPCC({ fetcher: mockFetcher });

    expect(result.latency).toBeGreaterThanOrEqual(40);
  });

  it('应该调用 fetcher 请求正确的 URL', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        code: 200,
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          },
        },
        msg: 'success',
      })
    );

    await testProxyInfoByIPCC({ fetcher: mockFetcher });

    expect(mockFetcher).toHaveBeenCalledWith('https://ip.cc/webapi/product/api-ip-address?language=zh', expect.any(Object));
  });

  it('language 为 zh-hans 时应该请求中文', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        code: 200,
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          },
        },
        msg: 'success',
      })
    );

    await testProxyInfoByIPCC({ fetcher: mockFetcher, language: 'zh-hans' });

    expect(mockFetcher).toHaveBeenCalledWith('https://ip.cc/webapi/product/api-ip-address?language=zh', expect.any(Object));
  });

  it('language 为 en-us 时应该请求英文', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        code: 200,
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country: 'United States',
            region: 'California',
            city: 'San Francisco',
            timezone: 'America/Los_Angeles',
          },
        },
        msg: 'success',
      })
    );

    await testProxyInfoByIPCC({ fetcher: mockFetcher, language: 'en-us' });

    expect(mockFetcher).toHaveBeenCalledWith('https://ip.cc/webapi/product/api-ip-address?language=en', expect.any(Object));
  });
});
