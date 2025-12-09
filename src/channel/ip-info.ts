import { TestProxyResult, TestProxyChannel, SimpleTestProxyOptions } from '../common';
import { createProxyFetch } from '../requester';

/**
 * IPInfo结果
 */
interface IpInfoResult {
  /** IP 地址 */
  ip: string;
  /** 城市 */
  city: string;
  /** 地区 */
  region: string;
  /** 国家 */
  country: string;
  /** 经纬度 */
  loc: string;
  /** 组织 */
  org: string;
  /** 邮政编码 */
  postal: string;
  /** 时区 */
  timezone: string;
}

/**
 * 测试代理通过IPInfo
 * @param createRequesterOptions 创建请求器选项
 * @returns 代理测试结果
 */
export async function testProxyInfoByIpInfo(options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
  const customFetch = typeof options?.fetcher === 'function' ? options?.fetcher : createProxyFetch(options?.proxy);
  const startTime = Date.now();
  const data = await customFetch('https://ipinfo.io/json').then(res => res.json() as Promise<IpInfoResult>);
  const latency = Date.now() - startTime;
  if (!data) throw new Error('IPInfo 检测渠道异常');
  return {
    ip: data.ip,
    country: data.country,
    province: data.region,
    city: data.city,
    timezone: data.timezone,
    latency,
    channel: TestProxyChannel.IPInfo,
  }
}

export default testProxyInfoByIpInfo;