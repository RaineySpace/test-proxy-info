# test-proxy-info

[![npm version](https://img.shields.io/npm/v/test-proxy-info.svg)](https://www.npmjs.com/package/test-proxy-info)
[![npm downloads](https://img.shields.io/npm/dm/test-proxy-info.svg)](https://www.npmjs.com/package/test-proxy-info)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)

一个用于测试代理服务器的 Node.js 工具库，支持检测代理的出口 IP 地址及地理位置信息。

## 快速开始

## 功能特性

- ✅ 支持 HTTP/HTTPS/SOCKS5/SOCKS5H 代理测试
- ✅ 获取代理出口 IP 地址
- ✅ 获取代理地理位置信息（国家、省份、城市、时区）
- ✅ 测量请求延迟（latency）
- ✅ 支持用户名/密码认证
- ✅ 支持多种测试通道（IP234、IPInfo）
- ✅ 完善的错误处理和错误码分类
- ✅ 30秒请求超时保护
- ✅ TypeScript 类型支持
- ✅ 同时支持 CommonJS 和 ES Module

## 安装

```bash
npm install test-proxy-info
```

或使用 pnpm：

```bash
pnpm add test-proxy-info
```

或使用 yarn：

```bash
yarn add test-proxy-info
```

## 测试

```bash
# 运行所有单元测试（快速）
pnpm test

# 监听模式（开发时用）
pnpm test:watch

# 可视化界面（最友好）
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage

# 运行集成测试（需要网络）
pnpm test:integration
```

## 使用方法

### 基本使用

```typescript
import { testProxyInfo, TestProxyChannel } from 'test-proxy-info';

// 使用代理配置对象
const proxyConfig = {
  protocol: 'http', // 支持 'http' | 'https' | 'socks5' | 'socks5h'
  host: 'proxy.example.com',
  port: '10021',
  username: 'your-username',
  password: 'your-password',
};

// 使用 IP234 通道测试
const result = await testProxyInfo(TestProxyChannel.IP234, proxyConfig);
console.log('代理测试结果:', result);
// 输出示例:
// {
//   ip: '1.2.3.4',
//   country: 'United States',
//   province: 'California',
//   city: 'San Francisco',
//   timezone: 'America/Los_Angeles',
//   latency: 245  // 请求延迟（毫秒）
// }

// 或使用 IPInfo 通道测试
const result2 = await testProxyInfo(TestProxyChannel.IPInfo, proxyConfig);
console.log('代理测试结果:', result2);

// 使用多通道测试（返回第一个成功的结果）
const result3 = await testProxyInfo(
  [TestProxyChannel.IP234, TestProxyChannel.IPInfo],
  proxyConfig
);
console.log('多通道测试结果:', result3);
```

### 使用代理 URL

```typescript
import { testProxyInfo, TestProxyChannel } from 'test-proxy-info';

// HTTP 代理
const httpProxyUrl = 'http://username:password@proxy.example.com:10021';
const result1 = await testProxyInfo(TestProxyChannel.IP234, httpProxyUrl);

// HTTPS 代理
const httpsProxyUrl = 'https://username:password@secure-proxy.example.com:443';
const result2 = await testProxyInfo(TestProxyChannel.IP234, httpsProxyUrl);

// SOCKS5 代理
const socks5ProxyUrl = 'socks5://username:password@socks-proxy.example.com:1080';
const result3 = await testProxyInfo(TestProxyChannel.IP234, socks5ProxyUrl);

// SOCKS5H 代理（远程 DNS 解析）
const socks5hProxyUrl = 'socks5h://username:password@socks-proxy.example.com:1080';
const result4 = await testProxyInfo(TestProxyChannel.IP234, socks5hProxyUrl);
```

### 测试本机 IP（不使用代理）

```typescript
import { testProxyInfo, TestProxyChannel } from 'test-proxy-info';

// 不传入代理配置，测试本机 IP
const result = await testProxyInfo(TestProxyChannel.IP234);
console.log('本机 IP 信息:', result);
```

### CommonJS 使用方式

```javascript
const { testProxyInfo, TestProxyChannel } = require('test-proxy-info');

async function test() {
  const proxyConfig = {
    host: 'proxy.example.com',
    port: '10021',
    username: 'your-username',
    password: 'your-password',
  };
  
  const result = await testProxyInfo(TestProxyChannel.IP234, proxyConfig);
  console.log('代理测试结果:', result);
}

test();
```

### 直接使用 IP234 测试函数

```typescript
import { testProxyInfoByIp234 } from 'test-proxy-info';

const proxyConfig = {
  host: 'proxy.example.com',
  port: '10021',
  username: 'your-username',
  password: 'your-password',
};

const result = await testProxyInfoByIp234(proxyConfig);
console.log('代理测试结果:', result);
```

## API 文档

### `testProxyInfo(channel, proxyConfig?)`

主要的代理测试函数。

**参数：**

- `channel`: `TestProxyChannel | TestProxyChannel[]` - 测试通道或通道数组，支持：
  - `TestProxyChannel.IP234` - 使用 IP234 服务
  - `TestProxyChannel.IPInfo` - 使用 IPInfo 服务
  - 传入数组时，会并发测试所有通道，返回第一个成功的结果
- `proxyConfig`: `ProxyConfig | string` (可选) - 代理配置对象或代理 URL 字符串

**返回值：**

返回一个 `Promise<TestProxyResult>`，包含以下字段：

```typescript
{
  ip: string;        // 出口 IP 地址
  country: string;   // 国家/地区
  province: string;  // 省份
  city: string;      // 城市
  timezone: string;  // 时区
  latency: number;   // 请求延迟（毫秒）
}
```

**抛出异常：**

- `TestProxyError` - 包含错误码的自定义错误，可能的错误码：
  - `NETWORK_ERROR` - 网络连接失败
  - `PROXY_SERVER_ERROR` - 代理服务器异常
  - `DETECTION_CHANNEL_ERROR` - 检测渠道异常
  - `UNKNOWN_ERROR` - 未知异常

### `testProxyInfoByIp234(proxyConfig?)`

使用 IP234 通道测试代理。

**参数：**

- `proxyConfig`: `ProxyConfig | string` (可选) - 代理配置对象或代理 URL 字符串

**返回值：**

返回一个 `Promise<TestProxyResult>`

### `testProxyInfoByIpInfo(proxyConfig?)`

使用 IPInfo 通道测试代理。

**参数：**

- `proxyConfig`: `ProxyConfig | string` (可选) - 代理配置对象或代理 URL 字符串

**返回值：**

返回一个 `Promise<TestProxyResult>`

### 类型定义

#### `ProxyConfig`

```typescript
interface ProxyConfig {
  protocol: 'http' | 'https' | 'socks5' | 'socks5h';  // 代理协议
  host: string;                                         // 代理服务器主机地址
  port?: string;                                        // 代理服务器端口（可选）
  username?: string;                                    // 认证用户名（可选）
  password?: string;                                    // 认证密码（可选）
}
```

#### `TestProxyResult`

```typescript
interface TestProxyResult {
  ip: string;        // 出口 IP 地址
  country: string;   // 国家/地区
  province: string;  // 省份
  city: string;      // 城市
  timezone: string;  // 时区
  latency: number;   // 请求延迟（毫秒）
}
```

#### `TestProxyChannel`

```typescript
enum TestProxyChannel {
  IP234 = 'ip234',      // IP234 测试通道
  IPInfo = 'ip_info'    // IPInfo 测试通道
}
```

#### `TestProxyError`

自定义错误类，包含错误码。

```typescript
class TestProxyError extends Error {
  constructor(message: string, code?: TestProxyErrorCode);
  code?: TestProxyErrorCode;  // 错误码
}
```

#### `TestProxyErrorCode`

错误码枚举。

```typescript
enum TestProxyErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',                      // 未知异常
  NETWORK_ERROR = 'NETWORK_ERROR',                      // 网络异常
  PROXY_SERVER_ERROR = 'PROXY_SERVER_ERROR',           // 代理服务器异常
  DETECTION_CHANNEL_ERROR = 'DETECTION_CHANNEL_ERROR'  // 检测渠道异常
}
```

## 工具函数

### `getProxyUrl(proxyConfig)`

将代理配置对象转换为代理 URL 字符串。

```typescript
import { getProxyUrl } from 'test-proxy-info';

const proxyConfig = {
  protocol: 'http',
  host: 'proxy.example.com',
  port: '10021',
  username: 'user',
  password: 'pass',
};

const url = getProxyUrl(proxyConfig);
// 返回: 'http://user:pass@proxy.example.com:10021'

// SOCKS5 代理示例
const socks5Config = {
  protocol: 'socks5',
  host: 'socks-proxy.example.com',
  port: '1080',
  username: 'user',
  password: 'pass',
};

const socks5Url = getProxyUrl(socks5Config);
// 返回: 'socks5://user:pass@socks-proxy.example.com:1080'
```

### `createAxiosInstance(proxyConfig?)`

创建配置了代理的 Axios 实例。所有实例默认配置 **30秒请求超时**。

```typescript
import { createAxiosInstance } from 'test-proxy-info';

const axios = createAxiosInstance(proxyConfig);
// 现在可以使用这个 axios 实例发送请求，请求会通过代理
// 默认 30 秒超时，超时后会抛出 NETWORK_ERROR
const response = await axios.get('https://api.example.com');
```

## 示例

### 完整示例

```typescript
import { testProxyInfo, TestProxyChannel, TestProxyResult } from 'test-proxy-info';

async function testProxyInfo() {
  try {
    // 方式 1: 使用配置对象
    const config = {
      protocol: 'http',
      host: 'proxy.example.com',
      port: '10021',
      username: 'myuser',
      password: 'mypass',
    };
    
    const result: TestProxyResult = await testProxyInfo(
      TestProxyChannel.IP234,
      config
    );
    
    console.log('代理测试成功！');
    console.log(`出口 IP: ${result.ip}`);
    console.log(`位置: ${result.country} ${result.province} ${result.city}`);
    console.log(`时区: ${result.timezone}`);
    console.log(`延迟: ${result.latency}ms`);
    
    // 方式 2: 使用 URL 字符串
    const url = 'http://myuser:mypass@proxy.example.com:10021';
    const result2 = await testProxyInfo(TestProxyChannel.IP234, url);
    console.log('第二次测试结果:', result2);
    
    // 方式 3: 使用 IPInfo 通道
    const result3 = await testProxyInfo(TestProxyChannel.IPInfo, config);
    console.log('IPInfo 测试结果:', result3);
    
    // 方式 4: 使用 SOCKS5 代理
    const socks5Config = {
      protocol: 'socks5',
      host: 'socks-proxy.example.com',
      port: '1080',
      username: 'myuser',
      password: 'mypass',
    };
    const result4 = await testProxyInfo(TestProxyChannel.IP234, socks5Config);
    console.log('SOCKS5 代理测试结果:', result4);
    console.log(`延迟: ${result4.latency}ms`);
    
  } catch (error) {
    console.error('代理测试失败:', error.message);
  }
}

testProxyInfo();
```

### 批量测试多个代理

```typescript
import { testProxyInfo, TestProxyChannel } from 'test-proxy-info';

async function testMultipleProxies() {
  const proxies = [
    'http://user1:pass1@proxy1.example.com:10021',
    'http://user2:pass2@proxy2.example.com:10022',
    'http://user3:pass3@proxy3.example.com:10023',
  ];

  const results = await Promise.allSettled(
    proxies.map(proxy => testProxyInfo(TestProxyChannel.IP234, proxy))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { ip, country, city, latency } = result.value;
      console.log(`代理 ${index + 1} 测试成功:`);
      console.log(`  IP: ${ip}`);
      console.log(`  位置: ${country}, ${city}`);
      console.log(`  延迟: ${latency}ms`);
    } else {
      console.log(`代理 ${index + 1} 测试失败:`, result.reason.message);
    }
  });
}

testMultipleProxies();
```

## 错误处理

库提供了完善的错误处理机制，所有错误都通过 `TestProxyError` 抛出，并带有明确的错误码。

### 错误分类

1. **NETWORK_ERROR** - 网络异常
   - 网络超时 (ETIMEDOUT) - 包括 30 秒请求超时
   - DNS 解析失败 (ENOTFOUND)
   - 网络不可达 (ENETUNREACH)
   - 临时 DNS 解析失败 (EAI_AGAIN)
   - 包含 "timeout" 关键字的错误

2. **PROXY_SERVER_ERROR** - 代理服务器异常
   - 代理连接被拒绝 (ECONNREFUSED)
   - 代理认证失败 (407)
   - 代理连接重置 (ECONNRESET)
   - 包含 "proxy" 关键字的连接错误

3. **DETECTION_CHANNEL_ERROR** - 检测渠道异常
   - HTTP 状态码 >= 400 (403, 500, 502, 503 等)

4. **UNKNOWN_ERROR** - 未知异常
   - 其他未分类的错误

### 错误处理示例

```typescript
import { testProxyInfo, TestProxyChannel, TestProxyError, TestProxyErrorCode } from 'test-proxy-info';

async function testWithErrorHandling() {
  try {
    const proxyConfig = {
      protocol: 'http',
      host: 'proxy.example.com',
      port: '10021',
      username: 'user',
      password: 'pass',
    };
    
    const result = await testProxyInfo(TestProxyChannel.IP234, proxyConfig);
    console.log('测试成功:', result);
    
  } catch (error) {
    if (error instanceof TestProxyError) {
      switch (error.code) {
        case TestProxyErrorCode.NETWORK_ERROR:
          console.error('网络连接失败，请检查网络连接');
          break;
        case TestProxyErrorCode.PROXY_SERVER_ERROR:
          console.error('代理服务器连接失败，请检查代理配置');
          break;
        case TestProxyErrorCode.DETECTION_CHANNEL_ERROR:
          console.error('检测服务异常，请稍后重试');
          break;
        case TestProxyErrorCode.UNKNOWN_ERROR:
        default:
          console.error('未知错误:', error.message);
          break;
      }
    } else {
      console.error('程序异常:', error);
    }
  }
}

testWithErrorHandling();
```

### 详细错误处理示例

```typescript
import { testProxyInfo, TestProxyChannel, TestProxyError, TestProxyErrorCode } from 'test-proxy-info';

async function testProxyWithDetailedErrorHandling() {
  const proxyConfig = {
    protocol: 'http',
    host: 'proxy.example.com',
    port: '10021',
    username: 'user',
    password: 'pass',
  };

  try {
    const result = await testProxyInfo(TestProxyChannel.IP234, proxyConfig);
    console.log('✅ 代理测试成功！');
    console.log(`   出口 IP: ${result.ip}`);
    console.log(`   位置: ${result.country}, ${result.province}, ${result.city}`);
    console.log(`   时区: ${result.timezone}`);
    console.log(`   延迟: ${result.latency}ms`);
    return result;
    
  } catch (error) {
    if (error instanceof TestProxyError) {
      console.error(`❌ 代理测试失败 [${error.code}]`);
      console.error(`   错误信息: ${error.message}`);
      
      // 根据错误码提供具体的解决建议
      switch (error.code) {
        case TestProxyErrorCode.NETWORK_ERROR:
          console.error('   💡 建议:');
          console.error('      - 检查网络连接是否正常');
          console.error('      - 检查防火墙设置');
          console.error('      - 尝试增加超时时间');
          break;
          
        case TestProxyErrorCode.PROXY_SERVER_ERROR:
          console.error('   💡 建议:');
          console.error('      - 检查代理服务器地址和端口是否正确');
          console.error('      - 检查用户名和密码是否正确');
          console.error('      - 确认代理服务器是否在线');
          console.error('      - 检查代理协议类型是否正确 (http/https/socks5)');
          break;
          
        case TestProxyErrorCode.DETECTION_CHANNEL_ERROR:
          console.error('   💡 建议:');
          console.error('      - 尝试切换到其他检测通道');
          console.error('      - 稍后重试');
          break;
          
        case TestProxyErrorCode.UNKNOWN_ERROR:
        default:
          console.error('   💡 建议:');
          console.error('      - 查看详细错误信息');
          console.error('      - 联系技术支持');
          break;
      }
    } else {
      console.error('❌ 程序异常:', error);
    }
    
    throw error; // 重新抛出错误供上层处理
  }
}
```

## 依赖项

- [axios](https://github.com/axios/axios) - HTTP 客户端
- [https-proxy-agent](https://github.com/TooTallNate/proxy-agents) - HTTP/HTTPS 代理支持
- [socks-proxy-agent](https://github.com/TooTallNate/proxy-agents) - SOCKS5/SOCKS5H 代理支持

## 测试

### 运行测试

```bash
# 运行所有单元测试
pnpm test

# 监听模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage

# 运行集成测试（需要网络连接）
pnpm test:integration

# 只运行单元测试（不需要网络）
pnpm test:unit

# 使用 UI 界面运行测试
pnpm test:ui
```

### 测试覆盖率

项目包含完整的测试套件，涵盖：

- ✅ 单元测试（所有核心函数）
- ✅ 集成测试（实际 API 调用）
- ✅ 延迟测量测试（latency 计算准确性）
- ✅ TypeScript 类型测试
- ✅ 错误处理测试
- ✅ Mock 测试

查看详细的测试文档：[__tests__/README.md](./__tests__/README.md)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm dev

# 构建
pnpm build

# 代码检查
pnpm lint

# 清理构建文件
pnpm clean
```

## 许可证

MIT

## 作者

RaineySpace

## 贡献

欢迎提交 Issue 和 Pull Request！
