import { TestProxyResult, TestProxyChannel, SimpleTestProxyOptions } from '../common';
import { createProxyFetch } from '../requester';

/**
 * BigData结果
 */
interface BigDataResult {
  /** 纬度 */
  latitude: number;
  /** 查找来源 */
  lookupSource: string;
  /** 经度 */
  longitude: number;
  /** 大陆 */
  continent: string;
  /** 大陆代码 */
  continentCode: string;
  /** 国家名称 */
  countryName: string;
  /** 国家代码 */
  countryCode: string;
  /** 省份 */
  principalSubdivision: string;
  /** 省份代码 */
  principalSubdivisionCode: string;
  /** 城市 */
  city: string;
  /** 本地 */
  locality: string;
  /** 邮政编码 */
  postcode: string;
  /** 加号代码 */
  plusCode: string;
}

/**
 * 测试代理通过BigData
 * @param createRequesterOptions 创建请求器选项
 * @returns 代理测试结果
 */
export async function testProxyInfoByBigData(options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
  const customFetch = typeof options?.fetcher === 'function' ? options?.fetcher : createProxyFetch(options?.proxy);
  const startTime = Date.now();
  const [data, { ipString }] = await Promise.all([
    customFetch("https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh-hans").then(res => res.json() as Promise<BigDataResult>),
    customFetch("https://api.bigdatacloud.net/data/client-ip").then(res => res.json() as Promise<{ ipString: string }>),
  ]);
  const latency = Date.now() - startTime;
  if (!data || !ipString) throw new Error('BigData 检测渠道异常');
  return {
    ip: ipString,
    country: data.countryName,
    province: data.principalSubdivision,
    city: data.city,
    timezone: undefined, // BigDataCloud 不提供时区信息
    latency,
    channel: TestProxyChannel.BigData,
  }
}

export default testProxyInfoByBigData;