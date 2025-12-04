import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByIPCC } from '../src/channel/ip-cc';
import { TestProxyChannel } from '../src/common';

describe('ip-cc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByIPCC', () => {
    const createMockFetcher = (data: any, delay = 0) => {
      return vi.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            json: () => Promise.resolve(data),
          }), delay)
        )
      );
    };

    it('应该成功获取IP信息', async () => {
      const mockData = {
        code: 200,
        msg: 'success',
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country_code: 'US',
            country: 'United States',
            region: 'California',
            city: 'San Francisco',
            longitude: -122.4194,
            latitude: 37.7749,
            timezone: 'America/Los_Angeles',
            postal: '94102',
            organization: 'Example ISP',
          },
          asn: {
            asn: 'AS12345',
            name: 'Example ISP',
            domain: 'example.com',
            route: '1.2.3.0/24',
            type: 'isp',
          },
        },
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIPCC(mockFetcher);

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: 'United States',
        province: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latency: expect.any(Number),
        channel: TestProxyChannel.IPCC,
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockFetcher).toHaveBeenCalledWith('https://ip.cc/webapi/product/api-ip-address?language=zh');
    });

    it('应该在API返回错误码时抛出错误', async () => {
      const mockData = {
        code: 500,
        msg: 'Internal Server Error',
        data: null,
      };

      const mockFetcher = createMockFetcher(mockData);

      await expect(testProxyInfoByIPCC(mockFetcher)).rejects.toThrow('IPCC 检测渠道异常: Internal Server Error');
    });

    it('应该在API返回空数据时抛出错误', async () => {
      const mockData = {
        code: 200,
        msg: 'success',
        data: null,
      };

      const mockFetcher = createMockFetcher(mockData);

      await expect(testProxyInfoByIPCC(mockFetcher)).rejects.toThrow('IPCC 检测渠道异常');
    });

    it('应该处理网络错误', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(testProxyInfoByIPCC(mockFetcher)).rejects.toThrow('Network error');
    });

    it('应该正确映射所有字段', async () => {
      const mockData = {
        code: 200,
        msg: 'success',
        data: {
          geolocation: {
            ip: '192.168.1.1',
            country_code: 'CN',
            country: 'China',
            region: 'Beijing',
            city: 'Beijing',
            longitude: 116.4074,
            latitude: 39.9042,
            timezone: 'Asia/Shanghai',
            postal: '100000',
            organization: 'China Telecom',
          },
          asn: {
            asn: 'AS4134',
            name: 'China Telecom',
            domain: 'chinatelecom.com.cn',
            route: '192.168.0.0/16',
            type: 'isp',
          },
        },
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIPCC(mockFetcher);

      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('province');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('latency');
      expect(result).toHaveProperty('channel');

      expect(typeof result.ip).toBe('string');
      expect(typeof result.country).toBe('string');
      expect(typeof result.province).toBe('string');
      expect(typeof result.city).toBe('string');
      expect(typeof result.timezone).toBe('string');
      expect(typeof result.latency).toBe('number');
      expect(result.channel).toBe(TestProxyChannel.IPCC);
    });

    it('应该正确计算延迟', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockData = {
        code: 200,
        msg: 'success',
        data: {
          geolocation: {
            ip: '1.2.3.4',
            country_code: 'US',
            country: 'Test Country',
            region: 'Test Region',
            city: 'Test City',
            longitude: 0,
            latitude: 0,
            timezone: 'UTC',
            postal: '00000',
            organization: 'Test ISP',
          },
          asn: {
            asn: 'AS12345',
            name: 'Test ISP',
            domain: 'test.com',
            route: '1.2.3.0/24',
            type: 'isp',
          },
        },
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIPCC(mockFetcher);

      expect(result.latency).toBe(500);
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });
  });
});
