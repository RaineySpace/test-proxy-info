/**
 * 基本使用示例
 * 演示如何使用默认通道测试HTTP代理
 */

import { testProxyInfo, TestProxyChannel } from '../src';

async function basicUsageDemo() {
  console.log('=== 基本使用示例 ===\n');

  // 示例代理配置（请替换为实际的代理信息）
  const proxyConfig = {
    protocol: 'http' as const,
    host: 'proxy.example.com',
    port: 10021,
    username: 'your-username',
    password: 'your-password',
  };

  try {
    // 方式1: 使用默认通道（推荐 - 自动使用所有通道，返回最快成功的结果）
    console.log('1. 使用默认通道测试...');
    const result = await testProxyInfo({ proxy: proxyConfig });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result.ip}`);
    console.log(`   位置: ${result.country} ${result.province} ${result.city}`);
    console.log(`   时区: ${result.timezone || '无'}`);
    console.log(`   延迟: ${result.latency}ms`);
    console.log(`   通道: ${result.channel}\n`);

    // 方式2: 使用代理URL字符串
    console.log('2. 使用代理URL字符串...');
    const proxyUrl = 'http://your-username:your-password@proxy.example.com:10021';
    const result2 = await testProxyInfo({ proxy: proxyUrl });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result2.ip}`);
    console.log(`   通道: ${result2.channel}\n`);

    // 方式3: 指定特定通道
    console.log('3. 指定IP234通道测试...');
    const result3 = await testProxyInfo({
      proxy: proxyConfig,
      channel: TestProxyChannel.IP234,
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result3.ip}`);
    console.log(`   通道: ${result3.channel}\n`);

  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : error);
  }
}

// 运行示例
basicUsageDemo();
