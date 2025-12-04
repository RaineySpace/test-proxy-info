import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByBigData } from '../src/channel/big-data';
import { TestProxyChannel } from '../src/common';

describe('big-data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByBigData', () => {
    const createMockFetcher = (geoData: any, ipData: any, delay = 0) => {
      let callCount = 0;
      return vi.fn().mockImplementation((url: string) =>
        new Promise(resolve =>
          setTimeout(() => {
            callCount++;
            if (url.includes('reverse-geocode-client')) {
              resolve({ json: () => Promise.resolve(geoData) });
            } else if (url.includes('client-ip')) {
              resolve({ json: () => Promise.resolve(ipData) });
            }
          }, delay)
        )
      );
    };

    it('应该成功获取IP信息', async () => {
      const mockGeoData = {
        latitude: 37.7749,
        lookupSource: 'ip geolocation',
        longitude: -122.4194,
        localityLanguageRequested: 'en',
        continent: 'North America',
        continentCode: 'NA',
        countryName: 'United States',
        countryCode: 'US',
        principalSubdivision: 'California',
        principalSubdivisionCode: 'CA',
        city: 'San Francisco',
        locality: 'San Francisco',
        postcode: '94102',
        plusCode: '849V',
      };
      const mockIpData = { ipString: '1.2.3.4' };

      const mockFetcher = createMockFetcher(mockGeoData, mockIpData);

      const result = await testProxyInfoByBigData(mockFetcher);

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: 'United States',
        province: 'California',
        city: 'San Francisco',
        timezone: '',
        latency: expect.any(Number),
        channel: TestProxyChannel.BigData,
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockFetcher).toHaveBeenCalledWith('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
      expect(mockFetcher).toHaveBeenCalledWith('https://api.bigdatacloud.net/data/client-ip');
    });

    it('应该在API返回空数据时抛出错误', async () => {
      const mockFetcher = createMockFetcher(null, { ipString: null });

      await expect(testProxyInfoByBigData(mockFetcher)).rejects.toThrow('BigData 检测渠道异常');
    });

    it('应该在ipString为空时抛出错误', async () => {
      const mockGeoData = {
        countryName: 'United States',
        principalSubdivision: 'California',
        city: 'San Francisco',
        localityLanguageRequested: 'en',
      };
      const mockFetcher = createMockFetcher(mockGeoData, { ipString: '' });

      await expect(testProxyInfoByBigData(mockFetcher)).rejects.toThrow('BigData 检测渠道异常');
    });

    it('应该处理网络错误', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(testProxyInfoByBigData(mockFetcher)).rejects.toThrow('Network error');
    });

    it('应该正确映射所有字段', async () => {
      const mockGeoData = {
        latitude: 39.9042,
        lookupSource: 'ip geolocation',
        longitude: 116.4074,
        localityLanguageRequested: 'en',
        continent: 'Asia',
        continentCode: 'AS',
        countryName: 'China',
        countryCode: 'CN',
        principalSubdivision: 'Beijing',
        principalSubdivisionCode: 'BJ',
        city: 'Beijing',
        locality: 'Beijing',
        postcode: '100000',
        plusCode: '8PFW',
      };
      const mockIpData = { ipString: '192.168.1.1' };

      const mockFetcher = createMockFetcher(mockGeoData, mockIpData);

      const result = await testProxyInfoByBigData(mockFetcher);

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
      expect(result.channel).toBe(TestProxyChannel.BigData);
    });

    it('应该正确计算延迟', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockGeoData = {
        countryName: 'Test Country',
        principalSubdivision: 'Test Region',
        city: 'Test City',
        localityLanguageRequested: 'en',
      };
      const mockIpData = { ipString: '1.2.3.4' };

      const mockFetcher = createMockFetcher(mockGeoData, mockIpData);

      const result = await testProxyInfoByBigData(mockFetcher);

      expect(result.latency).toBe(500);
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });

    it('应该在延迟响应时正确测量延迟', async () => {
      const mockGeoData = {
        countryName: 'Test Country',
        principalSubdivision: 'Test Region',
        city: 'Test City',
        localityLanguageRequested: 'en',
      };
      const mockIpData = { ipString: '1.2.3.4' };

      const mockFetcher = createMockFetcher(mockGeoData, mockIpData, 100);

      const result = await testProxyInfoByBigData(mockFetcher);

      expect(result.latency).toBeGreaterThanOrEqual(100);
      expect(result.latency).toBeLessThan(1000);
    });

    it('应该在快速响应时返回较小的延迟值', async () => {
      const mockGeoData = {
        countryName: 'Test Country',
        principalSubdivision: 'Test Region',
        city: 'Test City',
        localityLanguageRequested: 'en',
      };
      const mockIpData = { ipString: '1.2.3.4' };

      const mockFetcher = createMockFetcher(mockGeoData, mockIpData);

      const result = await testProxyInfoByBigData(mockFetcher);

      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.latency).toBeLessThan(100);
    });

    it('应该返回正确的通道标识', async () => {
      const mockGeoData = {
        countryName: 'United States',
        principalSubdivision: 'California',
        city: 'San Francisco',
        localityLanguageRequested: 'en',
      };
      const mockIpData = { ipString: '1.2.3.4' };

      const mockFetcher = createMockFetcher(mockGeoData, mockIpData);

      const result = await testProxyInfoByBigData(mockFetcher);

      expect(result.channel).toBe(TestProxyChannel.BigData);
    });
  });
});
