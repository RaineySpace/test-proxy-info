import { describe, it, expect } from 'vitest';
import {
  compositeProxy,
  parseProxyConfig,
  getProxyPort,
  DEFAULT_PORTS,
  createProxyFetch,
} from '../src/requester';
import { ProxyConfig } from '../src/common';

describe('compositeProxy', () => {
  it('应该直接返回字符串代理', () => {
    const proxy = 'http://localhost:8080';
    expect(compositeProxy(proxy)).toBe(proxy);
  });

  it('应该正确组合 HTTP 代理配置', () => {
    const proxy: ProxyConfig = {
      protocol: 'http',
      host: 'localhost',
      port: 8080,
    };
    expect(compositeProxy(proxy)).toBe('http://localhost:8080');
  });

  it('应该正确组合带认证的代理配置', () => {
    const proxy: ProxyConfig = {
      protocol: 'http',
      host: 'localhost',
      port: 8080,
      username: 'user',
      password: 'pass',
    };
    expect(compositeProxy(proxy)).toBe('http://user:pass@localhost:8080');
  });

  it('应该正确处理不带端口的代理配置', () => {
    const proxy: ProxyConfig = {
      protocol: 'https',
      host: 'proxy.example.com',
    };
    expect(compositeProxy(proxy)).toBe('https://proxy.example.com');
  });

  it('应该正确组合 SOCKS5 代理配置', () => {
    const proxy: ProxyConfig = {
      protocol: 'socks5',
      host: 'localhost',
      port: 1080,
    };
    expect(compositeProxy(proxy)).toBe('socks5://localhost:1080');
  });
});

describe('parseProxyConfig', () => {
  it('应该直接返回 ProxyConfig 对象', () => {
    const proxy: ProxyConfig = {
      protocol: 'http',
      host: 'localhost',
      port: 8080,
    };
    expect(parseProxyConfig(proxy)).toBe(proxy);
  });

  it('应该正确解析 HTTP 代理 URL', () => {
    const result = parseProxyConfig('http://localhost:8080');
    expect(result).toEqual({
      protocol: 'http',
      host: 'localhost',
      port: 8080,
      username: undefined,
      password: undefined,
    });
  });

  it('应该正确解析 HTTPS 代理 URL', () => {
    const result = parseProxyConfig('https://proxy.example.com:8443');
    expect(result).toEqual({
      protocol: 'https',
      host: 'proxy.example.com',
      port: 8443,
      username: undefined,
      password: undefined,
    });
  });

  it('应该正确解析 SOCKS5 代理 URL', () => {
    const result = parseProxyConfig('socks5://localhost:1080');
    expect(result).toEqual({
      protocol: 'socks5',
      host: 'localhost',
      port: 1080,
      username: undefined,
      password: undefined,
    });
  });

  it('应该正确解析带认证的代理 URL', () => {
    const result = parseProxyConfig('http://user:pass@localhost:8080');
    expect(result).toEqual({
      protocol: 'http',
      host: 'localhost',
      port: 8080,
      username: 'user',
      password: 'pass',
    });
  });

  it('应该正确解码 URL 编码的用户名和密码', () => {
    const result = parseProxyConfig('http://user%40domain:p%40ss%3Aword@localhost:8080');
    expect(result).toEqual({
      protocol: 'http',
      host: 'localhost',
      port: 8080,
      username: 'user@domain',
      password: 'p@ss:word',
    });
  });

  it('应该正确处理不带端口的代理 URL', () => {
    const result = parseProxyConfig('http://localhost');
    expect(result).toEqual({
      protocol: 'http',
      host: 'localhost',
      port: undefined,
      username: undefined,
      password: undefined,
    });
  });

  it('应该对无效协议抛出错误', () => {
    expect(() => parseProxyConfig('ftp://localhost:21')).toThrow(
      'Invalid Proxy URL protocol: the URL must start with http:, https: or socks5:.'
    );
  });
});

describe('getProxyPort', () => {
  it('应该返回配置中的端口', () => {
    const proxy: ProxyConfig = {
      protocol: 'http',
      host: 'localhost',
      port: 8080,
    };
    expect(getProxyPort(proxy)).toBe(8080);
  });

  it('应该返回 HTTP 默认端口 80', () => {
    const proxy: ProxyConfig = {
      protocol: 'http',
      host: 'localhost',
    };
    expect(getProxyPort(proxy)).toBe(80);
  });

  it('应该返回 HTTPS 默认端口 443', () => {
    const proxy: ProxyConfig = {
      protocol: 'https',
      host: 'localhost',
    };
    expect(getProxyPort(proxy)).toBe(443);
  });

  it('应该返回 SOCKS5 默认端口 1080', () => {
    const proxy: ProxyConfig = {
      protocol: 'socks5',
      host: 'localhost',
    };
    expect(getProxyPort(proxy)).toBe(1080);
  });
});

describe('DEFAULT_PORTS', () => {
  it('应该包含所有协议的默认端口', () => {
    expect(DEFAULT_PORTS.http).toBe(80);
    expect(DEFAULT_PORTS.https).toBe(443);
    expect(DEFAULT_PORTS.socks5).toBe(1080);
  });
});

describe('createProxyFetch', () => {
  it('应该返回一个函数', () => {
    const fetch = createProxyFetch();
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受字符串代理配置', () => {
    const fetch = createProxyFetch('http://localhost:8080');
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受 ProxyConfig 对象', () => {
    const fetch = createProxyFetch({
      protocol: 'http',
      host: 'localhost',
      port: 8080,
    });
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受 SOCKS5 代理配置', () => {
    const fetch = createProxyFetch({
      protocol: 'socks5',
      host: 'localhost',
      port: 1080,
    });
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受 SOCKS5 代理 URL', () => {
    const fetch = createProxyFetch('socks5://localhost:1080');
    expect(typeof fetch).toBe('function');
  });

  it('应该对无效协议在调用时抛出错误', async () => {
    const fetch = createProxyFetch('ftp://localhost:21');
    await expect(fetch('http://example.com')).rejects.toThrow(
      'Invalid Proxy URL protocol: the URL must start with http:, https: or socks5:.'
    );
  });
});
