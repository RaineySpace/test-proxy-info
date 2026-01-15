/**
 * 自定义延迟测试示例
 * 演示如何使用自定义URL测试延迟
 */

import { testProxyInfo, TestProxyChannel } from '../src';

async function customLatencyDemo() {
  console.log('=== 自定义延迟测试示例 ===\n');

  const proxyConfig = {
    protocol: 'http' as const,
    host: 'proxy.example.com',
    port: 10021,
    username: 'your-username',
    password: 'your-password',
  };

  try {
    // 方式1: 不使用自定义延迟测试（使用通道默认的延迟）
    console.log('1. 使用默认延迟测试...');
    const result1 = await testProxyInfo({
      proxy: proxyConfig,
      channel: TestProxyChannel.IP234,
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result1.ip}`);
    console.log(`   默认延迟: ${result1.latency}ms\n`);

    // 方式2: 使用Google的测试URL
    console.log('2. 使用 Google 测试URL...');
    const result2 = await testProxyInfo({
      proxy: proxyConfig,
      channel: TestProxyChannel.IP234,
      latencyTestUrl: 'http://www.gstatic.com/generate_204',
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result2.ip}`);
    console.log(`   自定义延迟 (Google): ${result2.latency}ms\n`);

    // 方式3: 使用百度的测试URL
    console.log('3. 使用百度测试URL...');
    const result3 = await testProxyInfo({
      proxy: proxyConfig,
      channel: TestProxyChannel.IPInfo,
      latencyTestUrl: 'https://www.baidu.com',
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result3.ip}`);
    console.log(`   自定义延迟 (百度): ${result3.latency}ms\n`);

    // 方式4: 比较多个测试URL的延迟
    console.log('4. 比较不同测试URL的延迟...');
    const testUrls = [
      'http://www.gstatic.com/generate_204',
      'https://www.baidu.com',
      'https://www.google.com',
      'https://www.cloudflare.com',
    ];

    for (const url of testUrls) {
      try {
        const result = await testProxyInfo({
          proxy: proxyConfig,
          channel: TestProxyChannel.IP234,
          latencyTestUrl: url,
        });
        console.log(`   ${url}`);
        console.log(`   └─ 延迟: ${result.latency}ms`);
      } catch (error) {
        console.log(`   ${url}`);
        console.log(`   └─ ❌ 失败: ${error instanceof Error ? error.message : error}`);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : error);
  }
}

// 运行示例
customLatencyDemo();
