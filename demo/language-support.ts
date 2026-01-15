/**
 * 语言支持示例
 * 演示如何获取中文或英文的地理位置信息
 */

import { testProxyInfo, TestProxyChannel } from '../src';

async function languageSupportDemo() {
  console.log('=== 语言支持示例 ===\n');

  const proxyConfig = {
    protocol: 'http' as const,
    host: 'proxy.example.com',
    port: 10021,
    username: 'your-username',
    password: 'your-password',
  };

  try {
    // 方式1: 使用中文（默认）
    console.log('1. 获取中文地理位置信息...');
    const result1 = await testProxyInfo({
      proxy: proxyConfig,
      language: 'zh-hans',
      channel: TestProxyChannel.BigData, // BigData 支持多语言
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result1.ip}`);
    console.log(`   位置（中文）: ${result1.country} ${result1.province} ${result1.city}\n`);

    // 方式2: 使用英文
    console.log('2. 获取英文地理位置信息...');
    const result2 = await testProxyInfo({
      proxy: proxyConfig,
      language: 'en-us',
      channel: TestProxyChannel.BigData, // BigData 支持英文
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result2.ip}`);
    console.log(`   位置（英文）: ${result2.country} ${result2.province} ${result2.city}\n`);

    // 方式3: 使用IPCC通道（也支持多语言）
    console.log('3. 使用IPCC通道获取英文信息...');
    const result3 = await testProxyInfo({
      proxy: proxyConfig,
      language: 'en-us',
      channel: TestProxyChannel.IPCC,
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result3.ip}`);
    console.log(`   位置（英文）: ${result3.country} ${result3.city}`);
    console.log(`   时区: ${result3.timezone}\n`);

    // 方式4: 使用多通道，自动选择支持英文的通道
    console.log('4. 使用多通道自动选择支持英文的通道...');
    const result4 = await testProxyInfo({
      proxy: proxyConfig,
      language: 'en-us',
      channel: [TestProxyChannel.BigData, TestProxyChannel.IPCC],
    });
    console.log('✅ 测试成功!');
    console.log(`   使用通道: ${result4.channel}`);
    console.log(`   出口 IP: ${result4.ip}`);
    console.log(`   位置（英文）: ${result4.country} ${result4.city}\n`);

    // 方式5: 比较中英文结果
    console.log('5. 比较同一个IP的中英文地理位置信息...');
    const zhResult = await testProxyInfo({
      proxy: proxyConfig,
      language: 'zh-hans',
      channel: TestProxyChannel.BigData,
    });
    const enResult = await testProxyInfo({
      proxy: proxyConfig,
      language: 'en-us',
      channel: TestProxyChannel.BigData,
    });
    console.log('✅ 测试成功!');
    console.log(`   IP: ${zhResult.ip}`);
    console.log(`   中文: ${zhResult.country} ${zhResult.province} ${zhResult.city}`);
    console.log(`   英文: ${enResult.country} ${enResult.province} ${enResult.city}\n`);

  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : error);
    console.error('\n注意: 只有 BigData 和 IPCC 通道支持英文。');
    console.error('其他通道（IP234, IPInfo, IP9）只支持中文。');
  }
}

// 运行示例
languageSupportDemo();
