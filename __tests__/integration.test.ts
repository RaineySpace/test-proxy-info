import { describe, it, expect } from 'vitest';
import { testProxyInfo, TestProxyChannel, testProxyInfoByIp234, testProxyInfoByIpInfo } from '../src/index';
import { getProxyUrl } from '../src/common';
import { createAxiosInstance } from '../src/requester';

const skipIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true';

describe.skipIf(skipIntegration)('集成测试', () => {
  describe('实际API调用', () => {
    it('应该能够获取本机IP信息（无代理，默认通道）', async () => {
      const result = await testProxyInfo();

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.province).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();

      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it('应该能够获取本机IP信息（IP234通道）', async () => {
      const result = await testProxyInfo(undefined, TestProxyChannel.IP234);

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.province).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();

      expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);

      expect(result.country.length).toBeGreaterThan(0);
      expect(result.timezone.length).toBeGreaterThan(0);

      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it('应该能够通过testProxyByIp234直接调用', async () => {
      const result = await testProxyInfoByIp234();

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it('应该能够获取本机IP信息（IPInfo通道）', async () => {
      const result = await testProxyInfo(undefined, TestProxyChannel.IPInfo);

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.province).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();

      const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
      expect(result.ip).toMatch(new RegExp(`(${ipv4Regex.source})|(${ipv6Regex.source})`));

      expect(result.country.length).toBeGreaterThan(0);
      expect(result.timezone.length).toBeGreaterThan(0);

      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it('应该能够通过testProxyByIpInfo直接调用', async () => {
      const result = await testProxyInfoByIpInfo();

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it('应该能够创建axios实例并发送请求（IP234）', async () => {
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.get('https://ip234.in/ip.json');

      expect(response.data).toBeDefined();
      expect(response.data.ip).toBeDefined();
      expect(response.data.country).toBeDefined();
    }, 30000);

    it('应该能够创建axios实例并发送请求（IPInfo）', async () => {
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.get('https://ipinfo.io/json');

      expect(response.data).toBeDefined();
      expect(response.data.ip).toBeDefined();
      expect(response.data.country).toBeDefined();
    }, 30000);
  });

  describe('代理测试（需要有效的代理配置）', () => {
    const proxyUrl = process.env.TEST_PROXY_URL;

    it.skipIf(!proxyUrl)('应该能够通过代理获取IP信息（IP234）', async () => {

      const result = await testProxyInfo(proxyUrl, TestProxyChannel.IP234);

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it.skipIf(!proxyUrl)('应该能够通过代理获取IP信息（IPInfo）', async () => {

      const result = await testProxyInfo(proxyUrl, TestProxyChannel.IPInfo);

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it.skipIf(!proxyUrl)('应该能够通过代理获取IP信息（默认通道）', async () => {
      const result = await testProxyInfo(proxyUrl);

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);
  });

  describe('错误处理', () => {
    it('应该处理无效的代理配置（IP234）', async () => {
      const invalidProxy = {
        protocol: 'http' as const,
        host: 'invalid-proxy-host-that-does-not-exist.com',
        port: '9999',
        username: 'user',
        password: 'pass',
      };

      await expect(
        testProxyInfo(invalidProxy, TestProxyChannel.IP234)
      ).rejects.toThrow();
    }, 30000);

    it('应该处理无效的代理配置（IPInfo）', async () => {
      const invalidProxy = {
        protocol: 'http' as const,
        host: 'invalid-proxy-host-that-does-not-exist.com',
        port: '9999',
        username: 'user',
        password: 'pass',
      };

      await expect(
        testProxyInfo(invalidProxy, TestProxyChannel.IPInfo)
      ).rejects.toThrow();
    }, 30000);

    it('应该处理无效的代理URL（IP234）', async () => {
      const invalidProxyUrl = 'http://user:pass@invalid-host-12345.com:9999';

      await expect(
        testProxyInfo(invalidProxyUrl, TestProxyChannel.IP234)
      ).rejects.toThrow();
    }, 30000);

    it('应该处理无效的代理URL（IPInfo）', async () => {
      const invalidProxyUrl = 'http://user:pass@invalid-host-12345.com:9999';

      await expect(
        testProxyInfo(invalidProxyUrl, TestProxyChannel.IPInfo)
      ).rejects.toThrow();
    }, 30000);
  });

  describe('工具函数集成测试', () => {
    it('getProxyUrl应该生成有效的URL格式', () => {
      const config = {
        protocol: 'http' as const,
        host: 'proxy.example.com',
        port: '8080',
        username: 'testuser',
        password: 'testpass',
      };

      const url = getProxyUrl(config);
      
      expect(url).toMatch(/^http:\/\//);
      expect(url).toContain('proxy.example.com');
      expect(url).toContain('8080');
      expect(url).toContain('testuser');
      expect(url).toContain('testpass');
    });

    it('createAxiosInstance应该返回可用的axios实例', () => {
      const instance = createAxiosInstance();
      
      expect(instance.get).toBeDefined();
      expect(instance.post).toBeDefined();
      expect(instance.defaults).toBeDefined();
      expect(typeof instance.get).toBe('function');
    });
  });
});

if (skipIntegration) {
  console.log('\n⚠️  集成测试已跳过。要运行集成测试，请设置环境变量 SKIP_INTEGRATION_TESTS=false\n');
} else {
  console.log('\n✓ 运行集成测试（需要网络连接）\n');
}
