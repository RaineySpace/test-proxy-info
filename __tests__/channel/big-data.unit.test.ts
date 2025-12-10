import { describe, it, expect, vi } from 'vitest';
import { testProxyInfoByBigData } from '../../src/channel/big-data';
import { TestProxyChannel, Fetcher } from '../../src/common';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfoByBigData', () => {
  it('应该返回正确的 IP 信息', async () => {
    const mockFetcher: Fetcher = vi.fn()
      .mockResolvedValueOnce(
        mockResponse({
          countryName: '美国',
          principalSubdivision: '加利福尼亚',
          city: '旧金山',
        })
      )
      .mockResolvedValueOnce(
        mockResponse({
          ipString: '1.2.3.4',
        })
      );

    const result = await testProxyInfoByBigData({ fetcher: mockFetcher });

    expect(result.ip).toBe('1.2.3.4');
    expect(result.country).toBe('美国');
    expect(result.province).toBe('加利福尼亚');
    expect(result.city).toBe('旧金山');
    expect(result.timezone).toBeUndefined();
    expect(result.channel).toBe(TestProxyChannel.BigData);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('地理数据为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn()
      .mockResolvedValueOnce(mockResponse(null as unknown as object))
      .mockResolvedValueOnce(mockResponse({ ipString: '1.2.3.4' }));

    await expect(
      testProxyInfoByBigData({ fetcher: mockFetcher })
    ).rejects.toThrow('BigData 检测渠道异常');
  });

  it('IP 数据为空时应该抛出错误', async () => {
    const mockFetcher: Fetcher = vi.fn()
      .mockResolvedValueOnce(
        mockResponse({
          countryName: '美国',
          principalSubdivision: '加利福尼亚',
          city: '旧金山',
        })
      )
      .mockResolvedValueOnce(mockResponse({}));

    await expect(
      testProxyInfoByBigData({ fetcher: mockFetcher })
    ).rejects.toThrow('BigData 检测渠道异常');
  });

  it('应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 30));
      return mockResponse({
        countryName: '美国',
        principalSubdivision: '加利福尼亚',
        city: '旧金山',
        ipString: '1.2.3.4',
      });
    });

    const result = await testProxyInfoByBigData({ fetcher: mockFetcher });

    expect(result.latency).toBeGreaterThanOrEqual(25);
  });

  it('应该调用 fetcher 请求正确的 URL', async () => {
    const mockFetcher: Fetcher = vi.fn()
      .mockResolvedValueOnce(
        mockResponse({
          countryName: '美国',
          principalSubdivision: '加利福尼亚',
          city: '旧金山',
        })
      )
      .mockResolvedValueOnce(mockResponse({ ipString: '1.2.3.4' }));

    await testProxyInfoByBigData({ fetcher: mockFetcher });

    expect(mockFetcher).toHaveBeenCalledWith('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh-Hans');
    expect(mockFetcher).toHaveBeenCalledWith('https://api.bigdatacloud.net/data/client-ip');
  });

  it('language 为 zh-hans 时应该请求中文', async () => {
    const mockFetcher: Fetcher = vi.fn()
      .mockResolvedValueOnce(
        mockResponse({
          countryName: '美国',
          principalSubdivision: '加利福尼亚',
          city: '旧金山',
        })
      )
      .mockResolvedValueOnce(mockResponse({ ipString: '1.2.3.4' }));

    await testProxyInfoByBigData({ fetcher: mockFetcher, language: 'zh-hans' });

    expect(mockFetcher).toHaveBeenCalledWith('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh-Hans');
  });

  it('language 为 en-us 时应该请求英文', async () => {
    const mockFetcher: Fetcher = vi.fn()
      .mockResolvedValueOnce(
        mockResponse({
          countryName: 'United States',
          principalSubdivision: 'California',
          city: 'San Francisco',
        })
      )
      .mockResolvedValueOnce(mockResponse({ ipString: '1.2.3.4' }));

    await testProxyInfoByBigData({ fetcher: mockFetcher, language: 'en-us' });

    expect(mockFetcher).toHaveBeenCalledWith('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
  });
});
