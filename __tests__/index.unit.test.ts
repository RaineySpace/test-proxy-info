import { describe, it, expect } from 'vitest';
import {
  TestProxyChannel,
  TestProxyResult,
  ProxyConfig,
  Fetcher,
  TestProxyOptions,
  SimpleTestProxyOptions,
} from '../src/index';

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
