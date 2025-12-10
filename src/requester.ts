import { ProxyAgent, fetch as undiciFetch, Dispatcher } from 'undici';
import { socksDispatcher } from 'fetch-socks';
import { ProxyConfig, Fetcher } from './common';

/**
 * 获取代理URL
 * @param proxy 代理配置或代理URL
 * @returns 代理URL
 */
export function compositeProxy(proxy: ProxyConfig | string): string {
  if (typeof proxy === 'string') return proxy;
  let url = `${proxy.protocol}://`;
  
  // 添加认证信息
  if (proxy.username && proxy.password) {
    url += `${proxy.username}:${proxy.password}@`;
  }
  
  // 添加主机和端口
  url += proxy.host;
  if (proxy.port) {
    url += `:${proxy.port}`;
  }

  return url;
}

/**
 * 解析代理配置
 * @param proxy 代理配置或代理URL
 * @returns 代理配置
 */
export const DEFAULT_PORTS: Record<ProxyConfig['protocol'], number> = {
  http: 80,
  https: 443,
  socks5: 1080,
};

export function parseProxyConfig(proxy: ProxyConfig | string): ProxyConfig {
  if (typeof proxy === 'object') return proxy;
  const url = new URL(proxy);
  const protocol = url.protocol.replace(':', '');
  if (!['http', 'https', 'socks5'].includes(protocol)) {
    throw new Error('Invalid Proxy URL protocol: the URL must start with http:, https: or socks5:.');
  }
  return {
    protocol: protocol as ProxyConfig['protocol'],
    host: url.hostname,
    port: url.port ? parseInt(url.port) : undefined,
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
  };
}

export function getProxyPort(proxyConfig: ProxyConfig): number {
  return proxyConfig.port || DEFAULT_PORTS[proxyConfig.protocol];
}

function createDispatcher(proxy: ProxyConfig | string): Dispatcher {
  const proxyConfig = parseProxyConfig(proxy);
  if (proxyConfig.protocol === 'http' || proxyConfig.protocol === 'https') {
    return new ProxyAgent({ uri: compositeProxy(proxy) });
  }
  return socksDispatcher({
    type: 5,
    host: proxyConfig.host,
    port: getProxyPort(proxyConfig),
    userId: proxyConfig.username,
    password: proxyConfig.password,
  });
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
const DEFAULT_TIMEOUT = 30000;

export function createProxyFetch(proxyConfig?: CreateProxyFetchOptions): Fetcher {
  return async (input, init) => {
    return await undiciFetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT),
      dispatcher: proxyConfig ? createDispatcher(proxyConfig) : undefined,
    });
  };
}
