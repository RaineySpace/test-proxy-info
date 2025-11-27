import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByIp234 } from '../src/ip234';
import { ProxyConfig } from '../src/common';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('ip234', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByIp234', () => {
    it('应该成功获取IP信息（无代理）', async () => {
      const mockResponse = {
        data: {
          asn: 12345,
          city: 'San Francisco',
          continent: 'North America',
          continent_code: 'NA',
          country: 'United States',
          country_code: 'US',
          ip: '1.2.3.4',
          latitude: 37.7749,
          longitude: -122.4194,
          metro_code: null,
          network: '1.2.3.0/24',
          organization: 'Example ISP',
          postal: '94102',
          region: 'California',
          region_cn: '加利福尼亚',
          region_code: 'CA',
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

      const result = await testProxyInfoByIp234();

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: 'United States',
        province: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('https://ip234.in/ip.json');
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
          asn: 54321,
          city: 'Tokyo',
          continent: 'Asia',
          continent_code: 'AS',
          country: 'Japan',
          country_code: 'JP',
          ip: '5.6.7.8',
          latitude: 35.6762,
          longitude: 139.6503,
          metro_code: null,
          network: '5.6.7.0/24',
          organization: 'Japan ISP',
          postal: '100-0001',
          region: 'Tokyo',
          region_cn: '东京',
          region_code: 'TK',
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

      const result = await testProxyInfoByIp234(proxyConfig);

      expect(result).toEqual({
        ip: '5.6.7.8',
        country: 'Japan',
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
          asn: 99999,
          city: 'London',
          continent: 'Europe',
          continent_code: 'EU',
          country: 'United Kingdom',
          country_code: 'GB',
          ip: '9.10.11.12',
          latitude: 51.5074,
          longitude: -0.1278,
          metro_code: null,
          network: '9.10.11.0/24',
          organization: 'UK ISP',
          postal: 'EC1A',
          region: 'England',
          region_cn: '英格兰',
          region_code: 'EN',
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

      const result = await testProxyInfoByIp234(proxyUrl);

      expect(result).toEqual({
        ip: '9.10.11.12',
        country: 'United Kingdom',
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

      await expect(testProxyInfoByIp234()).rejects.toThrow('IP234 检测渠道返回结果为空');
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

      await expect(testProxyInfoByIp234()).rejects.toThrow('Network error');
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

      await expect(testProxyInfoByIp234()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('应该正确映射所有字段', async () => {
      const mockResponse = {
        data: {
          asn: 12345,
          city: 'Beijing',
          continent: 'Asia',
          continent_code: 'AS',
          country: 'China',
          country_code: 'CN',
          ip: '192.168.1.1',
          latitude: 39.9042,
          longitude: 116.4074,
          metro_code: null,
          network: '192.168.1.0/24',
          organization: 'China Telecom',
          postal: '100000',
          region: 'Beijing',
          region_cn: '北京',
          region_code: 'BJ',
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

      const result = await testProxyInfoByIp234();

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

    it('应该正确计算请求延迟时间', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockResponse = {
        data: {
          asn: 12345,
          city: 'Test City',
          continent: 'Test Continent',
          continent_code: 'TC',
          country: 'Test Country',
          country_code: 'TC',
          ip: '1.2.3.4',
          latitude: 0,
          longitude: 0,
          metro_code: null,
          network: '1.2.3.0/24',
          organization: 'Test ISP',
          postal: '00000',
          region: 'Test Region',
          region_cn: '测试',
          region_code: 'TR',
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

      const result = await testProxyInfoByIp234();

      expect(result.latency).toBe(500); // 1500 - 1000 = 500ms
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });

    it('应该在延迟响应时正确测量延迟', async () => {
      const mockResponse = {
        data: {
          asn: 12345,
          city: 'Test City',
          continent: 'Test Continent',
          continent_code: 'TC',
          country: 'Test Country',
          country_code: 'TC',
          ip: '1.2.3.4',
          latitude: 0,
          longitude: 0,
          metro_code: null,
          network: '1.2.3.0/24',
          organization: 'Test ISP',
          postal: '00000',
          region: 'Test Region',
          region_cn: '测试',
          region_code: 'TR',
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

      const result = await testProxyInfoByIp234();

      // 延迟应该至少 100ms（考虑到执行时间可能稍长）
      expect(result.latency).toBeGreaterThanOrEqual(100);
      expect(result.latency).toBeLessThan(1000); // 应该不会超过 1 秒
    });

    it('应该在快速响应时返回较小的延迟值', async () => {
      const mockResponse = {
        data: {
          asn: 12345,
          city: 'Test City',
          continent: 'Test Continent',
          continent_code: 'TC',
          country: 'Test Country',
          country_code: 'TC',
          ip: '1.2.3.4',
          latitude: 0,
          longitude: 0,
          metro_code: null,
          network: '1.2.3.0/24',
          organization: 'Test ISP',
          postal: '00000',
          region: 'Test Region',
          region_cn: '测试',
          region_code: 'TR',
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

      const result = await testProxyInfoByIp234();

      // 快速 mock 响应应该有很小的延迟
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.latency).toBeLessThan(100); // 应该很快
    });
  });
});

