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

/**
 * TypeScript 类型测试
 * 验证所有导出的类型定义是否正确
 */
describe('类型测试', () => {
  describe('ProxyConfig', () => {
    it('应该有正确的类型定义', () => {
      const config: ProxyConfig = {
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      expectTypeOf(config.host).toBeString();
      expectTypeOf(config.port).toBeString();
      expectTypeOf(config.username).toBeString();
      expectTypeOf(config.password).toBeString();
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
      };

      expectTypeOf(result.ip).toBeString();
      expectTypeOf(result.country).toBeString();
      expectTypeOf(result.province).toBeString();
      expectTypeOf(result.city).toBeString();
      expectTypeOf(result.timezone).toBeString();
    });
  });

  describe('TestProxyChannel', () => {
    it('应该是枚举类型', () => {
      expectTypeOf(TestProxyChannel.IP234).toBeString();
      expectTypeOf(TestProxyChannel.IP234).toEqualTypeOf<'ip234'>();
    });
  });

  describe('testProxyInfo 函数类型', () => {
    it('应该接受channel和可选的proxyConfig', () => {
      expectTypeOf(testProxyInfo).parameter(0).toEqualTypeOf<TestProxyChannel>();
      expectTypeOf(testProxyInfo).parameter(1).toEqualTypeOf<ProxyConfig | string | undefined>();
    });

    it('应该返回Promise<TestProxyResult>', () => {
      expectTypeOf(testProxyInfo).returns.toEqualTypeOf<Promise<TestProxyResult>>();
    });

    it('应该能够使用不同的参数调用', () => {
      // 只传channel
      expectTypeOf(testProxyInfo(TestProxyChannel.IP234)).toEqualTypeOf<Promise<TestProxyResult>>();

      // 传channel和config对象
      const config: ProxyConfig = {
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };
      expectTypeOf(testProxyInfo(TestProxyChannel.IP234, config)).toEqualTypeOf<Promise<TestProxyResult>>();

      // 传channel和url字符串
      expectTypeOf(testProxyInfo(TestProxyChannel.IP234, 'http://user:pass@proxy.example.com:8080'))
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

