import { TestProxyResult, TestProxyChannel, TestProxyOptions, SimpleTestProxyOptions } from './common';
import { testProxyInfoByIp234, testProxyInfoByIpInfo, testProxyInfoByBigData, testProxyInfoByIPCC, testProxyInfoByIP9 } from './channel';

/**
 * 执行测试通道
 * @internal
 * @param channel 测试通道
 * @param options 测试选项
 * @returns 测试结果
 */
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
export async function testProxyInfo({ channel = Object.values(TestProxyChannel), ...options }: TestProxyOptions = {}): Promise<TestProxyResult> {
  // 如果测试通道是数组，则并发测试所有通道
  if (Array.isArray(channel)) {
    if (channel.length === 0) throw new Error('至少需要提供一个测试通道');
    return await Promise.any(channel.map(c => executeByChannel(c, options))).catch(err => {
      throw new AggregateError(err.errors, `所有通道测试失败: ${err.errors[0].message}`);
    });
  }

  // 如果测试通道是单个，则测试单个通道
  return await executeByChannel(channel, options);
}

export * from './common';
export default testProxyInfo;
