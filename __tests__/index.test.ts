import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testProxyInfo, TestProxyChannel } from '../src/index';
import { ProxyConfig } from '../src/common';
import * as ip234Module from '../src/ip234';
import * as ipInfoModule from '../src/ip-info';

// Mock modules
vi.mock('../src/ip234');
vi.mock('../src/ip-info');

describe('index - testProxyInfo 函数', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('IP234 通道', () => {
    const mockResult = {
      ip: '1.2.3.4',
      country: 'United States',
      province: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      latency: 100,
    };

    it('应该正确调用 IP234 通道(无代理)', async () => {
      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(TestProxyChannel.IP234);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(undefined);
    });

    it('应该传递 ProxyConfig 对象到 IP234', async () => {
      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(TestProxyChannel.IP234, proxyConfig);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(proxyConfig);
    });

    it('应该传递代理 URL 字符串到 IP234', async () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';

      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(TestProxyChannel.IP234, proxyUrl);

      expect(result).toEqual(mockResult);
      expect(ip234Module.default).toHaveBeenCalledWith(proxyUrl);
    });
  });

  describe('IPInfo 通道', () => {
    const mockResult = {
      ip: '1.2.3.4',
      country: 'US',
      province: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      latency: 100,
    };

    it('应该正确调用 IPInfo 通道(无代理)', async () => {
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(TestProxyChannel.IPInfo);

      expect(result).toEqual(mockResult);
      expect(ipInfoModule.default).toHaveBeenCalledWith(undefined);
    });

    it('应该传递 ProxyConfig 对象到 IPInfo', async () => {
      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(TestProxyChannel.IPInfo, proxyConfig);

      expect(result).toEqual(mockResult);
      expect(ipInfoModule.default).toHaveBeenCalledWith(proxyConfig);
    });

    it('应该传递代理 URL 字符串到 IPInfo', async () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';

      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo(TestProxyChannel.IPInfo, proxyUrl);

      expect(result).toEqual(mockResult);
      expect(ipInfoModule.default).toHaveBeenCalledWith(proxyUrl);
    });
  });

  describe('错误处理', () => {
    it('应该在不支持的通道时抛出错误', async () => {
      const invalidChannel = 'invalid_channel' as TestProxyChannel;

      await expect(testProxyInfo(invalidChannel)).rejects.toThrow(
        '不支持的通道: invalid_channel'
      );
    });

    it('应该传播底层测试函数的错误', async () => {
      const errorMessage = 'Network connection failed';
      vi.mocked(ip234Module.default).mockRejectedValue(new Error(errorMessage));

      await expect(testProxyInfo(TestProxyChannel.IP234)).rejects.toThrow(errorMessage);
    });
  });

  describe('多通道测试', () => {
    const mockResult = {
      ip: '1.2.3.4',
      country: 'United States',
      province: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      latency: 100,
    };

    it('应该在空数组时抛出错误', async () => {
      await expect(testProxyInfo([])).rejects.toThrow('至少需要提供一个测试通道');
    });

    it('应该并发调用所有通道，返回最快成功的结果', async () => {
      const fasterResult = { ...mockResult, ip: '5.6.7.8' };
      // 使用不同的延迟来模拟异步执行顺序
      // IP234 更慢
      vi.mocked(ip234Module.default).mockImplementation(() => 
        new Promise(resolve => {
          // 使用 queueMicrotask 和 Promise 链模拟更慢的响应
          Promise.resolve()
            .then(() => Promise.resolve())
            .then(() => resolve(mockResult));
        })
      );
      
      // IPInfo 更快，应该先返回
      vi.mocked(ipInfoModule.default).mockImplementation(() => 
        Promise.resolve(fasterResult)
      );

      const result = await testProxyInfo([TestProxyChannel.IP234, TestProxyChannel.IPInfo]);

      // 应该返回更快的 IPInfo 结果（因为它立即 resolve）
      expect(result.ip).toBe('5.6.7.8');
      
      // 两个都应该被调用
      expect(ip234Module.default).toHaveBeenCalled();
      expect(ipInfoModule.default).toHaveBeenCalled();
    });

    it('应该在部分通道失败时返回成功的结果', async () => {
      vi.mocked(ip234Module.default).mockRejectedValue(new Error('IP234 failed'));
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      const result = await testProxyInfo([TestProxyChannel.IP234, TestProxyChannel.IPInfo]);

      expect(result).toEqual(mockResult);
    });

    it('应该在所有通道失败时抛出聚合错误', async () => {
      vi.mocked(ip234Module.default).mockRejectedValue(new Error('IP234 failed'));
      vi.mocked(ipInfoModule.default).mockRejectedValue(new Error('IPInfo failed'));

      await expect(testProxyInfo([TestProxyChannel.IP234, TestProxyChannel.IPInfo])).rejects.toThrow(
        '多渠道代理测试失败'
      );
    });

    it('应该传递代理配置到所有通道', async () => {
      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
      };

      vi.mocked(ip234Module.default).mockResolvedValue(mockResult);
      vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);

      await testProxyInfo([TestProxyChannel.IP234, TestProxyChannel.IPInfo], proxyConfig);

      expect(ip234Module.default).toHaveBeenCalledWith(proxyConfig);
      expect(ipInfoModule.default).toHaveBeenCalledWith(proxyConfig);
    });
  });

  describe('模块导出', () => {
    it('应该导出 testProxyInfo 函数', () => {
      expect(testProxyInfo).toBeDefined();
      expect(typeof testProxyInfo).toBe('function');
    });

    it('应该导出 TestProxyChannel 枚举', () => {
      expect(TestProxyChannel).toBeDefined();
      expect(TestProxyChannel.IP234).toBe('ip234');
      expect(TestProxyChannel.IPInfo).toBe('ip_info');
    });
  });
});

