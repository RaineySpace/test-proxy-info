import { TestProxyResult, ProxyConfig, TestProxyError, TestProxyErrorCode } from './common';
import testProxyInfoByIp234 from './ip234';
import testProxyInfoByIpInfo from './ip-info';

/**
 * 代理测试通道
 */
export enum TestProxyChannel {
  IP234 = 'ip234',
  IPInfo = 'ip_info',
}

/**
 * 代理测试
 * @param channel 测试通道或测试通道数组，如果是数组，则返回第一个测试成功的结果
 * @param proxyConfig 代理配置或代理URL
 * @returns 代理测试结果
 */
export async function testProxyInfo(
  proxyConfig?: ProxyConfig | string,
  channel: TestProxyChannel | TestProxyChannel[] = Object.values(TestProxyChannel)
): Promise<TestProxyResult> {
  try {
    if (Array.isArray(channel)) {
      if (channel.length === 0) {
        throw new TestProxyError('至少需要提供一个测试通道');
      }
      try {
        return await Promise.any(channel.map(c => testProxyInfo(proxyConfig, c)));
      } catch (e) {
        if (e instanceof AggregateError) {
          throw new TestProxyError(
            '多渠道代理测试失败',
            TestProxyErrorCode.MULTIPLE_CHANNEL_TEST_FAILED,
            e.errors as Error[]
          );
        }
        throw e;
      }
    }
    switch (channel) {
      case TestProxyChannel.IP234:
        return await testProxyInfoByIp234(proxyConfig);
      case TestProxyChannel.IPInfo:
        return await testProxyInfoByIpInfo(proxyConfig);
      default:
        throw new TestProxyError(`不支持的通道: ${channel}`);
    }
  } catch (error: unknown) {
    if (error instanceof TestProxyError) {
      throw error;
    } 
    throw new TestProxyError((error as Error).message);
  }
}

export * from './ip234';
export * from './ip-info';
export * from './common';
export default testProxyInfo;
