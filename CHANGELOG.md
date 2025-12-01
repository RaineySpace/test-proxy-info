# test-proxy-info

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
