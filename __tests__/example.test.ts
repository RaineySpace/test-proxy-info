import { describe, it, expect } from 'vitest';
import { testProxyInfo, TestProxyChannel, testProxyInfoByIp234 } from '../src/index';
import { getProxyUrl, ProxyConfig } from '../src/common';
import { createAxiosInstance } from '../src/requester';

describe('example - 基本用法', () => {
  describe('工具函数', () => {
    it('getProxyUrl: 转换代理配置为 URL', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      expect(getProxyUrl(config)).toBe('http://user:pass@proxy.example.com:8080');
    });

    it('getProxyUrl: 直接返回 URL 字符串', () => {
      const url = 'http://user:pass@proxy.example.com:8080';
      expect(getProxyUrl(url)).toBe(url);
    });

    it('createAxiosInstance: 创建普通实例', () => {
      const instance = createAxiosInstance();
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeUndefined();
    });

    it('createAxiosInstance: 创建带代理的实例', () => {
      const instance = createAxiosInstance({
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
      });
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
    });
  });

  describe('代理测试函数', () => {
    it('testProxyInfo: 返回 Promise（无参数）', () => {
      const promise = testProxyInfo();
      expect(promise).toBeInstanceOf(Promise);
    });

    it('testProxyInfo: 返回 Promise（指定通道）', () => {
      const promise = testProxyInfo(undefined, TestProxyChannel.IP234);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('testProxyInfoByIp234: 返回 Promise', () => {
      const promise = testProxyInfoByIp234();
      expect(promise).toBeInstanceOf(Promise);
    });

    it('testProxyInfo: 支持多种配置方式', () => {
      const config: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
      };
      expect(testProxyInfo(config, TestProxyChannel.IP234)).toBeInstanceOf(Promise);

      const url = 'http://user:pass@proxy.example.com:8080';
      expect(testProxyInfo(url, TestProxyChannel.IP234)).toBeInstanceOf(Promise);

      expect(testProxyInfo(undefined, TestProxyChannel.IP234)).toBeInstanceOf(Promise);

      expect(testProxyInfo(config)).toBeInstanceOf(Promise);

      expect(testProxyInfo()).toBeInstanceOf(Promise);
    });
  });

  describe('TypeScript 类型', () => {
    it('ProxyConfig: 类型安全的配置', () => {
      const config: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      expect(config.protocol).toBe('http');
      expect(config.host).toBe('proxy.example.com');
    });

    it('TestProxyChannel: 枚举值', () => {
      expect(TestProxyChannel.IP234).toBe('ip234');
      expect(TestProxyChannel.IPInfo).toBe('ip_info');
    });
  });
});

describe('example - 使用场景', () => {
  describe('代理验证', () => {
    it('验证单个代理配置', () => {
      const config: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      expect(config).toBeDefined();
    });

    it('批量测试多个代理', () => {
      const proxies = [
        'http://user1:pass1@proxy1.com:8080',
        'http://user2:pass2@proxy2.com:8080',
        'http://user3:pass3@proxy3.com:8080',
      ];

      expect(proxies).toHaveLength(3);
    });
  });

  describe('最佳实践', () => {
    it('从环境变量读取配置', () => {
      const config: ProxyConfig = {
        protocol: 'http',
        host: process.env.PROXY_HOST || 'proxy.example.com',
        port: process.env.PROXY_PORT || '8080',
        username: process.env.PROXY_USER || 'user',
        password: process.env.PROXY_PASS || 'pass',
      };

      expect(config.host).toBeTruthy();
      expect(config.port).toBeTruthy();
    });

    it('实现超时控制', async () => {
      const timeout = 5000;
      const testWithTimeout = () => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('超时')), timeout)
        );
        const testPromise = Promise.resolve({ ip: '1.2.3.4', country: 'US', province: 'CA', city: 'SF', timezone: 'America/Los_Angeles', latency: 100 });
        return Promise.race([testPromise, timeoutPromise]);
      };

      const result = await testWithTimeout();
      expect(result).toBeDefined();
    });

    it('实现重试机制', async () => {
      const maxRetries = 3;
      let attempts = 0;

      const testWithRetry = async () => {
        while (attempts < maxRetries) {
          attempts++;
          try {
            return { ip: '1.2.3.4', country: 'US', province: 'CA', city: 'SF', timezone: 'America/Los_Angeles', latency: 100 };
          } catch (error) {
            if (attempts >= maxRetries) throw error;
          }
        }
      };

      const result = await testWithRetry();
      expect(result).toBeDefined();
      expect(attempts).toBeLessThanOrEqual(maxRetries);
    });
  });
});
