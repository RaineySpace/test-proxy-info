import { describe, it, expect, vi } from 'vitest';
import { testProxyInfo, TestProxyChannel, Fetcher } from '../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfo - Mock 集成测试', () => {
  describe('使用多通道测试', () => {
    it('应该返回第一个成功的结果', async () => {
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
        channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo],
      });

      expect(result.ip).toBe('1.2.3.4');
      expect([TestProxyChannel.IP234, TestProxyChannel.IPInfo]).toContain(result.channel);
    });

    it('空通道数组应该抛出错误', async () => {
      await expect(
        testProxyInfo({ channel: [] })
      ).rejects.toThrow('至少需要提供一个测试通道');
    });

    it('所有通道失败时应该抛出 AggregateError', async () => {
      const mockFetcher: Fetcher = vi.fn().mockRejectedValue(new Error('请求失败'));

      await expect(
        testProxyInfo({
          fetcher: mockFetcher,
          channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo],
        })
      ).rejects.toBeInstanceOf(AggregateError);
    });
  });

  describe('使用默认通道测试', () => {
    it('不传 channel 时应该使用所有通道', async () => {
      const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
        mockResponse({
          ip: '1.2.3.4',
          country: '美国',
          region: '加利福尼亚',
          city: '旧金山',
          timezone: 'America/Los_Angeles',
        })
      );

      const result = await testProxyInfo({ fetcher: mockFetcher });

      expect(result.ip).toBe('1.2.3.4');
      expect(Object.values(TestProxyChannel)).toContain(result.channel);
    });

    it('不传任何参数时应该使用所有通道', async () => {
      const mockFetcher: Fetcher = vi.fn().mockResolvedValue(
        mockResponse({
          ip: '1.2.3.4',
          country: '美国',
          region: '加利福尼亚',
          city: '旧金山',
          timezone: 'America/Los_Angeles',
        })
      );

      const result = await testProxyInfo({ fetcher: mockFetcher });
      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('channel');
    });
  });

  describe('不支持的通道', () => {
    it('不支持的通道应该抛出错误', async () => {
      const mockFetcher: Fetcher = vi.fn();

      await expect(
        testProxyInfo({
          fetcher: mockFetcher,
          channel: 'InvalidChannel' as TestProxyChannel,
        })
      ).rejects.toThrow('不支持的通道');
    });
  });

  describe('latencyTestUrl 测试', () => {
    it('提供 latencyTestUrl 时应该使用该 URL 测试延迟', async () => {
      let latencyFetchCalled = false;
      const mockFetcher: Fetcher = vi.fn().mockImplementation((url: string) => {
        if (url === 'https://example.com/latency') {
          latencyFetchCalled = true;
        }
        return Promise.resolve(
          mockResponse({
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          })
        );
      });

      const result = await testProxyInfo({
        fetcher: mockFetcher,
        channel: TestProxyChannel.IP234,
        latencyTestUrl: 'https://example.com/latency',
      });

      expect(latencyFetchCalled).toBe(true);
      expect(result.ip).toBe('1.2.3.4');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('不提供 latencyTestUrl 时应该使用通道默认延迟', async () => {
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
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('latencyTestUrl 请求失败时应该抛出错误', async () => {
      const mockFetcher: Fetcher = vi.fn().mockImplementation((url: string) => {
        if (url === 'https://example.com/latency') {
          return Promise.reject(new Error('延迟测试请求失败'));
        }
        return Promise.resolve(
          mockResponse({
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          })
        );
      });

      await expect(
        testProxyInfo({
          fetcher: mockFetcher,
          channel: TestProxyChannel.IP234,
          latencyTestUrl: 'https://example.com/latency',
        })
      ).rejects.toThrow('延迟测试请求失败');
    });

    it('多通道测试时每个通道都应该使用 latencyTestUrl', async () => {
      let latencyFetchCount = 0;
      const mockFetcher: Fetcher = vi.fn().mockImplementation((url: string) => {
        if (url === 'https://example.com/latency') {
          latencyFetchCount++;
        }
        return Promise.resolve(
          mockResponse({
            ip: '1.2.3.4',
            country: '美国',
            region: '加利福尼亚',
            city: '旧金山',
            timezone: 'America/Los_Angeles',
          })
        );
      });

      const result = await testProxyInfo({
        fetcher: mockFetcher,
        channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo],
        latencyTestUrl: 'https://example.com/latency',
      });

      expect(result.ip).toBe('1.2.3.4');
      expect(latencyFetchCount).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('testProxyInfo - 网络集成测试', () => {
  it('使用默认通道（所有通道）应该返回有效结果', async () => {
    const result = await testProxyInfo();

    expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(result.country).toBeTruthy();
    expect(Object.values(TestProxyChannel)).toContain(result.channel);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('指定多个通道应该返回第一个成功的结果', async () => {
    const result = await testProxyInfo({
      channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo, TestProxyChannel.BigData],
    });

    expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(result.country).toBeTruthy();
    expect([TestProxyChannel.IP234, TestProxyChannel.IPInfo, TestProxyChannel.BigData]).toContain(result.channel);
  });

  it('返回结果应该包含所有必要字段', async () => {
    const result = await testProxyInfo();

    expect(result).toHaveProperty('ip');
    expect(result).toHaveProperty('country');
    expect(result).toHaveProperty('province');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('latency');
    expect(result).toHaveProperty('channel');

    expect(typeof result.ip).toBe('string');
    expect(typeof result.country).toBe('string');
    expect(typeof result.province).toBe('string');
    expect(typeof result.city).toBe('string');
    expect(typeof result.latency).toBe('number');
    expect(typeof result.channel).toBe('string');
  });
});
