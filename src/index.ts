import { TestProxyResult, TestProxyChannel, TestProxyOptions, SimpleTestProxyOptions } from './common';
import { createProxyFetch } from './requester';
import { testProxyInfoByIp234, testProxyInfoByIpInfo, testProxyInfoByBigData, testProxyInfoByIPCC, testProxyInfoByIP9 } from './channel';

async function executeByChannel(channel: TestProxyChannel, options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
  switch (channel) {
    case TestProxyChannel.IP234:
      return await testProxyInfoByIp234(options);
    case TestProxyChannel.IPInfo:
      return await testProxyInfoByIpInfo(options);
    case TestProxyChannel.BigData:
      return await testProxyInfoByBigData(options);
    case TestProxyChannel.IPCC:
      return await testProxyInfoByIPCC(options);
    case TestProxyChannel.IP9:
      return await testProxyInfoByIP9(options);
    default:
      throw new Error(`不支持的通道: ${channel}`);
  }
}

/**
 * 代理测试
 * @param options 测试选项
 * @returns 代理测试结果
 */
export async function testProxyInfo(options?: TestProxyOptions): Promise<TestProxyResult> {
  const { fetcher, proxy, channel = Object.values(TestProxyChannel) } = options ?? {};

  if (Array.isArray(channel)) {
    if (channel.length === 0) throw new Error('至少需要提供一个测试通道');
    const customFetch = typeof fetcher === 'function' ? fetcher : createProxyFetch(proxy);
    return await Promise.any(channel.map(c => executeByChannel(c, { fetcher: customFetch, proxy }))).catch(err => {
      throw new AggregateError(err.errors, `所有通道测试失败: ${err.errors[0].message}`);
    });
  }

  return await executeByChannel(channel, { fetcher, proxy });
}

export * from './common';
export default testProxyInfo;
