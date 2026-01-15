/**
 * SOCKS5 代理使用示例
 * 演示如何测试SOCKS5代理
 */

import { testProxyInfo } from '../src';

async function socks5ProxyDemo() {
  console.log('=== SOCKS5 代理使用示例 ===\n');

  try {
    // 方式1: 使用配置对象
    console.log('1. 使用配置对象测试SOCKS5代理...');
    const result1 = await testProxyInfo({
      proxy: {
        protocol: 'socks5',
        host: 'localhost',
        port: 1080,
        username: 'user', // 可选
        password: 'pass', // 可选
      },
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result1.ip}`);
    console.log(`   位置: ${result1.country} ${result1.province} ${result1.city}`);
    console.log(`   延迟: ${result1.latency}ms\n`);

    // 方式2: 使用URL字符串
    console.log('2. 使用URL字符串测试SOCKS5代理...');
    const result2 = await testProxyInfo({
      proxy: 'socks5://user:pass@localhost:1080',
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result2.ip}`);
    console.log(`   位置: ${result2.country} ${result2.city}\n`);

    // 方式3: 不带认证的SOCKS5代理
    console.log('3. 测试无需认证的SOCKS5代理...');
    const result3 = await testProxyInfo({
      proxy: {
        protocol: 'socks5',
        host: 'localhost',
        port: 1080,
      },
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result3.ip}\n`);

  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : error);
  }
}

// 运行示例
socks5ProxyDemo();
