import { TestProxyResult, TestProxyError, TestProxyErrorCode } from './common';
import { createRequester, CreateRequesterOptions } from './requester';

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
export async function testProxyInfoByIpInfo(createRequesterOptions?: CreateRequesterOptions): Promise<TestProxyResult> {
  const requester = createRequester(createRequesterOptions);
  const startTime = Date.now();
  const data = await requester.get<IpInfoResult>('https://ipinfo.io/json');
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