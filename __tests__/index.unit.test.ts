import { describe, it, expect, vi } from 'vitest';
import {
  TestProxyChannel,
  TestProxyResult,
  ProxyConfig,
  Fetcher,
  TestProxyOptions,
  SimpleTestProxyOptions,
  testProxyInfo,
} from '../src/index';

const mockResponse = (data: object): Response => {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
};

describe('testProxyInfo', () => {
  it('使用 latencyTestUrl 时应该正确计算延迟', async () => {
    const mockFetcher: Fetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url === 'https://example.com/latency') {
        await new Promise(resolve => setTimeout(resolve, 50));
        return mockResponse({})
      }
      await new Promise(resolve => setTimeout(resolve, 100));
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

    const result = await testProxyInfo({ fetcher: mockFetcher, latencyTestUrl: 'https://example.com/latency' });

    expect(result.latency).toBeGreaterThanOrEqual(40);
    expect(result.latency).toBeLessThan(60);
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

    const socks5ProxyConfig: ProxyConfig = {
      protocol: 'socks5',
      host: 'localhost',
      port: 1080,
    };
    expect(socks5ProxyConfig).toBeDefined();

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
    const { default: defaultExport, testProxyInfo } = await import('../src/index');
    expect(typeof defaultExport).toBe('function');
    expect(defaultExport).toBe(testProxyInfo);
  });
});
