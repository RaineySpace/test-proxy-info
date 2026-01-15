/**
 * 批量测试多个代理示例
 * 演示如何并发测试多个代理服务器
 */

import { testProxyInfo, ProxyConfig } from '../src';

async function batchTestDemo() {
  console.log('=== 批量测试多个代理示例 ===\n');

  // 多个代理配置（请替换为实际的代理信息）
  const proxies: ProxyConfig[] = [
    {
      protocol: 'http',
      host: 'proxy1.example.com',
      port: 10021,
      username: 'user1',
      password: 'pass1',
    },
    {
      protocol: 'http',
      host: 'proxy2.example.com',
      port: 10022,
      username: 'user2',
      password: 'pass2',
    },
    {
      protocol: 'socks5',
      host: 'proxy3.example.com',
      port: 1080,
      username: 'user3',
      password: 'pass3',
    },
    {
      protocol: 'https',
      host: 'proxy4.example.com',
      port: 443,
    },
  ];

  console.log(`开始测试 ${proxies.length} 个代理...\n`);

  // 使用 Promise.allSettled 并发测试所有代理
  const startTime = Date.now();
  const results = await Promise.allSettled(
    proxies.map((proxy, index) => 
      testProxyInfo({ proxy }).then(result => ({ index, result }))
    )
  );
  const totalTime = Date.now() - startTime;

  // 统计结果
  let successCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    console.log(`--- 代理 ${index + 1} (${proxies[index].protocol}://${proxies[index].host}:${proxies[index].port}) ---`);
    
    if (result.status === 'fulfilled') {
      successCount++;
      const { ip, country, province, city, latency, channel } = result.value.result;
      console.log('✅ 测试成功');
      console.log(`   出口 IP: ${ip}`);
      console.log(`   位置: ${country} ${province} ${city}`);
      console.log(`   延迟: ${latency}ms`);
      console.log(`   通道: ${channel}`);
    } else {
      failCount++;
      console.log('❌ 测试失败');
      console.log(`   错误: ${result.reason instanceof Error ? result.reason.message : result.reason}`);
    }
    console.log('');
  });

  // 输出总结
  console.log('=== 测试总结 ===');
  console.log(`总共测试: ${proxies.length} 个代理`);
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log(`总耗时: ${totalTime}ms`);
  console.log(`平均耗时: ${Math.round(totalTime / proxies.length)}ms`);
}

// 运行示例
batchTestDemo();
