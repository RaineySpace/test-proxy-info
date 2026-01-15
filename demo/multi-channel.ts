/**
 * 多通道测试示例
 * 演示如何使用多个通道并发测试，返回最快成功的结果
 */

import { testProxyInfo, TestProxyChannel } from '../src';

async function multiChannelDemo() {
  console.log('=== 多通道测试示例 ===\n');

  const proxyConfig = {
    protocol: 'http' as const,
    host: 'proxy.example.com',
    port: 10021,
    username: 'your-username',
    password: 'your-password',
  };

  try {
    // 方式1: 使用所有可用通道（默认行为）
    console.log('1. 使用所有可用通道测试（返回最快的结果）...');
    const result1 = await testProxyInfo({ proxy: proxyConfig });
    console.log('✅ 测试成功!');
    console.log(`   使用通道: ${result1.channel}`);
    console.log(`   出口 IP: ${result1.ip}`);
    console.log(`   延迟: ${result1.latency}ms\n`);

    // 方式2: 指定多个通道
    console.log('2. 使用指定的多个通道测试...');
    const result2 = await testProxyInfo({
      proxy: proxyConfig,
      channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo, TestProxyChannel.BigData],
    });
    console.log('✅ 测试成功!');
    console.log(`   使用通道: ${result2.channel}`);
    console.log(`   出口 IP: ${result2.ip}`);
    console.log(`   位置: ${result2.country} ${result2.city}`);
    console.log(`   延迟: ${result2.latency}ms\n`);

    // 方式3: 比较不同通道的性能
    console.log('3. 依次测试每个通道的性能...');
    const channels = [
      TestProxyChannel.IP234,
      TestProxyChannel.IPInfo,
      TestProxyChannel.BigData,
      TestProxyChannel.IPCC,
      TestProxyChannel.IP9,
    ];

    for (const channel of channels) {
      try {
        const startTime = Date.now();
        const result = await testProxyInfo({ proxy: proxyConfig, channel });
        const elapsed = Date.now() - startTime;
        console.log(`   ${channel}: ✅ 成功 (总耗时: ${elapsed}ms, 报告延迟: ${result.latency}ms)`);
      } catch (error) {
        console.log(`   ${channel}: ❌ 失败 - ${error instanceof Error ? error.message : error}`);
      }
    }

  } catch (error) {
    if (error instanceof AggregateError) {
      console.error('❌ 所有通道都失败了:');
      error.errors.forEach((e: Error, i: number) => {
        console.error(`   通道 ${i + 1}: ${e.message}`);
      });
    } else {
      console.error('❌ 测试失败:', error instanceof Error ? error.message : error);
    }
  }
}

// 运行示例
multiChannelDemo();
