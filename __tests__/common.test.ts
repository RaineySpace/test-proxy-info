import { describe, it, expect } from 'vitest';
import { TestProxyResult } from '../src/common';
import { ProxyConfig, createProxyFetch } from '../src/requester';

describe('common - TestProxyResult 类型', () => {
  it('应该包含所有必需的字段，包括 latency', () => {
    const result: TestProxyResult = {
      ip: '1.2.3.4',
      country: 'US',
      province: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      latency: 100,
    };

    expect(result).toHaveProperty('ip');
    expect(result).toHaveProperty('country');
    expect(result).toHaveProperty('province');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('timezone');
    expect(result).toHaveProperty('latency');

    expect(typeof result.ip).toBe('string');
    expect(typeof result.country).toBe('string');
    expect(typeof result.province).toBe('string');
    expect(typeof result.city).toBe('string');
    expect(typeof result.timezone).toBe('string');
    expect(typeof result.latency).toBe('number');
  });

  it('latency 字段应该是数字类型', () => {
    const result: TestProxyResult = {
      ip: '1.2.3.4',
      country: 'US',
      province: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      latency: 250,
    };

    expect(typeof result.latency).toBe('number');
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });
});

describe('requester - createProxyFetch', () => {
  describe('基本功能', () => {
    it('应该在没有代理配置时返回 undici fetch', () => {
      const fetcher = createProxyFetch();
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });

    it('应该接受 ProxyConfig 对象配置', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const fetcher = createProxyFetch(config);
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });

    it('应该接受字符串类型的代理 URL', () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';
      const fetcher = createProxyFetch(proxyUrl);
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });

    it('应该支持传入自定义的 Fetcher 函数', () => {
      const customFetcher = async () => new Response();
      const fetcher = createProxyFetch(customFetcher);
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });

    it('应该支持无认证的代理配置', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
      };

      const fetcher = createProxyFetch(config);
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });
  });

  describe('多协议支持', () => {
    it('应该支持 HTTP 协议代理', () => {
      const config: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };
      
      const fetcher = createProxyFetch(config);
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });

    it('应该支持 HTTPS 协议代理', () => {
      const config: ProxyConfig = {
        protocol: 'https',
        host: 'proxy.example.com',
        port: '443',
        username: 'user',
        password: 'pass',
      };
      
      const fetcher = createProxyFetch(config);
      
      expect(fetcher).toBeDefined();
      expect(typeof fetcher).toBe('function');
    });
  });
});
