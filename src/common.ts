export enum TestProxyErrorCode {
  /** 未知异常 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  /** 网络异常 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 代理服务器异常 */
  PROXY_SERVER_ERROR = 'PROXY_SERVER_ERROR',
  /** 检测渠道异常 */
  DETECTION_CHANNEL_ERROR = 'DETECTION_CHANNEL_ERROR',
  /** 多渠道代理测试失败 */
  MULTIPLE_CHANNEL_TEST_FAILED = 'MULTIPLE_CHANNEL_TEST_FAILED',
}

/** 代理测试异常 */
export class TestProxyError extends Error {
  constructor(
    message = '未知异常',
    public readonly code = TestProxyErrorCode.UNKNOWN_ERROR,
    public readonly errors?: Error[]
  ) {
    super(message);
    this.name = 'TestProxyError';
  }
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
}

/**
 * 代理配置
 */
export interface ProxyConfig {
  /** 协议 */
  protocol: 'http' | 'https' | 'socks5' | 'socks5h';
  /** 主机 */
  host: string;
  /** 端口 */
  port?: string | number;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
}

/**
 * 获取代理URL
 * @param proxyConfig 代理配置或代理URL
 * @returns 代理URL
 */
export function getProxyUrl(proxyConfig: ProxyConfig | string): string {
  if (typeof proxyConfig === 'string') return proxyConfig;
  
  let url = `${proxyConfig.protocol}://`;
  
  // 添加认证信息
  if (proxyConfig.username && proxyConfig.password) {
    url += `${proxyConfig.username}:${proxyConfig.password}@`;
  }
  
  // 添加主机和端口
  url += proxyConfig.host;
  if (proxyConfig.port) {
    url += `:${proxyConfig.port}`;
  }
  
  return url;
}
