import { TestProxyResult, TestProxyChannel } from './common';
import { CreateProxyFetchOptions, createProxyFetch, Fetcher } from './requester';
import { testProxyInfoByIp234, testProxyInfoByIpInfo, testProxyInfoByBigData, testProxyInfoByIPCC, testProxyInfoByIP9 } from './channel';

/**
 * 代理测试
 * @param createProxyFetchOptions 创建请求器选项
 * @param channel 测试通道
 * @returns 代理测试结果
 */
export async function testProxyInfo(
  /** 创建请求器选项 */
  createProxyFetchOptions?: CreateProxyFetchOptions | Fetcher,
  /** 测试通道 */
  channel: TestProxyChannel | TestProxyChannel[] = Object.values(TestProxyChannel)
): Promise<TestProxyResult> {
  /** 创建请求器 */
  
  /** 如果测试通道为数组，则并发测试所有通道，返回第一个成功的结果 */
  if (Array.isArray(channel)) {
    /** 如果测试通道为空，则抛出错误 */
    if (channel.length === 0) {
      throw new Error('至少需要提供一个测试通道');
    }
    /** 多个通道的请求，可以共用一个请求器 */
    const customFetch = typeof createProxyFetchOptions === 'function' ? createProxyFetchOptions : createProxyFetch(createProxyFetchOptions);
    /** 并发测试所有通道，返回第一个成功的结果 */
    return await Promise.any(channel.map(c => testProxyInfo(customFetch, c))).catch(err => {
      throw new AggregateError(err.errors, `所有通道测试失败: ${err.errors[0].message}`);
    });
  }

  /** 根据测试通道执行测试 */
  switch (channel) {
    /** 测试 IP234 通道 */
    case TestProxyChannel.IP234:
      return await testProxyInfoByIp234(createProxyFetchOptions);
    /** 测试 IPInfo 通道 */
    case TestProxyChannel.IPInfo:
      return await testProxyInfoByIpInfo(createProxyFetchOptions);
    /** 测试 BigData 通道 */
    case TestProxyChannel.BigData:
      return await testProxyInfoByBigData(createProxyFetchOptions);
    /** 测试 IPCC 通道 */
    case TestProxyChannel.IPCC:
      return await testProxyInfoByIPCC(createProxyFetchOptions);
    /** 测试 IP9 通道 */
    case TestProxyChannel.IP9:
      return await testProxyInfoByIP9(createProxyFetchOptions);
    default:
      throw new Error(`不支持的通道: ${channel}`);
  }
}

export * from './channel';
export * from './common';
export * from './requester';
export default testProxyInfo;
