import { TestProxyResult, TestProxyChannel, TestProxyOptions, SimpleTestProxyOptions } from './common';
import { testProxyInfoByIp234, testProxyInfoByIpInfo, testProxyInfoByBigData, testProxyInfoByIPCC, testProxyInfoByIP9 } from './channel';
import { createProxyFetch } from './requester';

/**
 * 测量延迟
 * @internal
 * @param options 测试选项
 * @returns 延迟（毫秒）
 */
async function measureLatency(options?: SimpleTestProxyOptions): Promise<number> {
  if (!options?.latencyTestUrl) throw new Error('延迟测试 URL 不能为空');
  const customFetch = createProxyFetch(options);
  const startTime = Date.now();
  await customFetch(options.latencyTestUrl);
  return Date.now() - startTime;
}

/**
 * 测试代理通过指定通道
 * @internal
 * @param channel 测试通道
 * @param options 测试选项
 * @returns 代理测试结果
 */
async function testProxyInfoByChannel(channel: TestProxyChannel, options?: SimpleTestProxyOptions): Promise<TestProxyResult> {
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
    return await Promise.any(channel.map(c => testProxyInfo({ ...options, channel: c }))).catch(err => {
      throw new AggregateError(err.errors, `所有通道测试失败: ${err.errors[0].message}`);
    });
  }

  const result = await testProxyInfoByChannel(channel, options);

  // 如果延迟测试 URL 存在，则测试延迟并更新结果，这里串行测试是为了避免并发测试导致结果不准确
  if (options?.latencyTestUrl) {
    const latency = await measureLatency(options);
    result.latency = latency;
  }

  return result;
}

export * from './common';
export default testProxyInfo;
