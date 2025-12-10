import { describe, it, expect } from 'vitest';
import { createProxyFetch } from '../src/requester';

const SKIP_INTEGRATION_TESTS = process.env.SKIP_INTEGRATION_TESTS !== 'false';

describe.skipIf(SKIP_INTEGRATION_TESTS)('requester 集成测试', () => {
  describe('createProxyFetch - 无代理模式', () => {
    it('应该能够成功发起请求', async () => {
      const fetch = createProxyFetch();
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json() as { ip: string };

      expect(response.ok).toBe(true);
      expect(data.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
    });
  });

  describe('createProxyFetch - HTTP 代理配置对象', () => {
    it.skip('应该能够通过 HTTP 代理发起请求（需要有效的代理服务器）', async () => {
      const fetch = createProxyFetch({
        protocol: 'http',
        host: 'localhost',
        port: 8080,
      });
      const response = await fetch('https://ipinfo.io/json');
      expect(response.ok).toBe(true);
    });
  });

  describe('createProxyFetch - SOCKS5 代理配置对象', () => {
    it.skip('应该能够通过 SOCKS5 代理发起请求（需要有效的代理服务器）', async () => {
      const fetch = createProxyFetch({
        protocol: 'socks5',
        host: 'localhost',
        port: 1080,
      });
      const response = await fetch('https://ipinfo.io/json');
      expect(response.ok).toBe(true);
    });
  });

  describe('createProxyFetch - SOCKS5 代理 URL', () => {
    it.skip('应该能够通过 SOCKS5 URL 代理发起请求（需要有效的代理服务器）', async () => {
      const fetch = createProxyFetch('socks5://localhost:1080');
      const response = await fetch('https://ipinfo.io/json');
      expect(response.ok).toBe(true);
    });
  });

  describe('createProxyFetch - 带认证的 SOCKS5 代理', () => {
    it.skip('应该能够通过带认证的 SOCKS5 代理发起请求（需要有效的代理服务器）', async () => {
      const fetch = createProxyFetch({
        protocol: 'socks5',
        host: 'localhost',
        port: 1080,
        username: 'user',
        password: 'pass',
      });
      const response = await fetch('https://ipinfo.io/json');
      expect(response.ok).toBe(true);
    });
  });
});
