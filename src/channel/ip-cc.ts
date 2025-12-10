import { TestProxyResult, TestProxyChannel, SimpleTestProxyOptions } from '../common';
import { createProxyFetch, createURLWithSearchParams } from '../requester';

/**
 * IPCC结果
 */
interface IPCCResult {
  /** 地理位置 */
  geolocation: {
    ip: string;
    country_code: string;
    country: string;
    region: string;
    city: string;
    longitude: number;
    latitude: number;
    timezone: string;
    postal: string;
    organization: string;
  },
  /** ASN */
  asn: {
    asn: string;
    name: string;
    domain: string;
    route: string;
    type: string;
  }
}

interface IPCCResponse {
  code: number;
  data: IPCCResult;
  msg: string;
}

/**
 * 测试代理通过BigData
 * @param createRequesterOptions 创建请求器选项
 * @returns 代理测试结果
 */
export async function testProxyInfoByIPCC(options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
  const customFetch = typeof options?.fetcher === 'function' ? options?.fetcher : createProxyFetch(options?.proxy);
  const startTime = Date.now();
  const language = options?.language === 'en-us' ? 'en' : 'zh';
  const { data, code, msg } = await customFetch(createURLWithSearchParams('https://ip.cc/webapi/product/api-ip-address', { language })).then(res => res.json() as Promise<IPCCResponse>)
  const latency = Date.now() - startTime;
  if (code !== 200) throw new Error(`IPCC 检测渠道异常: ${msg}`);
  if (!data) throw new Error('IPCC 检测渠道异常');
  return {
    ip: data.geolocation.ip,
    country: data.geolocation.country,
    province: data.geolocation.region,
    city: data.geolocation.city,
    timezone: data.geolocation.timezone,
    latency,
    channel: TestProxyChannel.IPCC,
  }
}

export default testProxyInfoByIPCC;