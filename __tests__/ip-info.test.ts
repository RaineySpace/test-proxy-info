import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByIpInfo } from '../src/channel/ip-info';

describe('ip-info', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByIpInfo', () => {
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
        ip: '1.2.3.4',
        city: 'San Francisco',
        region: 'California',
        country: 'US',
        loc: '37.7749,-122.4194',
        org: 'AS12345 Example ISP',
        postal: '94102',
        timezone: 'America/Los_Angeles',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: 'US',
        province: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latency: expect.any(Number),
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockFetcher).toHaveBeenCalledWith('https://ipinfo.io/json');
    });

    it('应该在API返回空数据时抛出错误', async () => {
      const mockFetcher = createMockFetcher(null);

      await expect(testProxyInfoByIpInfo(mockFetcher)).rejects.toThrow('IPInfo 检测渠道返回结果为空');
    });

    it('应该处理网络错误', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(testProxyInfoByIpInfo(mockFetcher)).rejects.toThrow('Network error');
    });

    it('应该正确映射所有字段', async () => {
      const mockData = {
        ip: '192.168.1.1',
        city: 'Beijing',
        region: 'Beijing',
        country: 'CN',
        loc: '39.9042,116.4074',
        org: 'AS12345 China Telecom',
        postal: '100000',
        timezone: 'Asia/Shanghai',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('province');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('latency');

      expect(typeof result.ip).toBe('string');
      expect(typeof result.country).toBe('string');
      expect(typeof result.province).toBe('string');
      expect(typeof result.city).toBe('string');
      expect(typeof result.timezone).toBe('string');
      expect(typeof result.latency).toBe('number');
    });

    it('应该处理缺少部分字段的响应', async () => {
      const mockData = {
        ip: '192.168.1.1',
        city: 'Unknown',
        region: '',
        country: 'CN',
        loc: '39.9042,116.4074',
        org: 'AS12345 China Telecom',
        postal: '',
        timezone: 'Asia/Shanghai',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result).toEqual({
        ip: '192.168.1.1',
        country: 'CN',
        province: '',
        city: 'Unknown',
        timezone: 'Asia/Shanghai',
        latency: expect.any(Number),
      });
    });

    it('应该处理IPv6地址', async () => {
      const mockData = {
        ip: '2001:db8::1',
        city: 'New York',
        region: 'New York',
        country: 'US',
        loc: '40.7128,-74.0060',
        org: 'AS12345 Example ISP',
        postal: '10001',
        timezone: 'America/New_York',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result).toEqual({
        ip: '2001:db8::1',
        country: 'US',
        province: 'New York',
        city: 'New York',
        timezone: 'America/New_York',
        latency: expect.any(Number),
      });
    });

    it('应该处理不同的国家代码格式', async () => {
      const mockData = {
        ip: '203.0.113.1',
        city: 'Sydney',
        region: 'New South Wales',
        country: 'AU',
        loc: '-33.8688,151.2093',
        org: 'AS12345 Australia ISP',
        postal: '2000',
        timezone: 'Australia/Sydney',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result.country).toBe('AU');
      expect(result.ip).toBe('203.0.113.1');
    });

    it('应该正确计算延迟', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockData = {
        ip: '1.2.3.4',
        city: 'Test City',
        region: 'Test Region',
        country: 'US',
        loc: '0,0',
        org: 'Test ISP',
        postal: '00000',
        timezone: 'UTC',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result.latency).toBe(500);
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });

    it('应该在延迟响应时正确测量延迟', async () => {
      const mockData = {
        ip: '1.2.3.4',
        city: 'Test City',
        region: 'Test Region',
        country: 'US',
        loc: '0,0',
        org: 'Test ISP',
        postal: '00000',
        timezone: 'UTC',
      };

      const mockFetcher = createMockFetcher(mockData, 100);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result.latency).toBeGreaterThanOrEqual(100);
      expect(result.latency).toBeLessThan(1000);
    });

    it('应该在快速响应时返回较小的延迟值', async () => {
      const mockData = {
        ip: '1.2.3.4',
        city: 'Test City',
        region: 'Test Region',
        country: 'US',
        loc: '0,0',
        org: 'Test ISP',
        postal: '00000',
        timezone: 'UTC',
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIpInfo(mockFetcher);

      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.latency).toBeLessThan(100);
    });
  });
});
