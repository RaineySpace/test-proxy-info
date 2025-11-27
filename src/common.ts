import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

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

/**
 * 创建Axios实例
 * @param proxyConfig 代理配置或代理URL
 * @returns Axios实例
 */
export function createAxiosInstance(proxyConfig?: ProxyConfig | string): AxiosInstance {
  let instance: AxiosInstance;
  const proxyUrl = proxyConfig ? getProxyUrl(proxyConfig) : null;
  if (proxyUrl) {
    // 根据协议类型选择合适的 Agent
    const agent = proxyUrl.startsWith('socks5') ? new SocksProxyAgent(proxyUrl) : new HttpsProxyAgent(proxyUrl);

    instance = axios.create({ httpAgent: agent, httpsAgent: agent, timeout: 30000 });
  } else {
    instance = axios.create({ timeout: 30000 });
  }

  instance.interceptors.response.use(response => response, error => {
    const errorMessage = error.message || '未知错误';
    // 1. 代理服务器异常 - 代理相关的连接错误
    const isProxyError =
      !!proxyConfig &&
      ((proxyUrl && errorMessage.includes(proxyUrl)) ||
        errorMessage.includes("Proxy") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("407") || // Proxy Authentication Required
        error.code === "ECONNREFUSED" ||
        error.code === "ECONNRESET");
    if (isProxyError) {
      throw new TestProxyError(
        `代理服务器连接失败: ${errorMessage}`,
        TestProxyErrorCode.PROXY_SERVER_ERROR
      );
    }

    // 2. 检测渠道异常 - HTTP 状态码相关错误
    if (error.response) {
      const status = error.response.status;
      // 检测服务返回了错误状态码(如 403, 500, 502, 503 等)
      if (status >= 400) {
        throw new TestProxyError(
          `检测渠道返回错误状态码: ${status}`,
          TestProxyErrorCode.DETECTION_CHANNEL_ERROR
        );
      }
    }
  
    // 3. 网络异常 - 一般性网络问题
    const isNetworkError =
      error.code === "ETIMEDOUT" ||
      error.code === "ENOTFOUND" ||
      error.code === "ENETUNREACH" ||
      error.code === "EAI_AGAIN" ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("network");
    if (isNetworkError) {
      throw new TestProxyError(
        `网络连接失败: ${errorMessage}`,
        TestProxyErrorCode.NETWORK_ERROR
      );
    }
  
    // 4. 程序性异常 - 其他未知错误
    throw new TestProxyError(errorMessage);
  });
  return instance;
}