import { describe, it, expect } from 'vitest';
import { testProxyInfo, TestProxyChannel, testProxyInfoByIp234, testProxyInfoByIpInfo } from '../src/index';
import { getProxyUrl, createAxiosInstance } from '../src/common';

/**
 * 集成测试
 * 这些测试会实际调用API，需要网络连接
 * 可以通过环境变量 SKIP_INTEGRATION_TESTS=true 跳过这些测试
 */
const skipIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true';

describe.skipIf(skipIntegration)('集成测试', () => {
  // 这些测试需要真实的网络连接
  describe('实际API调用', () => {
    it('应该能够获取本机IP信息（无代理）', async () => {
      const result = await testProxyInfo(TestProxyChannel.IP234);

      // 验证返回结果的结构
      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.province).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();

      // 验证IP格式
      expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);

      // 验证字符串字段不为空
      expect(result.country.length).toBeGreaterThan(0);
      expect(result.timezone.length).toBeGreaterThan(0);

      // 验证 latency 字段
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000); // 应该小于 30秒超时
    }, 30000); // 30秒超时

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
      const result = await testProxyInfo(TestProxyChannel.IPInfo);

      // 验证返回结果的结构
      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.province).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.timezone).toBeDefined();
      expect(result.latency).toBeDefined();

      // 验证IP格式（支持IPv4和IPv6）
      const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
      expect(result.ip).toMatch(new RegExp(`(${ipv4Regex.source})|(${ipv6Regex.source})`));

      // 验证字符串字段不为空
      expect(result.country.length).toBeGreaterThan(0);
      expect(result.timezone.length).toBeGreaterThan(0);

      // 验证 latency 字段
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
    // 注意：这些测试需要有效的代理配置才能运行
    // 可以通过环境变量提供代理配置
    const proxyUrl = process.env.TEST_PROXY_URL;

    it.skipIf(!proxyUrl)('应该能够通过代理获取IP信息（IP234）', async () => {

      const result = await testProxyInfo(TestProxyChannel.IP234, proxyUrl);

      expect(result).toBeDefined();
      expect(result.ip).toBeDefined();
      expect(result.country).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(30000);
    }, 30000);

    it.skipIf(!proxyUrl)('应该能够通过代理获取IP信息（IPInfo）', async () => {

      const result = await testProxyInfo(TestProxyChannel.IPInfo, proxyUrl);

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
        testProxyInfo(TestProxyChannel.IP234, invalidProxy)
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
        testProxyInfo(TestProxyChannel.IPInfo, invalidProxy)
      ).rejects.toThrow();
    }, 30000);

    it('应该处理无效的代理URL（IP234）', async () => {
      const invalidProxyUrl = 'http://user:pass@invalid-host-12345.com:9999';

      await expect(
        testProxyInfo(TestProxyChannel.IP234, invalidProxyUrl)
      ).rejects.toThrow();
    }, 30000);

    it('应该处理无效的代理URL（IPInfo）', async () => {
      const invalidProxyUrl = 'http://user:pass@invalid-host-12345.com:9999';

      await expect(
        testProxyInfo(TestProxyChannel.IPInfo, invalidProxyUrl)
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
      
      // 验证URL格式
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

// 提示信息
if (skipIntegration) {
  console.log('\n⚠️  集成测试已跳过。要运行集成测试，请设置环境变量 SKIP_INTEGRATION_TESTS=false\n');
} else {
  console.log('\n✓ 运行集成测试（需要网络连接）\n');
}

