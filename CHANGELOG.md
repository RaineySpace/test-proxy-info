# test-proxy-info

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
