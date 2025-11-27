import { describe, it, expect } from 'vitest';
import { getProxyUrl, ProxyConfig, TestProxyError, TestProxyErrorCode, TestProxyResult } from '../src/common';
import { createAxiosInstance } from '../src/requester';

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

describe('common - TestProxyError', () => {
  it('应该创建带错误码的 TestProxyError', () => {
    const error = new TestProxyError('测试错误', TestProxyErrorCode.NETWORK_ERROR);
    expect(error.message).toBe('测试错误');
    expect(error.code).toBe(TestProxyErrorCode.NETWORK_ERROR);
    expect(error).toBeInstanceOf(Error);
  });

  it('应该创建默认错误码的 TestProxyError', () => {
    const error = new TestProxyError('测试错误');
    expect(error.message).toBe('测试错误');
    expect(error.code).toBe(TestProxyErrorCode.UNKNOWN_ERROR);
  });

  it('应该支持所有错误码类型', () => {
    expect(TestProxyErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    expect(TestProxyErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(TestProxyErrorCode.PROXY_SERVER_ERROR).toBe('PROXY_SERVER_ERROR');
    expect(TestProxyErrorCode.DETECTION_CHANNEL_ERROR).toBe('DETECTION_CHANNEL_ERROR');
    expect(TestProxyErrorCode.MULTIPLE_CHANNEL_TEST_FAILED).toBe('MULTIPLE_CHANNEL_TEST_FAILED');
  });

  it('应该创建带 errors 数组的 TestProxyError', () => {
    const errors = [new Error('Error 1'), new Error('Error 2')];
    const error = new TestProxyError('多渠道测试失败', TestProxyErrorCode.MULTIPLE_CHANNEL_TEST_FAILED, errors);
    expect(error.message).toBe('多渠道测试失败');
    expect(error.code).toBe(TestProxyErrorCode.MULTIPLE_CHANNEL_TEST_FAILED);
    expect(error.errors).toEqual(errors);
  });
});

describe('common - getProxyUrl', () => {
  describe('基本功能', () => {
    it('应该直接返回字符串类型的代理URL', () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';
      const result = getProxyUrl(proxyUrl);
      expect(result).toBe(proxyUrl);
    });

    it('应该正确转换完整的代理配置对象为URL', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const url = getProxyUrl(config);
      expect(url).toBe('http://user:pass@proxy.example.com:8080');
    });
  });

  describe('协议支持', () => {
    it('应该支持 HTTP 协议', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
      };

      expect(getProxyUrl(config)).toBe('http://proxy.example.com:8080');
    });

    it('应该支持 HTTPS 协议', () => {
      const config: ProxyConfig = {
        protocol: 'https' as const,
        host: 'secure-proxy.example.com',
        port: '443',
        username: 'admin',
        password: 'secure123',
      };

      expect(getProxyUrl(config)).toBe('https://admin:secure123@secure-proxy.example.com:443');
    });

    it('应该支持 SOCKS5 协议', () => {
      const config: ProxyConfig = {
        protocol: 'socks5' as const,
        host: 'proxy.example.com',
        port: '1080',
        username: 'user',
        password: 'pass',
      };

      expect(getProxyUrl(config)).toBe('socks5://user:pass@proxy.example.com:1080');
    });
  });

  describe('可选字段处理', () => {
    it('应该处理没有端口的配置', () => {
      const config: ProxyConfig = {
        protocol: 'https' as const,
        host: 'proxy.example.com',
        username: 'user',
        password: 'pass',
      };

      expect(getProxyUrl(config)).toBe('https://user:pass@proxy.example.com');
    });

    it('应该处理没有认证信息的配置', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
      };

      expect(getProxyUrl(config)).toBe('http://proxy.example.com:8080');
    });

    it('应该处理只有主机和协议的最简配置', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
      };

      expect(getProxyUrl(config)).toBe('http://proxy.example.com');
    });

    it('应该处理只有用户名没有密码的情况', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
      };

      // 没有密码时不应该添加认证信息
      expect(getProxyUrl(config)).toBe('http://proxy.example.com:8080');
    });

    it('应该处理只有密码没有用户名的情况', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        password: 'pass',
      };

      // 没有用户名时不应该添加认证信息
      expect(getProxyUrl(config)).toBe('http://proxy.example.com:8080');
    });
  });

  describe('特殊场景', () => {
    it('应该处理包含特殊字符的认证信息', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'user@domain',
        password: 'p@ss:word',
      };

      expect(getProxyUrl(config)).toBe('http://user@domain:p@ss:word@proxy.example.com:8080');
    });

    it('应该处理 IP 地址作为主机', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: '192.168.1.100',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      expect(getProxyUrl(config)).toBe('http://user:pass@192.168.1.100:8080');
    });

    it('应该处理 localhost 作为主机', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'localhost',
        port: '3128',
      };

      expect(getProxyUrl(config)).toBe('http://localhost:3128');
    });
  });
});

describe('common - createAxiosInstance', () => {
  describe('基本功能', () => {
    it('应该在没有代理配置时创建普通的 Axios 实例', () => {
      const instance = createAxiosInstance();
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeUndefined();
      expect(instance.defaults.httpsAgent).toBeUndefined();
      expect(instance.interceptors).toBeDefined();
      expect(instance.interceptors.response).toBeDefined();
    });

    it('创建的实例应该具有标准的 HTTP 方法', () => {
      const instance = createAxiosInstance();
      
      expect(instance.get).toBeDefined();
      expect(instance.post).toBeDefined();
      expect(typeof instance.get).toBe('function');
      expect(typeof instance.post).toBe('function');
    });
  });

  describe('代理配置支持', () => {
    it('应该接受 ProxyConfig 对象配置', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const instance = createAxiosInstance(config);
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
      expect(instance.defaults.httpsAgent).toBeDefined();
    });

    it('应该接受字符串类型的代理 URL', () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';
      const instance = createAxiosInstance(proxyUrl);
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
      expect(instance.defaults.httpsAgent).toBeDefined();
    });

    it('应该支持无认证的代理配置', () => {
      const config: ProxyConfig = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
      };

      const instance = createAxiosInstance(config);
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
      expect(instance.defaults.httpsAgent).toBeDefined();
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
      
      const instance = createAxiosInstance(config);
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
      expect(instance.defaults.httpsAgent).toBeDefined();
    });

    it('应该支持 HTTPS 协议代理', () => {
      const config: ProxyConfig = {
        protocol: 'https',
        host: 'proxy.example.com',
        port: '443',
        username: 'user',
        password: 'pass',
      };
      
      const instance = createAxiosInstance(config);
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
      expect(instance.defaults.httpsAgent).toBeDefined();
    });

    it('应该支持 SOCKS5 协议代理', () => {
      const config: ProxyConfig = {
        protocol: 'socks5',
        host: 'proxy.example.com',
        port: '1080',
        username: 'user',
        password: 'pass',
      };
      
      const instance = createAxiosInstance(config);
      
      expect(instance).toBeDefined();
      expect(instance.defaults.httpAgent).toBeDefined();
      expect(instance.defaults.httpsAgent).toBeDefined();
    });
  });
});

