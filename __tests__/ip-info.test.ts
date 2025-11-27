import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByIpInfo } from '../src/ip-info';
import { ProxyConfig } from '../src/common';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('ip-info', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByIpInfo', () => {
    it('应该成功获取IP信息（无代理）', async () => {
      const mockResponse = {
        data: {
          ip: '1.2.3.4',
          city: 'San Francisco',
          region: 'California',
          country: 'US',
          loc: '37.7749,-122.4194',
          org: 'AS12345 Example ISP',
          postal: '94102',
          timezone: 'America/Los_Angeles',
        },
      };

      // Mock axios.create 返回的实例
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: 'US',
        province: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('https://ipinfo.io/json');
    });

    it('应该成功获取IP信息（使用代理配置对象）', async () => {
      const proxyConfig: ProxyConfig = {
        protocol: 'http',
        host: 'proxy.example.com',
        port: '8080',
        username: 'user',
        password: 'pass',
      };

      const mockResponse = {
        data: {
          ip: '5.6.7.8',
          city: 'Tokyo',
          region: 'Tokyo',
          country: 'JP',
          loc: '35.6762,139.6503',
          org: 'AS54321 Japan ISP',
          postal: '100-0001',
          timezone: 'Asia/Tokyo',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo(proxyConfig);

      expect(result).toEqual({
        ip: '5.6.7.8',
        country: 'JP',
        province: 'Tokyo',
        city: 'Tokyo',
        timezone: 'Asia/Tokyo',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(axios.create).toHaveBeenCalled();
    });

    it('应该成功获取IP信息（使用代理URL字符串）', async () => {
      const proxyUrl = 'http://user:pass@proxy.example.com:8080';

      const mockResponse = {
        data: {
          ip: '9.10.11.12',
          city: 'London',
          region: 'England',
          country: 'GB',
          loc: '51.5074,-0.1278',
          org: 'AS99999 UK ISP',
          postal: 'EC1A',
          timezone: 'Europe/London',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo(proxyUrl);

      expect(result).toEqual({
        ip: '9.10.11.12',
        country: 'GB',
        province: 'England',
        city: 'London',
        timezone: 'Europe/London',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('应该在API返回空数据时抛出错误', async () => {
      const mockResponse = {
        data: null,
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      await expect(testProxyInfoByIpInfo()).rejects.toThrow('IPInfo 检测渠道返回结果为空');
    });

    it('应该处理网络错误', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(new Error('Network error')),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      await expect(testProxyInfoByIpInfo()).rejects.toThrow('Network error');
    });

    it('应该处理超时错误', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';

      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(timeoutError),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      await expect(testProxyInfoByIpInfo()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('应该正确映射所有字段', async () => {
      const mockResponse = {
        data: {
          ip: '192.168.1.1',
          city: 'Beijing',
          region: 'Beijing',
          country: 'CN',
          loc: '39.9042,116.4074',
          org: 'AS12345 China Telecom',
          postal: '100000',
          timezone: 'Asia/Shanghai',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      // 验证所有必需字段都存在
      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('province');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('latency');

      // 验证字段类型
      expect(typeof result.ip).toBe('string');
      expect(typeof result.country).toBe('string');
      expect(typeof result.province).toBe('string');
      expect(typeof result.city).toBe('string');
      expect(typeof result.timezone).toBe('string');
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('应该处理缺少部分字段的响应', async () => {
      const mockResponse = {
        data: {
          ip: '192.168.1.1',
          city: 'Unknown',
          region: '',
          country: 'CN',
          loc: '39.9042,116.4074',
          org: 'AS12345 China Telecom',
          postal: '',
          timezone: 'Asia/Shanghai',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      expect(result).toEqual({
        ip: '192.168.1.1',
        country: 'CN',
        province: '',
        city: 'Unknown',
        timezone: 'Asia/Shanghai',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('应该处理IPv6地址', async () => {
      const mockResponse = {
        data: {
          ip: '2001:db8::1',
          city: 'New York',
          region: 'New York',
          country: 'US',
          loc: '40.7128,-74.0060',
          org: 'AS12345 Example ISP',
          postal: '10001',
          timezone: 'America/New_York',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      expect(result).toEqual({
        ip: '2001:db8::1',
        country: 'US',
        province: 'New York',
        city: 'New York',
        timezone: 'America/New_York',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('应该处理不同的国家代码格式', async () => {
      const mockResponse = {
        data: {
          ip: '203.0.113.1',
          city: 'Sydney',
          region: 'New South Wales',
          country: 'AU',
          loc: '-33.8688,151.2093',
          org: 'AS12345 Australia ISP',
          postal: '2000',
          timezone: 'Australia/Sydney',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };
      
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      expect(result.country).toBe('AU');
      expect(result.ip).toBe('203.0.113.1');
      expect(result.city).toBe('Sydney');
      expect(result.province).toBe('New South Wales');
      expect(result.timezone).toBe('Australia/Sydney');
    });

    it('应该正确计算请求延迟时间', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockResponse = {
        data: {
          ip: '1.2.3.4',
          city: 'Test City',
          region: 'Test Region',
          country: 'US',
          loc: '0,0',
          org: 'Test ISP',
          postal: '00000',
          timezone: 'UTC',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };

      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      expect(result.latency).toBe(500); // 1500 - 1000 = 500ms
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });

    it('应该在延迟响应时正确测量延迟', async () => {
      const mockResponse = {
        data: {
          ip: '1.2.3.4',
          city: 'Test City',
          region: 'Test Region',
          country: 'US',
          loc: '0,0',
          org: 'Test ISP',
          postal: '00000',
          timezone: 'UTC',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockImplementation(() =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockResponse), 100)
          )
        ),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };

      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      // 延迟应该至少 100ms（考虑到执行时间可能稍长）
      expect(result.latency).toBeGreaterThanOrEqual(100);
      expect(result.latency).toBeLessThan(1000); // 应该不会超过 1 秒
    });

    it('应该在快速响应时返回较小的延迟值', async () => {
      const mockResponse = {
        data: {
          ip: '1.2.3.4',
          city: 'Test City',
          region: 'Test Region',
          country: 'US',
          loc: '0,0',
          org: 'Test ISP',
          postal: '00000',
          timezone: 'UTC',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: vi.fn(),
            handlers: [],
          },
        },
      };

      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await testProxyInfoByIpInfo();

      // 快速 mock 响应应该有很小的延迟
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.latency).toBeLessThan(100); // 应该很快
    });
  });
});
