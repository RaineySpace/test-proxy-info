import { describe, it, expectTypeOf } from 'vitest';
import {
  testProxyInfo,
  TestProxyChannel,
  testProxyInfoByIp234,
} from '../src/index';
import {
  ProxyConfig,
  TestProxyResult,
  getProxyUrl,
  createAxiosInstance,
} from '../src/common';
import { AxiosInstance } from 'axios';

describe('类型测试', () => {
  describe('ProxyConfig', () => {
    it('应该有正确的类型定义', () => {
      const config: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      expectTypeOf(config.protocol).toEqualTypeOf<'http' | 'https' | 'socks5' | 'socks5h'>();
      expectTypeOf(config.host).toBeString();
      expectTypeOf(config.port).toEqualTypeOf<string | number | undefined>();
      expectTypeOf(config.username).toEqualTypeOf<string | undefined>();
      expectTypeOf(config.password).toEqualTypeOf<string | undefined>();
    });
  });

  describe('TestProxyResult', () => {
    it('应该有正确的类型定义', () => {
      const result: TestProxyResult = {
        ip: '1.2.3.4',
        country: 'United States',
        province: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latency: 100,
      };

      expectTypeOf(result.ip).toBeString();
      expectTypeOf(result.country).toBeString();
      expectTypeOf(result.province).toBeString();
      expectTypeOf(result.city).toBeString();
      expectTypeOf(result.timezone).toBeString();
      expectTypeOf(result.latency).toBeNumber();
    });
  });

  describe('TestProxyChannel', () => {
    it('应该是枚举类型', () => {
      expectTypeOf(TestProxyChannel.IP234).toBeString();
      expectTypeOf(TestProxyChannel.IP234).toEqualTypeOf<'ip234'>();
      expectTypeOf(TestProxyChannel.IPInfo).toEqualTypeOf<'ip_info'>();
    });
  });

  describe('testProxyInfo 函数类型', () => {
    it('应该接受proxyConfig和可选的channel', () => {
      expectTypeOf(testProxyInfo).parameter(0).toEqualTypeOf<ProxyConfig | string | undefined>();
      expectTypeOf(testProxyInfo).parameter(1).toEqualTypeOf<TestProxyChannel | TestProxyChannel[] | undefined>();
    });

    it('应该返回Promise<TestProxyResult>', () => {
      expectTypeOf(testProxyInfo).returns.toEqualTypeOf<Promise<TestProxyResult>>();
    });

    it('应该能够使用不同的参数调用', () => {
      expectTypeOf(testProxyInfo()).toEqualTypeOf<Promise<TestProxyResult>>();

      const config: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };
      expectTypeOf(testProxyInfo(config)).toEqualTypeOf<Promise<TestProxyResult>>();

      expectTypeOf(testProxyInfo(config, TestProxyChannel.IP234)).toEqualTypeOf<Promise<TestProxyResult>>();

      expectTypeOf(testProxyInfo('http://user:pass@proxy.example.com:8080'))
        .toEqualTypeOf<Promise<TestProxyResult>>();

      expectTypeOf(testProxyInfo(undefined, TestProxyChannel.IP234))
        .toEqualTypeOf<Promise<TestProxyResult>>();

      expectTypeOf(testProxyInfo(config, [TestProxyChannel.IP234, TestProxyChannel.IPInfo]))
        .toEqualTypeOf<Promise<TestProxyResult>>();
    });
  });

  describe('testProxyInfoByIp234 函数类型', () => {
    it('应该接受可选的proxyConfig', () => {
      expectTypeOf(testProxyInfoByIp234).parameter(0).toEqualTypeOf<ProxyConfig | string | undefined>();
    });

    it('应该返回Promise<TestProxyResult>', () => {
      expectTypeOf(testProxyInfoByIp234).returns.toEqualTypeOf<Promise<TestProxyResult>>();
    });
  });

  describe('getProxyUrl 函数类型', () => {
    it('应该接受ProxyConfig或string', () => {
      expectTypeOf(getProxyUrl).parameter(0).toEqualTypeOf<ProxyConfig | string>();
    });

    it('应该返回string', () => {
      expectTypeOf(getProxyUrl).returns.toBeString();
    });
  });

  describe('createAxiosInstance 函数类型', () => {
    it('应该接受可选的proxyConfig', () => {
      expectTypeOf(createAxiosInstance).parameter(0).toEqualTypeOf<ProxyConfig | string | undefined>();
    });

    it('应该返回AxiosInstance', () => {
      expectTypeOf(createAxiosInstance).returns.toEqualTypeOf<AxiosInstance>();
    });
  });

  describe('联合类型支持', () => {
    it('proxyConfig应该支持对象或字符串', () => {
      const config1: ProxyConfig | string = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const config2: ProxyConfig | string = 'http://user:pass@proxy.example.com:8080';

      expectTypeOf(config1).toMatchTypeOf<ProxyConfig | string>();
      expectTypeOf(config2).toMatchTypeOf<ProxyConfig | string>();
    });
  });
});
