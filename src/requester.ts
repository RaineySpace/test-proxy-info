import { ProxyAgent, fetch as undiciFetch, Dispatcher } from 'undici';

/**
 * 自定义请求器
 */
export type Fetcher = (input: string | Request, init?: RequestInit) => Promise<Response>;

/**
 * 代理配置
 */
export interface ProxyConfig {
  /** 协议 */
  protocol: 'http' | 'https';
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
 * Check if the value is a valid http or https prefixed string.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isHttpOrHttpsPrefixed (value: string): boolean {
  return (
    value != null &&
    value[0] === 'h' &&
    value[1] === 't' &&
    value[2] === 't' &&
    value[3] === 'p' &&
    (
      value[4] === ':' ||
      (
        value[4] === 's' &&
        value[5] === ':'
      )
    )
  )
}

/**
 * 获取代理URL
 * @param proxyConfig 代理配置或代理URL
 * @returns 代理URL
 */
function compositeProxy(proxyConfig: ProxyConfig): string {
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

function createDispatcher(proxyConfig: ProxyConfig | string): Dispatcher {
  let proxyUri: string;
  if (typeof proxyConfig === 'string') {
    proxyUri = proxyConfig;
  } else {
    proxyUri = compositeProxy(proxyConfig);
  }
  if (!isHttpOrHttpsPrefixed(proxyUri)) {
    throw new Error(`Invalid Proxy URL protocol: the URL must start with http: or https:.`);
  }
  return new ProxyAgent({ uri: proxyUri });
}

/**
 * 创建请求器选项
 */
export type CreateProxyFetchOptions = ProxyConfig | string;

/**
 * 创建代理请求器
 * @param proxyConfig 代理配置或代理请求器
 * @returns 代理请求器
 */
const DEFAULT_TIMEOUT = 3000;

export function createProxyFetch(proxyConfig?: CreateProxyFetchOptions): Fetcher {
  return async (input, init) => {
    return await undiciFetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT),
      dispatcher: proxyConfig ? createDispatcher(proxyConfig) : undefined,
    });
  };
}
