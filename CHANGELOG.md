# test-proxy-info

## 2.0.0

### Major Changes

- **BREAKING**: 重构 API 为单一 options 对象模式
  - `testProxyInfo(proxyConfig, channel)` 变更为 `testProxyInfo(options)`
  - 新的调用方式: `testProxyInfo({ proxy, fetcher, channel })`
- **BREAKING**: 移除 `createProxyFetch` 导出
- **BREAKING**: 移除 `export * from './channel'` 和 `export * from './requester'`
- 类型定义集中到 `common.ts`：`Fetcher`、`ProxyConfig`、`TestProxyOptions`、`SimpleTestProxyOptions`

### Migration Guide

```typescript
// 旧 API (v1.x)
await testProxyInfo(proxyConfig);
await testProxyInfo(proxyConfig, TestProxyChannel.IP234);
await testProxyInfo(proxyUrl, [TestProxyChannel.IP234, TestProxyChannel.IPInfo]);

// 新 API (v2.x)
await testProxyInfo({ proxy: proxyConfig });
await testProxyInfo({ proxy: proxyConfig, channel: TestProxyChannel.IP234 });
await testProxyInfo({ proxy: proxyConfig, channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo] });

// 测试本机 IP
await testProxyInfo();
await testProxyInfo({ channel: TestProxyChannel.IP234 });
```

## 1.1.0

### Minor Changes

- 新增 ip-cc 和 ip9 两个渠道
- 修改当前默认返回的语言为中文
- 337ab9e: 新增 big-data 检测渠道,并在检测结果返回中新增渠道字段

## 1.0.1

### Patch Changes

- 修改 Fetcher 类型定义，使其与标准 fetch API 保持一致

## 1.0.0

### Major Changes

- 本次变更是一次重大重构，将 HTTP 客户端从 axios + https-proxy-agent + socks-proxy-agent 迁移到 Node.js 官方的 undici。主要变化包括：

  1. 移除 SOCKS5/SOCKS5H 代理支持
  2. 移除自定义错误码系统 (TestProxyError, TestProxyErrorCode)
  3. 重构请求器为更简洁的 Fetcher 模式
  4. 将通道实现移动到 src/channel/ 目录

## 0.3.0

### Minor Changes

- 新增 `Requester` 接口和 `createRequester` 函数，支持自定义请求器注入
- `testProxyInfoByIp234` 和 `testProxyInfoByIpInfo` 参数类型变更为 `CreateRequesterOptions`
- 将 `createAxiosInstance` 从 `common.ts` 移动到 `requester.ts`（仍保持导出）
- `testProxyInfoByIp234(proxyConfig?)` 参数类型从 `ProxyConfig | string` 变更为 `CreateRequesterOptions`
- `testProxyInfoByIpInfo(proxyConfig?)` 参数类型从 `ProxyConfig | string` 变更为 `CreateRequesterOptions`
  > 注意：由于 `CreateRequesterOptions` 是 `ProxyConfig | string | Requester` 的联合类型，现有使用 `ProxyConfig` 或 `string` 的代码仍然兼容。

## 0.2.0

### Minor Changes

- 修改 testProxyInfo 参数顺序,用户可以不关心渠道来检测代理

## 0.1.0

### Minor Changes

- 支持 ip-info 通道检测
- 支持 ip234 通道检测
- 添加多通道并发测试支持
