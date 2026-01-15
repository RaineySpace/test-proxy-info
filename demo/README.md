# Test Proxy Info 使用示例

本目录包含 `test-proxy-info` 库的各种使用示例，帮助你快速上手。

## 📁 示例文件说明

### 1. [basic-usage.ts](./basic-usage.ts)
**基本使用示例**

演示最常见的使用场景：
- 使用默认通道测试代理
- 使用代理 URL 字符串
- 指定特定通道测试

适合初学者快速了解基本用法。

### 2. [socks5-proxy.ts](./socks5-proxy.ts)
**SOCKS5 代理使用示例**

演示如何测试 SOCKS5 代理：
- 使用配置对象
- 使用 URL 字符串
- 带认证和不带认证的配置

适合需要使用 SOCKS5 代理的场景。

### 3. [test-local-ip.ts](./test-local-ip.ts)
**测试本机IP示例**

演示如何在不使用代理的情况下获取本机 IP 信息：
- 使用默认通道测试
- 指定特定通道测试

适合需要检查本机网络信息的场景。

### 4. [batch-test.ts](./batch-test.ts)
**批量测试多个代理示例**

演示如何并发测试多个代理服务器：
- 批量测试多个代理
- 统计成功和失败的数量
- 计算性能指标

适合需要管理和测试大量代理的场景。

### 5. [multi-channel.ts](./multi-channel.ts)
**多通道测试示例**

演示如何使用多个检测通道：
- 使用所有通道（返回最快的结果）
- 指定多个通道
- 比较不同通道的性能

适合需要提高检测成功率和速度的场景。

### 6. [custom-latency.ts](./custom-latency.ts)
**自定义延迟测试示例**

演示如何使用自定义 URL 测试延迟：
- 使用不同的测试 URL
- 比较多个 URL 的延迟
- 针对特定地区优化延迟测试

适合需要精确延迟测量的场景。

### 7. [language-support.ts](./language-support.ts)
**语言支持示例**

演示如何获取不同语言的地理位置信息：
- 中文地理位置信息（默认）
- 英文地理位置信息
- 比较不同语言的结果

适合需要多语言支持的国际化应用。

### 8. [error-handling.ts](./error-handling.ts)
**错误处理示例**

演示各种错误场景的处理方法：
- 处理无效的代理配置
- 处理多通道全部失败
- 处理超时错误
- 处理不支持的配置组合

适合需要健壮错误处理的生产环境。

### 9. [commonjs-usage.js](./commonjs-usage.js)
**CommonJS 使用示例**

演示如何在 CommonJS 环境中使用：
- Node.js 传统模块系统
- require 语法

适合使用 CommonJS 的旧项目。

## 🚀 运行示例

### 前置准备

1. 确保已构建项目：
```bash
pnpm build
```

2. 替换示例中的代理配置为实际可用的代理信息。

### 运行 TypeScript 示例

使用 `tsx` 或 `ts-node` 运行 TypeScript 示例：

```bash
# 安装 tsx（如果还没有）
pnpm add -g tsx

# 运行示例
tsx demo/basic-usage.ts
tsx demo/socks5-proxy.ts
tsx demo/test-local-ip.ts
tsx demo/batch-test.ts
tsx demo/multi-channel.ts
tsx demo/custom-latency.ts
tsx demo/language-support.ts
tsx demo/error-handling.ts
```

### 运行 CommonJS 示例

```bash
node demo/commonjs-usage.js
```

## 📖 通道支持对比

| 通道 | 中文 | 英文 | 时区 | 特点 |
|------|:----:|:----:|:----:|------|
| IP234 | ✅ | ❌ | ✅ | 综合信息完整 |
| IPInfo | ✅ | ❌ | ✅ | 速度快 |
| BigData | ✅ | ✅ | ❌ | 支持多语言 |
| IPCC | ✅ | ✅ | ✅ | 功能最全 |
| IP9 | ✅ | ❌ | ❌ | 简洁高效 |

## 💡 最佳实践

### 1. 使用默认通道（推荐）

对于大多数场景，使用默认通道即可，它会自动使用所有可用通道并返回最快的结果：

```typescript
const result = await testProxyInfo({ proxy: proxyConfig });
```

### 2. 设置合理的超时时间

根据网络环境设置合理的超时时间：

```typescript
const result = await testProxyInfo({
  proxy: proxyConfig,
  timeout: 10000, // 10秒超时
});
```

### 3. 错误处理

始终使用 try-catch 处理可能的错误：

```typescript
try {
  const result = await testProxyInfo({ proxy: proxyConfig });
  // 处理结果
} catch (error) {
  if (error instanceof AggregateError) {
    // 处理多通道全部失败
  } else {
    // 处理其他错误
  }
}
```

### 4. 批量测试使用 Promise.allSettled

批量测试时使用 `Promise.allSettled` 而不是 `Promise.all`，以确保一个失败不会影响其他测试：

```typescript
const results = await Promise.allSettled(
  proxies.map(proxy => testProxyInfo({ proxy }))
);
```

### 5. 选择合适的语言

如果你的应用面向国际用户，使用支持多语言的通道：

```typescript
const result = await testProxyInfo({
  proxy: proxyConfig,
  language: 'en-us',
  channel: [TestProxyChannel.BigData, TestProxyChannel.IPCC],
});
```

## 🔗 相关链接

- [项目主页](https://github.com/RaineySpace/test-proxy-info)
- [NPM 包](https://www.npmjs.com/package/test-proxy-info)
- [API 文档](../README.md#api-文档)

## 📝 注意事项

1. **代理配置**：示例中的代理配置是占位符，请替换为实际可用的代理信息。
2. **网络连接**：运行示例需要网络连接，某些示例可能需要访问外网。
3. **超时设置**：根据实际网络情况调整超时时间。
4. **语言支持**：使用英文时，只有 BigData 和 IPCC 通道可用。

## 🤝 贡献

如果你有更好的示例或改进建议，欢迎提交 Pull Request！
