import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testProxyInfo, TestProxyChannel } from '../src/index';
import { ProxyConfig } from '../src/requester';
import * as ip234Module from '../src/channel/ip234';
import * as ipInfoModule from '../src/channel/ip-info';

vi.mock('../src/channel/ip234');
vi.mock('../src/channel/ip-info');

describe('index - testProxyInfo 函数', () => {
  const mockResult = {
    ip: '1.2.3.4',
    country: 'United States',
    province: 'California',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    latency: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('使用 IP234 通道', () => {
    it('应该在指定 IP234 通道时使用 testProxyInfoByIp234', async () => {
      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(undefined, TestProxyChannel.IP234);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(undefined);
    });

    it('应该传递 ProxyConfig 对象到 IP234', async () => {
      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);

      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const result = await testProxyInfo(proxyConfig, TestProxyChannel.IP234);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(proxyConfig);
    });

    it('应该传递代理 URL 字符串到 IP234', async () => {
      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);

      const proxyUrl = 'http://user:pass@proxy.example.com:8080';

      const result = await testProxyInfo(proxyUrl, TestProxyChannel.IP234);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(proxyUrl);
    });
  });

  describe('使用 IPInfo 通道', () => {
    it('应该在指定 IPInfo 通道时使用 testProxyInfoByIpInfo', async () => {
      vi.mocked(ipInfoModule.default).mockResolvedValue({
        ...mockResult,
        country: 'US',
      });

      const result = await testProxyInfo(undefined, TestProxyChannel.IPInfo);

      expect(result).toEqual({
        ...mockResult,
        country: 'US',
      });
      expect(ipInfoModule.default).toHaveBeenCalledWith(undefined);
    });

    it('应该传递 ProxyConfig 对象到 IPInfo', async () => {
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const result = await testProxyInfo(proxyConfig, TestProxyChannel.IPInfo);

      expect(result).toEqual(mockResult);
      expect(ipInfoModule.default).toHaveBeenCalledWith(proxyConfig);
    });

    it('应该传递代理 URL 字符串到 IPInfo', async () => {
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const proxyUrl = 'http://user:pass@proxy.example.com:8080';

      const result = await testProxyInfo(proxyUrl, TestProxyChannel.IPInfo);

      expect(result).toEqual(mockResult);
      expect(ipInfoModule.default).toHaveBeenCalledWith(proxyUrl);
    });
  });

  describe('默认通道（所有通道）', () => {
    it('应该在不指定通道时使用所有通道', async () => {
      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
      };

      const result = await testProxyInfo(proxyConfig);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(expect.any(Function));
      expect(ipInfoModule.default).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('错误处理', () => {
    it('应该在通道数组为空时抛出错误', async () => {
      await expect(testProxyInfo(undefined, [])).rejects.toThrow('至少需要提供一个测试通道');
    });

    it('应该在不支持的通道时抛出错误', async () => {
      await expect(testProxyInfo(undefined, 'unsupported' as TestProxyChannel)).rejects.toThrow(
        '不支持的通道: unsupported'
      );
    });

    it('应该在单个通道失败时抛出错误', async () => {
      vi.mocked(ip234Module.default).mockRejectedValue(new Error('IP234 failed'));

      await expect(testProxyInfo(undefined, TestProxyChannel.IP234)).rejects.toThrow('IP234 failed');
    });

    it('应该在 IP234 失败时返回 IPInfo 结果', async () => {
      vi.mocked(ip234Module.default).mockRejectedValue(new Error('IP234 failed'));
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(undefined, [TestProxyChannel.IP234, TestProxyChannel.IPInfo]);

      expect(result).toEqual(mockResult);
    });

    it('应该在所有通道失败时抛出 AggregateError', async () => {
      vi.mocked(ip234Module.default).mockRejectedValue(new Error('IP234 failed'));
      vi.mocked(ipInfoModule.default).mockRejectedValue(new Error('IPInfo failed'));

      await expect(testProxyInfo(undefined, [TestProxyChannel.IP234, TestProxyChannel.IPInfo])).rejects.toBeInstanceOf(AggregateError);
    });

    it('应该传递代理配置到所有通道', async () => {
      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
      };

      await testProxyInfo(proxyConfig, [TestProxyChannel.IP234, TestProxyChannel.IPInfo]);

      expect(ip234Module.default).toHaveBeenCalledWith(expect.any(Function));
      expect(ipInfoModule.default).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('TestProxyChannel 枚举', () => {
    it('应该有正确的枚举值', () => {
      expect(TestProxyChannel.IP234).toBe('ip234');
      expect(TestProxyChannel.IPInfo).toBe('ip_info');
    });
  });
});
