import { describe, it, expect, vi } from 'vitest';
import {
  testProxyInfo,
  TestProxyChannel,
  TestProxyResult,
  ProxyConfig,
  Fetcher,
  TestProxyOptions,
  SimpleTestProxyOptions,
} from '../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfo', () => {
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
});

describe('类型导出验证', () => {
  it('TestProxyChannel 枚举应该包含所有通道', () => {
    expect(TestProxyChannel.IP234).toBe('IP234');
    expect(TestProxyChannel.IPInfo).toBe('IPInfo');
    expect(TestProxyChannel.BigData).toBe('BigData');
    expect(TestProxyChannel.IPCC).toBe('IPCC');
    expect(TestProxyChannel.IP9).toBe('IP9');
  });

  it('应该正确导出所有类型', () => {
    const result: TestProxyResult = {
      ip: '1.2.3.4',
      country: 'US',
      province: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      latency: 100,
      channel: TestProxyChannel.IP234,
    };
    expect(result).toBeDefined();

    const proxyConfig: ProxyConfig = {
      protocol: 'http',
      host: 'localhost',
      port: 8080,
    };
    expect(proxyConfig).toBeDefined();

    const options: TestProxyOptions = {
      channel: TestProxyChannel.IP234,
    };
    expect(options).toBeDefined();

    const simpleOptions: SimpleTestProxyOptions = {
      proxy: proxyConfig,
    };
    expect(simpleOptions).toBeDefined();
  });

  it('Fetcher 类型应该是函数类型', () => {
    const fetcher: Fetcher = async () => new Response();
    expect(typeof fetcher).toBe('function');
  });
});

describe('默认导出', () => {
  it('default 导出应该是 testProxyInfo 函数', async () => {
    const defaultExport = (await import('../src/index')).default;
    expect(typeof defaultExport).toBe('function');
    expect(defaultExport).toBe(testProxyInfo);
  });
});
