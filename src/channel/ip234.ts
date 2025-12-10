import { TestProxyResult, TestProxyChannel, SimpleTestProxyOptions } from '../common';
import { createProxyFetch } from '../requester';

/**
 * IP234结果
 */
interface Ip234Result {
  /** 自治系统号码 */
  asn: number;
  /** 城市名称 */
  city: string;
  /** 大洲名称 */
  continent: string;
  /** 大洲代码 */
  continent_code: string;
  /** 国家名称 */
  country: string;
  /** 国家代码 */
  country_code: string;
  /** IP 地址 */
  ip: string;
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 地铁代码（可能为空） */
  metro_code: number | null;
  /** 网络段 */
  network: string;
  /** 组织名称 */
  organization: string;
  /** 邮政编码 */
  postal: string;
  /** 地区名称 */
  region: string;
  /** 地区中文名称 */
  region_cn: string;
  /** 地区代码 */
  region_code: string;
  /** 时区 */
  timezone: string;
}

/**
 * 测试代理通过IP234
 * @param createRequesterOptions 创建请求器选项
 * @returns 代理测试结果
 */
export async function testProxyInfoByIp234(options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
  if (options?.language === 'en-us') throw new Error('IP234 检测渠道不支持英文');
  const customFetch = typeof options?.fetcher === 'function' ? options?.fetcher : createProxyFetch(options?.proxy);
  const startTime = Date.now();
  const data = await customFetch('https://ip234.in/ip.json').then(res => res.json() as Promise<Ip234Result>);
  const latency = Date.now() - startTime;
  if (!data) throw new Error('IP234 检测渠道异常');
  return {
    ip: data.ip,
    country: data.country,
    province: data.region,
    city: data.city,
    timezone: data.timezone,
    latency,
    channel: TestProxyChannel.IP234,
  }
}

export default testProxyInfoByIp234;