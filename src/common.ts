/**
 * 代理测试通道
 */
export enum TestProxyChannel {
  /** IP234 测试通道 */
  IP234 = 'IP234',
  /** IPInfo 测试通道 */
  IPInfo = 'IPInfo',
  /** BigData测试通道 */
  BigData = 'BigData',
}

/**
 * 代理测试结果
 */
export interface TestProxyResult {
  /** 出口IP地址 */
  ip: string;
  /** 国家/地区 */
  country: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 时区 */
  timezone: string;
  /** 延迟（毫秒） */
  latency: number;
  /** 测试通道 */
  channel: TestProxyChannel;
}
