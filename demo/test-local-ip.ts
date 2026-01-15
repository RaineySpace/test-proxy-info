/**
 * 测试本机IP示例
 * 演示如何在不使用代理的情况下获取本机IP信息
 */

import { testProxyInfo, TestProxyChannel } from '../src';

async function testLocalIpDemo() {
  console.log('=== 测试本机IP示例 ===\n');

  try {
    // 方式1: 使用默认通道测试本机IP
    console.log('1. 使用默认通道测试本机IP...');
    const result1 = await testProxyInfo();
    console.log('✅ 测试成功!');
    console.log(`   本机 IP: ${result1.ip}`);
    console.log(`   位置: ${result1.country} ${result1.province} ${result1.city}`);
    console.log(`   时区: ${result1.timezone || '无'}`);
    console.log(`   延迟: ${result1.latency}ms`);
    console.log(`   使用通道: ${result1.channel}\n`);

    // 方式2: 指定IP234通道测试
    console.log('2. 使用IP234通道测试本机IP...');
    const result2 = await testProxyInfo({
      channel: TestProxyChannel.IP234,
    });
    console.log('✅ 测试成功!');
    console.log(`   本机 IP: ${result2.ip}`);
    console.log(`   位置: ${result2.country} ${result2.city}\n`);

    // 方式3: 使用IPInfo通道测试
    console.log('3. 使用IPInfo通道测试本机IP...');
    const result3 = await testProxyInfo({
      channel: TestProxyChannel.IPInfo,
    });
    console.log('✅ 测试成功!');
    console.log(`   本机 IP: ${result3.ip}`);
    console.log(`   位置: ${result3.country} ${result3.city}\n`);

  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : error);
  }
}

// 运行示例
testLocalIpDemo();
