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
  /** IPCC 测试通道 */
  IPCC = 'IPCC',
  /** IP9 测试通道 */
  IP9 = 'IP9',
}

/**
 * 自定义请求器
 */
export type Fetcher = (input: string | Request, init?: RequestInit) => Promise<Response>;

/**
 * 代理配置
 */
export interface ProxyConfig {
  /** 协议 */
  protocol: 'http' | 'https' | 'socks5';
  /** 主机 */
  host: string;
  /** 端口 */
  port?: number;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
}

/**
 * 单通道代理测试选项
 */
export interface SimpleTestProxyOptions {
  /** 请求器 */
  fetcher?: Fetcher;
  /** 代理配置 */
  proxy?: ProxyConfig | string;
  /** 延迟测试 URL */
  latencyTestUrl?: string;
  /** 代理测试超时时间 */
  timeout?: number;
  /** 语言 */
  language?: 'zh-hans' | 'en-us';
}

/**
 * 测试选项
 */
export interface TestProxyOptions extends SimpleTestProxyOptions {
  /** 测试通道 */
  channel?: TestProxyChannel | TestProxyChannel[];
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
  /** 时区（部分渠道可能不提供） */
  timezone?: string;
  /** 延迟（毫秒） */
  latency: number;
  /** 测试通道 */
  channel: TestProxyChannel;
}
