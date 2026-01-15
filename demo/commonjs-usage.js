/**
 * CommonJS 使用示例
 * 演示如何在 CommonJS 环境中使用本库
 */

const { testProxyInfo, TestProxyChannel } = require('../dist/index.js');

async function commonjsUsageDemo() {
  console.log('=== CommonJS 使用示例 ===\n');

  // 示例代理配置（请替换为实际的代理信息）
  const proxyConfig = {
    protocol: 'http',
    host: 'proxy.example.com',
    port: 10021,
    username: 'your-username',
    password: 'your-password',
  };

  try {
    // 方式1: 使用默认通道
    console.log('1. 使用默认通道测试...');
    const result = await testProxyInfo({ proxy: proxyConfig });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result.ip}`);
    console.log(`   位置: ${result.country} ${result.province} ${result.city}`);
    console.log(`   时区: ${result.timezone || '无'}`);
    console.log(`   延迟: ${result.latency}ms`);
    console.log(`   通道: ${result.channel}\n`);

    // 方式2: 指定通道
    console.log('2. 指定IP234通道测试...');
    const result2 = await testProxyInfo({
      proxy: proxyConfig,
      channel: TestProxyChannel.IP234,
    });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result2.ip}`);
    console.log(`   通道: ${result2.channel}\n`);

    // 方式3: 测试本机IP
    console.log('3. 测试本机IP...');
    const result3 = await testProxyInfo();
    console.log('✅ 测试成功!');
    console.log(`   本机 IP: ${result3.ip}`);
    console.log(`   位置: ${result3.country} ${result3.city}\n`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行示例
commonjsUsageDemo().catch(err => {
  console.error('运行出错:', err);
  process.exit(1);
});
