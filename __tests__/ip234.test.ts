import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByIp234 } from '../src/channel/ip234';
import { TestProxyChannel } from '../src/common';

describe('ip234', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByIp234', () => {
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
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIp234(mockFetcher);

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: 'United States',
        province: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latency: expect.any(Number),
        channel: TestProxyChannel.IP234,
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockFetcher).toHaveBeenCalledWith('https://ip234.in/ip.json');
    });

    it('应该在API返回空数据时抛出错误', async () => {
      const mockFetcher = createMockFetcher(null);

      await expect(testProxyInfoByIp234(mockFetcher)).rejects.toThrow('IP234 检测渠道异常');
    });

    it('应该处理网络错误', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(testProxyInfoByIp234(mockFetcher)).rejects.toThrow('Network error');
    });

    it('应该正确映射所有字段', async () => {
      const mockData = {
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
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIp234(mockFetcher);

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
      expect(result.channel).toBe(TestProxyChannel.IP234);
    });

    it('应该正确计算延迟', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockData = {
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
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIp234(mockFetcher);

      expect(result.latency).toBe(500);
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });

    it('应该在延迟响应时正确测量延迟', async () => {
      const mockData = {
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
      };

      const mockFetcher = createMockFetcher(mockData, 100);

      const result = await testProxyInfoByIp234(mockFetcher);

      expect(result.latency).toBeGreaterThanOrEqual(100);
      expect(result.latency).toBeLessThan(1000);
    });

    it('应该在快速响应时返回较小的延迟值', async () => {
      const mockData = {
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
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIp234(mockFetcher);

      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.latency).toBeLessThan(100);
    });
  });
});
