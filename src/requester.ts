import { ProxyConfig, getProxyUrl } from './common';
import axios, { AxiosInstance } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { TestProxyError, TestProxyErrorCode } from './common';

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

/**
 * 请求器
 */
export interface Requester {
  get: <T = any>(url: string) => Promise<T>;
  post: <T = any, D = any>(url: string, data: D) => Promise<T>;
}

/**
 * 创建请求器选项
 */
export type CreateRequesterOptions = ProxyConfig | string | Requester;

/**
 * 创建请求器
 * @param proxyConfig 代理配置或代理URL
 * @returns 请求器
 */
export function createRequester(proxyConfig?: CreateRequesterOptions): Requester {
  if (proxyConfig && typeof proxyConfig === 'object' && 'get' in proxyConfig && 'post' in proxyConfig) {
    return proxyConfig;
  }
  const axiosInstance = createAxiosInstance(proxyConfig);
  return {
    get: async (url) => {
      const { data } = await axiosInstance.get(url);
      return data;
    },
    post: async (url, data) => {
      const { data: responseData } = await axiosInstance.post(url, data);
      return responseData;
    },
  }
}
