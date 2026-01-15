/**
 * 错误处理示例
 * 演示各种错误场景的处理方法
 */

import { testProxyInfo, TestProxyChannel } from '../src';

async function errorHandlingDemo() {
  console.log('=== 错误处理示例 ===\n');

  // 场景1: 处理无效的代理配置
  console.log('1. 处理无效的代理配置...');
  try {
    const result = await testProxyInfo({
      proxy: {
        protocol: 'http',
        host: 'invalid-proxy-host.example.com',
        port: 99999,
      },
      timeout: 5000, // 设置较短的超时时间
    });
    console.log('测试结果:', result);
  } catch (error) {
    console.log('✅ 成功捕获错误:');
    console.log(`   错误类型: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.log(`   错误信息: ${error instanceof Error ? error.message : error}\n`);
  }

  // 场景2: 处理多通道全部失败的情况
  console.log('2. 处理多通道全部失败的情况...');
  try {
    const result = await testProxyInfo({
      proxy: {
        protocol: 'http',
        host: 'invalid-host.example.com',
        port: 8080,
      },
      channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo],
      timeout: 3000,
    });
    console.log('测试结果:', result);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log('✅ 成功捕获 AggregateError:');
      console.log(`   失败的通道数量: ${error.errors.length}`);
      error.errors.forEach((e: Error, i: number) => {
        console.log(`   通道 ${i + 1} 错误: ${e.message}`);
      });
      console.log('');
    } else {
      console.log('意外的错误类型:', error);
    }
  }

  // 场景3: 处理超时错误
  console.log('3. 处理超时错误...');
  try {
    const result = await testProxyInfo({
      proxy: {
        protocol: 'http',
        host: 'slow-proxy.example.com',
        port: 8080,
      },
      timeout: 1000, // 设置1秒超时
    });
    console.log('测试结果:', result);
  } catch (error) {
    console.log('✅ 成功捕获超时错误:');
    console.log(`   错误信息: ${error instanceof Error ? error.message : error}\n`);
  }

  // 场景4: 使用不支持的语言和通道组合
  console.log('4. 使用不支持的语言和通道组合...');
  try {
    const result = await testProxyInfo({
      language: 'en-us', // 英文
      channel: TestProxyChannel.IP234, // IP234不支持英文
    });
    console.log('测试结果:', result);
  } catch (error) {
    console.log('✅ 成功捕获错误:');
    console.log(`   错误信息: ${error instanceof Error ? error.message : error}\n`);
  }

  // 场景5: 完整的错误处理示例
  console.log('5. 完整的错误处理示例...');
  const proxyConfig = {
    protocol: 'http' as const,
    host: 'proxy.example.com',
    port: 10021,
    username: 'user',
    password: 'pass',
  };

  try {
    const result = await testProxyInfo({ proxy: proxyConfig });
    console.log('✅ 测试成功!');
    console.log(`   出口 IP: ${result.ip}`);
    console.log(`   位置: ${result.country} ${result.city}`);
    console.log(`   延迟: ${result.latency}ms`);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.error('❌ 所有检测通道都失败了:');
      console.error(`   总共尝试了 ${error.errors.length} 个通道`);
      error.errors.forEach((e: Error, i: number) => {
        console.error(`   通道 ${i + 1}: ${e.message}`);
      });
    } else if (error instanceof Error) {
      console.error('❌ 测试失败:');
      console.error(`   错误类型: ${error.name}`);
      console.error(`   错误信息: ${error.message}`);
      if (error.stack) {
        console.error(`   错误堆栈:\n${error.stack}`);
      }
    } else {
      console.error('❌ 发生未知错误:', error);
    }
  }
}

// 运行示例
errorHandlingDemo();
