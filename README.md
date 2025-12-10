# test-proxy-info

[![Test](https://github.com/RaineySpace/test-proxy-info/actions/workflows/test.yml/badge.svg)](https://github.com/RaineySpace/test-proxy-info/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/test-proxy-info.svg)](https://www.npmjs.com/package/test-proxy-info)
[![npm downloads](https://img.shields.io/npm/dm/test-proxy-info.svg)](https://www.npmjs.com/package/test-proxy-info)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)

一个用于测试代理服务器的 Node.js 工具库，支持检测代理的出口 IP 地址及地理位置信息。

## 功能特性

- ✅ 支持 HTTP/HTTPS/SOCKS5 代理测试
- ✅ 获取代理出口 IP 地址
- ✅ 获取代理地理位置信息（国家、省份、城市、时区）
- ✅ 测量请求延迟（latency）
- ✅ 支持用户名/密码认证
- ✅ 支持多种测试通道（IP234、IPInfo、BigData、IPCC、IP9）
- ✅ 多通道并发测试，自动返回最快成功的结果
- ✅ 支持多语言（中文/英文）地理位置信息
- ✅ 基于 undici 的高性能 HTTP 客户端
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
```

## 使用方法

### 基本使用

```typescript
import { testProxyInfo, TestProxyChannel } from 'test-proxy-info';

// 使用代理配置对象
const proxyConfig = {
  protocol: 'http', // 支持 'http' | 'https' | 'socks5'
  host: 'proxy.example.com',
  port: 10021,
  username: 'your-username',
  password: 'your-password',
};

// 使用默认通道测试（自动使用所有通道，返回最快成功的结果）
const result = await testProxyInfo({ proxy: proxyConfig });
console.log('代理测试结果:', result);
// 输出示例:
// {
//   ip: '1.2.3.4',
//   country: 'United States',
//   province: 'California',
//   city: 'San Francisco',
//   timezone: 'America/Los_Angeles',
//   latency: 245,  // 请求延迟（毫秒）
//   channel: 'IP234'  // 测试通道
// }

// 指定 IP234 通道测试
const result2 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IP234 });
console.log('代理测试结果:', result2);

// 指定 IPInfo 通道测试
const result3 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IPInfo });
console.log('代理测试结果:', result3);

// 指定 BigData 通道测试
const result4 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.BigData });
console.log('代理测试结果:', result4);

// 指定 IPCC 通道测试
const result5 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IPCC });
console.log('代理测试结果:', result5);

// 指定 IP9 通道测试
const result6 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IP9 });
console.log('代理测试结果:', result6);

// 使用多通道测试（返回第一个成功的结果）
const result7 = await testProxyInfo({
  proxy: proxyConfig,
  channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo, TestProxyChannel.BigData]
});
console.log('多通道测试结果:', result7);

// 使用英文语言获取地理位置信息（仅 BigData 和 IPCC 通道支持）
const result8 = await testProxyInfo({
  proxy: proxyConfig,
  language: 'en-us',
  channel: [TestProxyChannel.BigData, TestProxyChannel.IPCC]
});
console.log('英文结果:', result8);
```

### 使用 SOCKS5 代理

```typescript
import { testProxyInfo } from 'test-proxy-info';

// 方式 1: 使用配置对象
const result = await testProxyInfo({
  proxy: {
    protocol: 'socks5',
    host: 'localhost',
    port: 1080,
    username: 'user',  // 可选
    password: 'pass',  // 可选
  }
});

// 方式 2: 使用 URL 字符串
const result2 = await testProxyInfo({
  proxy: 'socks5://user:pass@localhost:1080'
});
```

### 测试本机 IP（不使用代理）

```typescript
import { testProxyInfo, TestProxyChannel } from 'test-proxy-info';

// 不传入代理配置，测试本机 IP（使用默认所有通道）
const result = await testProxyInfo();
console.log('本机 IP 信息:', result);

// 指定通道测试本机 IP
const result2 = await testProxyInfo({ channel: TestProxyChannel.IP234 });
console.log('本机 IP 信息:', result2);
```

### 使用自定义 Fetcher

```typescript
import { testProxyInfo, Fetcher } from 'test-proxy-info';

// 自定义 fetcher 函数
const myFetcher: Fetcher = async (url) => {
  // 自定义请求逻辑
  return fetch(url);
};

const result = await testProxyInfo({ fetcher: myFetcher });
console.log('测试结果:', result);
```

### CommonJS 使用方式

```javascript
const { testProxyInfo, TestProxyChannel } = require('test-proxy-info');

async function test() {
  const proxyConfig = {
    protocol: 'http',
    host: 'proxy.example.com',
    port: 10021,
    username: 'your-username',
    password: 'your-password',
  };
  
  // 使用默认通道
  const result = await testProxyInfo({ proxy: proxyConfig });
  console.log('代理测试结果:', result);
  
  // 或指定通道
  const result2 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IP234 });
  console.log('代理测试结果:', result2);
}

test();
```

## API 文档

### `testProxyInfo(options?)`

主要的代理测试函数。

**参数：**

- `options`: `TestProxyOptions` (可选) - 测试选项对象
  - `proxy`: `ProxyConfig | string` (可选) - 代理配置对象或代理 URL 字符串
  - `fetcher`: `Fetcher` (可选) - 自定义请求器函数
  - `language`: `'zh-hans' | 'en-us'` (可选) - 返回结果的语言，默认为 `zh-hans`（中文）
  - `channel`: `TestProxyChannel | TestProxyChannel[]` (可选) - 测试通道或通道数组，支持：
    - `TestProxyChannel.IP234` - 使用 IP234 服务
    - `TestProxyChannel.IPInfo` - 使用 IPInfo 服务
    - `TestProxyChannel.BigData` - 使用 BigDataCloud 服务（不提供时区信息）
    - `TestProxyChannel.IPCC` - 使用 IP.CC 服务
    - `TestProxyChannel.IP9` - 使用 IP9 服务（不提供时区信息）
    - 传入数组时，会并发测试所有通道，返回第一个成功的结果
    - 默认值：使用所有通道

**返回值：**

返回一个 `Promise<TestProxyResult>`，包含以下字段：

```typescript
{
  ip: string;                  // 出口 IP 地址
  country: string;             // 国家/地区
  province: string;            // 省份
  city: string;                // 城市
  timezone?: string;           // 时区（部分渠道可能不提供）
  latency: number;             // 请求延迟（毫秒）
  channel: TestProxyChannel;   // 测试通道
}
```

**抛出异常：**

- `Error` - 当测试失败时抛出标准 Error
- `AggregateError` - 当使用多通道测试且所有通道都失败时抛出

### 类型定义

#### `SimpleTestProxyOptions`

```typescript
interface SimpleTestProxyOptions {
  proxy?: ProxyConfig | string;                 // 代理配置
  fetcher?: Fetcher;                            // 自定义请求器
  language?: 'zh-hans' | 'en-us';               // 语言（默认: zh-hans）
}
```

#### `TestProxyOptions`

```typescript
interface TestProxyOptions extends SimpleTestProxyOptions {
  channel?: TestProxyChannel | TestProxyChannel[]; // 测试通道
}
```

#### `ProxyConfig`

```typescript
interface ProxyConfig {
  protocol: 'http' | 'https' | 'socks5';  // 代理协议
  host: string;                            // 代理服务器主机地址
  port?: number;                           // 代理服务器端口（可选，默认: http=80, https=443, socks5=1080）
  username?: string;                       // 认证用户名（可选）
  password?: string;                       // 认证密码（可选）
}
```

#### `TestProxyResult`

```typescript
interface TestProxyResult {
  ip: string;                  // 出口 IP 地址
  country: string;             // 国家/地区
  province: string;            // 省份
  city: string;                // 城市
  timezone?: string;           // 时区（部分渠道可能不提供）
  latency: number;             // 请求延迟（毫秒）
  channel: TestProxyChannel;   // 测试通道
}
```

#### `TestProxyChannel`

```typescript
enum TestProxyChannel {
  IP234 = 'IP234',      // IP234 测试通道
  IPInfo = 'IPInfo',    // IPInfo 测试通道
  BigData = 'BigData',  // BigDataCloud 测试通道
  IPCC = 'IPCC',        // IP.CC 测试通道
  IP9 = 'IP9'           // IP9 测试通道
}
```

### 通道语言支持

| 通道 | 中文 (zh-hans) | 英文 (en-us) | 时区 |
|------|:--------------:|:------------:|:----:|
| IP234 | ✅ | ❌ | ✅ |
| IPInfo | ✅ | ❌ | ✅ |
| BigData | ✅ | ✅ | ❌ |
| IPCC | ✅ | ✅ | ✅ |
| IP9 | ✅ | ❌ | ❌ |

> **注意**: 当使用 `language: 'en-us'` 时，仅 BigData 和 IPCC 通道可用。其他通道会抛出错误。

#### `Fetcher`

```typescript
type Fetcher = (input: string | Request, init?: RequestInit) => Promise<Response>;
```

## 示例

### 完整示例

```typescript
import { testProxyInfo, TestProxyChannel, TestProxyResult } from 'test-proxy-info';

async function testProxy() {
  try {
    // 方式 1: 使用默认通道（推荐）
    const proxyConfig = {
      protocol: 'http' as const,
      host: 'proxy.example.com',
      port: 10021,
      username: 'myuser',
      password: 'mypass',
    };
    
    const result: TestProxyResult = await testProxyInfo({ proxy: proxyConfig });
    
    console.log('代理测试成功！');
    console.log(`出口 IP: ${result.ip}`);
    console.log(`位置: ${result.country} ${result.province} ${result.city}`);
    console.log(`时区: ${result.timezone}`);
    console.log(`延迟: ${result.latency}ms`);
    console.log(`通道: ${result.channel}`);
    
    // 方式 2: 指定 IP234 通道
    const result2 = await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IP234 });
    console.log('IP234 测试结果:', result2);
    
    // 方式 3: 使用 SOCKS5 代理
    const socks5Result = await testProxyInfo({
      proxy: {
        protocol: 'socks5',
        host: 'localhost',
        port: 1080,
      }
    });
    console.log('SOCKS5 测试结果:', socks5Result);
    
  } catch (error) {
    console.error('代理测试失败:', error.message);
  }
}

testProxy();
```

### 批量测试多个代理

```typescript
import { testProxyInfo, ProxyConfig } from 'test-proxy-info';

async function testMultipleProxies() {
  const proxies: ProxyConfig[] = [
    { protocol: 'http', host: 'proxy1.example.com', port: 10021, username: 'user1', password: 'pass1' },
    { protocol: 'http', host: 'proxy2.example.com', port: 10022, username: 'user2', password: 'pass2' },
    { protocol: 'socks5', host: 'proxy3.example.com', port: 1080, username: 'user3', password: 'pass3' },
  ];

  const results = await Promise.allSettled(
    proxies.map(proxy => testProxyInfo({ proxy }))
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

库使用标准的 JavaScript Error 进行错误处理。

### 错误处理示例

```typescript
import { testProxyInfo } from 'test-proxy-info';

async function testWithErrorHandling() {
  try {
    const proxyConfig = {
      protocol: 'http' as const,
      host: 'proxy.example.com',
      port: 10021,
      username: 'user',
      password: 'pass',
    };
    
    const result = await testProxyInfo({ proxy: proxyConfig });
    console.log('测试成功:', result);
    
  } catch (error) {
    if (error instanceof AggregateError) {
      console.error('所有检测通道都失败了:');
      error.errors.forEach((e, i) => console.error(`  通道 ${i + 1}: ${e.message}`));
    } else {
      console.error('测试失败:', error.message);
    }
  }
}

testWithErrorHandling();
```

## 依赖项

- [undici](https://github.com/nodejs/undici) - Node.js 官方 HTTP 客户端
- [fetch-socks](https://github.com/Kaciras/fetch-socks) - SOCKS5 代理支持

## 测试

### 运行测试

```bash
# 运行所有测试（需要网络连接）
pnpm test

# 监听模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage

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
