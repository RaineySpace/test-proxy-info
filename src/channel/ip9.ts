import { TestProxyResult, TestProxyChannel, SimpleTestProxyOptions } from '../common';
import { createProxyFetch } from '../requester';

/**
 * IP9结果
 */
interface IP9Result {
  /** 查询的IP地址 */
  ip: string;
  /** 国家/地区 */
  country: string;
  /** 国家/地区简码 */
  country_code: string;
  /** 省份 */
  prov: string;
  /** 城市 */
  city: string;
  /** 城市简码 */
  city_code: string;
  /** 城市简码 */
  city_short_code: string;
  /** 区县 */
  area: string;
  /** 邮政编码 */
  post_code: string;
  /** 电话区号 */
  area_code: string;
  /** 运营商 */
  isp: string;
  /** 城市中心-经度 */
  lng: string;
  /** 城市中心-纬度 */
  lat: string;
  /** longip */
  long_ip: number;
  /** 国内大区划分 */
  big_area: string;
  /** VIP 字段 */
  ip_type: string;
}

/**
 * IP9响应
 */
interface IP9Response {
  /** 返回码 */
  ret: number;
  /** 数据 */
  data: IP9Result;
  /** 查询时间-秒 */
  qt: number;
}

/**
 * 测试代理通过IP9
 * @param createRequesterOptions 创建请求器选项
 * @returns 代理测试结果
 */
export async function testProxyInfoByIP9(options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
  const customFetch = typeof options?.fetcher === 'function' ? options?.fetcher : createProxyFetch(options?.proxy);
  const startTime = Date.now();
  const { data, ret } = await customFetch('https://ip9.com.cn/get').then(res => res.json() as Promise<IP9Response>)
  const latency = Date.now() - startTime;
  if (ret !== 200) throw new Error(`IP9 检测渠道异常: ${ret}`);
  if (!data) throw new Error('IP9 检测渠道异常');
  return {
    ip: data.ip,
    country: data.country,
    province: data.prov,
    city: data.city,
    timezone: undefined,
    latency,
    channel: TestProxyChannel.IP9,
  }
}

export default testProxyInfoByIP9;