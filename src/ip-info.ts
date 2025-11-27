import { TestProxyResult, createAxiosInstance, ProxyConfig, TestProxyError, TestProxyErrorCode } from './common';

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
 * @param proxyConfig 代理配置或代理URL
 * @returns 代理测试结果
 */
export async function testProxyInfoByIpInfo(proxyConfig?: ProxyConfig | string): Promise<TestProxyResult> {
  const axios = createAxiosInstance(proxyConfig);
  const startTime = Date.now();
  const { data } = await axios.get<IpInfoResult>('https://ipinfo.io/json');
  const latency = Date.now() - startTime;
  if (!data) throw new TestProxyError('IPInfo 检测渠道返回结果为空', TestProxyErrorCode.DETECTION_CHANNEL_ERROR);
  return {
    ip: data.ip,
    country: data.country,
    province: data.region,
    city: data.city,
    timezone: data.timezone,
    latency,
  }
}

export default testProxyInfoByIpInfo;