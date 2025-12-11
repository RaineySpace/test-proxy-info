import { describe, it, expect, vi } from 'vitest';
import {
  compositeProxy,
  parseProxyConfig,
  getProxyPort,
  createProxyFetch,
  createURLWithSearchParams,
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

describe('createProxyFetch', () => {
  it('应该返回一个函数', () => {
    const fetch = createProxyFetch();
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受字符串代理配置', () => {
    const fetch = createProxyFetch({ proxy: 'http://localhost:8080' });
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受 ProxyConfig 对象', () => {
    const fetch = createProxyFetch({
      proxy: {
        protocol: 'http',
        host: 'localhost',
        port: 8080,
      },
    });
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受 SOCKS5 代理配置', () => {
    const fetch = createProxyFetch({
      proxy: {
        protocol: 'socks5',
        host: 'localhost',
        port: 1080,
      },
    });
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受 SOCKS5 代理 URL', () => {
    const fetch = createProxyFetch({ proxy: 'socks5://localhost:1080' });
    expect(typeof fetch).toBe('function');
  });

  it('应该对无效协议在调用时抛出错误', async () => {
    const fetch = createProxyFetch({ proxy: 'ftp://localhost:21' });
    await expect(fetch('http://example.com')).rejects.toThrow(
      'Invalid Proxy URL protocol: the URL must start with http:, https: or socks5:.'
    );
  });

  it('应该能接受自定义 timeout', () => {
    const fetch = createProxyFetch({ timeout: 5000 });
    expect(typeof fetch).toBe('function');
  });

  it('应该能接受自定义 fetcher', () => {
    const mockFetcher = vi.fn();
    const fetch = createProxyFetch({ fetcher: mockFetcher });
    expect(typeof fetch).toBe('function');
  });
});

describe('createURLWithSearchParams', () => {
  it('应该返回不带参数的原始 URL', () => {
    const url = createURLWithSearchParams('https://example.com/api');
    expect(url).toBe('https://example.com/api');
  });

  it('应该正确添加单个查询参数', () => {
    const url = createURLWithSearchParams('https://example.com/api', { key: 'value' });
    expect(url).toBe('https://example.com/api?key=value');
  });

  it('应该正确添加多个查询参数', () => {
    const url = createURLWithSearchParams('https://example.com/api', { foo: 'bar', baz: 'qux' });
    expect(url).toContain('foo=bar');
    expect(url).toContain('baz=qux');
  });

  it('应该正确编码特殊字符', () => {
    const url = createURLWithSearchParams('https://example.com/api', { key: 'hello world' });
    expect(url).toBe('https://example.com/api?key=hello+world');
  });

  it('应该保留原始 URL 中已有的查询参数', () => {
    const url = createURLWithSearchParams('https://example.com/api?existing=param', { new: 'value' });
    expect(url).toContain('existing=param');
    expect(url).toContain('new=value');
  });

  it('应该覆盖原始 URL 中同名的查询参数', () => {
    const url = createURLWithSearchParams('https://example.com/api?key=old', { key: 'new' });
    expect(url).toBe('https://example.com/api?key=new');
  });

  it('应该处理空的查询参数对象', () => {
    const url = createURLWithSearchParams('https://example.com/api', {});
    expect(url).toBe('https://example.com/api');
  });
});
