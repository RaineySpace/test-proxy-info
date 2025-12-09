import { TestProxyResult, TestProxyChannel, TestProxyOptions } from './common';
import { createProxyFetch } from './requester';
import { testProxyInfoByIp234, testProxyInfoByIpInfo, testProxyInfoByBigData, testProxyInfoByIPCC, testProxyInfoByIP9 } from './channel';

/**
 * 代理测试
 * @param options 测试选项
 * @returns 代理测试结果
 */
export async function testProxyInfo(options?: TestProxyOptions): Promise<TestProxyResult> {
  const { fetcher, proxy, channel = Object.values(TestProxyChannel) } = options ?? {};

  /** 如果测试通道为数组，则并发测试所有通道，返回第一个成功的结果 */
  if (Array.isArray(channel)) {
    /** 如果测试通道为空，则抛出错误 */
    if (channel.length === 0) {
      throw new Error('至少需要提供一个测试通道');
    }
    /** 多个通道的请求，可以共用一个请求器 */
    const customFetch = typeof fetcher === 'function' ? fetcher : createProxyFetch(proxy);
    /** 并发测试所有通道，返回第一个成功的结果 */
    return await Promise.any(channel.map(c => testProxyInfo({ fetcher: customFetch, channel: c }))).catch(err => {
      throw new AggregateError(err.errors, `所有通道测试失败: ${err.errors[0].message}`);
    });
  }

  /** 根据测试通道执行测试 */
  switch (channel) {
    /** 测试 IP234 通道 */
    case TestProxyChannel.IP234:
      return await testProxyInfoByIp234(options);
    /** 测试 IPInfo 通道 */
    case TestProxyChannel.IPInfo:
      return await testProxyInfoByIpInfo(options);
    /** 测试 BigData 通道 */
    case TestProxyChannel.BigData:
      return await testProxyInfoByBigData(options);
    /** 测试 IPCC 通道 */
    case TestProxyChannel.IPCC:
      return await testProxyInfoByIPCC(options);
    /** 测试 IP9 通道 */
    case TestProxyChannel.IP9:
      return await testProxyInfoByIP9(options);
    default:
      throw new Error(`不支持的通道: ${options?.channel}`);
  }
}

export * from './common';
export default testProxyInfo;
