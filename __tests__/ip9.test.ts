import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testProxyInfoByIP9 } from '../src/channel/ip9';
import { TestProxyChannel } from '../src/common';

describe('ip9', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('testProxyInfoByIP9', () => {
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
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: '中国',
          country_code: 'CN',
          prov: '浙江',
          city: '杭州',
          city_code: '330100',
          city_short_code: 'HZ',
          area: '余杭',
          post_code: '310000',
          area_code: '0571',
          isp: '中国电信',
          lng: '120.29986',
          lat: '30.41829',
          long_ip: 12345678,
          big_area: '华东',
          ip_type: '',
        },
        qt: 0,
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIP9(mockFetcher);

      expect(result).toEqual({
        ip: '1.2.3.4',
        country: '中国',
        province: '浙江',
        city: '杭州',
        timezone: undefined,
        latency: expect.any(Number),
        channel: TestProxyChannel.IP9,
      });
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockFetcher).toHaveBeenCalledWith('https://ip9.com.cn/get');
    });

    it('应该在API返回错误码时抛出错误', async () => {
      const mockData = {
        ret: 500,
        data: null,
        qt: 0,
      };

      const mockFetcher = createMockFetcher(mockData);

      await expect(testProxyInfoByIP9(mockFetcher)).rejects.toThrow('IP9 检测渠道异常: 500');
    });

    it('应该在API返回空数据时抛出错误', async () => {
      const mockData = {
        ret: 200,
        data: null,
        qt: 0,
      };

      const mockFetcher = createMockFetcher(mockData);

      await expect(testProxyInfoByIP9(mockFetcher)).rejects.toThrow('IP9 检测渠道异常');
    });

    it('应该处理网络错误', async () => {
      const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(testProxyInfoByIP9(mockFetcher)).rejects.toThrow('Network error');
    });

    it('应该正确映射所有字段', async () => {
      const mockData = {
        ret: 200,
        data: {
          ip: '192.168.1.1',
          country: '中国',
          country_code: 'CN',
          prov: '北京',
          city: '北京',
          city_code: '110100',
          city_short_code: 'BJ',
          area: '朝阳',
          post_code: '100000',
          area_code: '010',
          isp: '中国联通',
          lng: '116.4074',
          lat: '39.9042',
          long_ip: 87654321,
          big_area: '华北',
          ip_type: '',
        },
        qt: 0,
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIP9(mockFetcher);

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
      expect(result.timezone).toBeUndefined();
      expect(typeof result.latency).toBe('number');
      expect(result.channel).toBe(TestProxyChannel.IP9);
    });

    it('应该正确计算延迟', async () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;
      const dateSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const mockData = {
        ret: 200,
        data: {
          ip: '1.2.3.4',
          country: 'Test Country',
          country_code: 'TC',
          prov: 'Test Province',
          city: 'Test City',
          city_code: '000000',
          city_short_code: 'TC',
          area: 'Test Area',
          post_code: '00000',
          area_code: '000',
          isp: 'Test ISP',
          lng: '0',
          lat: '0',
          long_ip: 0,
          big_area: 'Test',
          ip_type: '',
        },
        qt: 0,
      };

      const mockFetcher = createMockFetcher(mockData);

      const result = await testProxyInfoByIP9(mockFetcher);

      expect(result.latency).toBe(500);
      expect(dateSpy).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });
  });
});
