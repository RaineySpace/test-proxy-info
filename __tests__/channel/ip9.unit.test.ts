import { describe, it, expect, vi } from 'vitest';
import { testProxyInfoByIP9 } from '../../src/channel/ip9';
import { TestProxyChannel, Fetcher } from '../../src/common';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfoByIP9', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: '中国',
          prov: '广东省',
          city: '深圳市',
        },
        qt: 0.001,
      })
    );

    const result = await testProxyInfoByIP9({ fetcher: mockFetcher });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('中国');
    expect(result.province).toBe('广东省');
    expect(result.city).toBe('深圳市');
    expect(result.timezone).toBeUndefined();
    expect(result.channel).toBe(TestProxyChannel.IP9);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('ret 不为 200 时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 500,
        data: null,
        qt: 0,
      })
    );

    await expect(
      testProxyInfoByIP9({ fetcher: mockFetcher })
    ).rejects.toThrow('IP9 检测渠道异常: 500');
  });

  it('数据为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 200,
        data: null,
        qt: 0,
      })
    );

    await expect(
      testProxyInfoByIP9({ fetcher: mockFetcher })
    ).rejects.toThrow('IP9 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockResponse({
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: '中国',
          prov: '广东省',
          city: '深圳市',
        },
        qt: 0.001,
      });
    });

    const result = await testProxyInfoByIP9({ fetcher: mockFetcher });

    expect(result.latency).toBeGreaterThanOrEqual(40);
  });

  it('应该调用 fetcher 请求正确的 URL', async () => {
    const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
      mockResponse({
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: '中国',
          prov: '广东省',
          city: '深圳市',
        },
        qt: 0.001,
      })
    );

    await testProxyInfoByIP9({ fetcher: mockFetcher });

    expect(mockFetcher).toHaveBeenCalledWith('https://ip9.com.cn/get');
  });
});
