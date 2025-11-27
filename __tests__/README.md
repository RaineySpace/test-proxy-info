# 测试文档

本目录包含 `test-proxy-info` 包的所有测试用例。

## 测试结构

```
__tests__/
├── common.test.ts        # 通用工具函数测试
├── ip234.test.ts         # IP234 测试通道测试
├── ip-info.test.ts       # IPInfo 测试通道测试
├── index.test.ts         # 主入口函数测试
├── integration.test.ts   # 集成测试（需要网络连接）
├── types.test.ts         # TypeScript 类型测试
├── example.test.ts       # 使用示例测试
└── README.md            # 本文件
```

## 运行测试

### 运行所有测试（不包括集成测试）

```bash
pnpm test
```

### 运行测试并监听文件变化

```bash
pnpm test:watch
```

### 运行测试并生成覆盖率报告

```bash
pnpm test:coverage
```

### 运行集成测试（需要网络连接）

```bash
pnpm test:integration
```

### 只运行单元测试（不需要网络）

```bash
pnpm test:unit
```

### 使用 UI 界面运行测试

```bash
pnpm test:ui
```

## 测试说明

### 单元测试

#### common.test.ts

测试通用工具函数：

- `getProxyUrl()` - 测试代理URL生成
  - 转换配置对象为URL字符串
  - 处理特殊字符
  - 直接返回字符串类型的URL
  - 处理不同端口号

- `createAxiosInstance()` - 测试Axios实例创建
  - 无代理配置时创建普通实例
  - 有代理配置时创建带代理的实例
  - 接受字符串类型的代理配置
  - 验证实例可用性

- `TestProxyError` - 测试错误类
  - 验证错误码支持（包括 MULTIPLE_CHANNEL_TEST_FAILED）
  - 验证错误数组支持

#### ip234.test.ts

测试 IP234 测试通道：

- `testProxyInfoByIp234()` - 测试代理测试功能
  - 无代理时获取IP信息
  - 使用代理配置对象
  - 使用代理URL字符串
  - 处理API返回空数据
  - 处理网络错误
  - 处理超时错误
  - 验证字段映射

使用 Mock 模拟 axios 请求，不需要实际网络连接。

#### ip-info.test.ts

测试 IPInfo 测试通道：

- `testProxyInfoByIpInfo()` - 测试代理测试功能
  - 无代理时获取IP信息
  - 使用代理配置对象
  - 使用代理URL字符串
  - 处理API返回空数据
  - 处理网络错误
  - 处理超时错误
  - 验证字段映射

使用 Mock 模拟 axios 请求，不需要实际网络连接。

#### index.test.ts

测试主入口函数：

- `testProxyInfo()` - 测试主测试函数
  - 调用不同测试通道
  - 传递不同类型的代理配置
  - 处理不支持的通道
  - 传播底层错误
  - 处理空代理配置
  - **默认通道测试** - 不指定通道时使用所有通道
  - **多通道测试** - 并发测试多个通道，返回最快成功的结果

- `TestProxyChannel` - 测试枚举
  - 验证枚举值
  - 检查导出

**注意**：`testProxyInfo` 函数签名为 `testProxyInfo(proxyConfig?, channel?)`，其中：
- `proxyConfig` 是第一个参数（可选）
- `channel` 是第二个参数（可选），默认使用所有通道

#### types.test.ts

TypeScript 类型测试：

- 验证所有接口和类型定义
- 验证函数签名
- 验证参数和返回值类型
- 验证联合类型支持

#### example.test.ts

使用示例测试：

- 演示各种使用方式
- 验证工具函数
- 验证代理测试函数

### 集成测试

#### integration.test.ts

集成测试需要实际的网络连接和（可选的）有效代理配置。

**环境变量：**

- `SKIP_INTEGRATION_TESTS` - 设置为 `true` 跳过集成测试（默认）
- `TEST_PROXY_URL` - 测试用代理 URL（如 `http://user:pass@proxy.example.com:8080`）

**测试内容：**

- 实际 API 调用
  - 获取本机IP信息（无代理，默认通道）
  - 获取本机IP信息（指定通道）
  - 直接调用测试函数
  - 使用 Axios 实例发送请求

- 代理测试（需要有效代理配置）
  - 通过代理获取IP信息
  - 使用代理URL字符串
  - 使用默认通道

- 错误处理
  - 无效的代理配置
  - 无效的代理URL

**运行集成测试：**

```bash
# 不使用代理测试
SKIP_INTEGRATION_TESTS=false pnpm test __tests__/integration.test.ts

# 使用代理测试（需要提供有效的代理配置）
TEST_PROXY_URL=http://user:pass@proxy.example.com:8080 \
SKIP_INTEGRATION_TESTS=false \
pnpm test __tests__/integration.test.ts
```

## 覆盖率

运行 `pnpm test:coverage` 后，会生成以下报告：

- 终端输出：文本格式的覆盖率摘要
- `coverage/index.html`：HTML 格式的详细覆盖率报告
- `coverage/coverage-final.json`：JSON 格式的覆盖率数据

目标覆盖率：

- 语句覆盖率：≥ 90%
- 分支覆盖率：≥ 85%
- 函数覆盖率：≥ 90%
- 行覆盖率：≥ 90%

## Mock 说明

### axios Mock

在单元测试中，我们使用 Vitest 的 `vi.mock()` 来模拟 axios：

```typescript
vi.mock('axios');

const mockAxiosInstance = {
  get: vi.fn().mockResolvedValue(mockResponse),
};

vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
```

这样可以在不发送实际网络请求的情况下测试代码逻辑。

### 模块 Mock

测试主入口函数时，我们模拟 ip234 和 ip-info 模块：

```typescript
vi.mock('../src/ip234');
vi.mock('../src/ip-info');

vi.mocked(ip234Module.default).mockResolvedValue(mockResult);
vi.mocked(ipInfoModule.default).mockResolvedValue(mockResult);
```

## 编写新测试

### 测试文件命名

- 单元测试：`*.test.ts`
- 集成测试：`integration.test.ts`
- 类型测试：`types.test.ts`

### 测试结构

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('功能模块名称', () => {
  beforeEach(() => {
    // 每个测试前的设置
    vi.clearAllMocks();
  });

  describe('子功能', () => {
    it('应该做某事', () => {
      // 准备
      const input = 'test';
      
      // 执行
      const result = someFunction(input);
      
      // 断言
      expect(result).toBe('expected');
    });
  });
});
```

### 异步测试

```typescript
it('应该处理异步操作', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 错误测试

```typescript
it('应该抛出错误', async () => {
  await expect(functionThatThrows()).rejects.toThrow('Expected error');
});
```

## 调试测试

### 单个测试文件

```bash
pnpm vitest run __tests__/common.test.ts
```

### 单个测试用例

在测试前添加 `.only`：

```typescript
it.only('应该只运行这个测试', () => {
  // 测试代码
});
```

### 跳过测试

在测试前添加 `.skip`：

```typescript
it.skip('暂时跳过这个测试', () => {
  // 测试代码
});
```

### 条件跳过

```typescript
it.skipIf(condition)('条件性跳过', () => {
  // 测试代码
});
```

## CI/CD 集成

在 CI/CD 环境中运行测试：

```bash
# 只运行单元测试（快速，不需要网络）
pnpm test:unit

# 运行所有测试包括集成测试
SKIP_INTEGRATION_TESTS=false pnpm test

# 生成覆盖率报告
pnpm test:coverage
```

## 常见问题

### Q: 测试运行很慢

A: 默认只运行单元测试，集成测试被跳过。如果需要运行集成测试，使用 `pnpm test:integration`。

### Q: 集成测试失败

A: 集成测试需要网络连接。检查网络状态，或设置 `SKIP_INTEGRATION_TESTS=true` 跳过。

### Q: 如何测试真实代理

A: 设置环境变量 `TEST_PROXY_URL` 并运行集成测试。

### Q: Mock 不生效

A: 确保在导入模块前调用 `vi.mock()`，并在每个测试后清理 mock。

## 最佳实践

1. **测试隔离**：每个测试应该独立运行，不依赖其他测试
2. **清理 Mock**：在 `beforeEach` 中清理 mock
3. **有意义的描述**：测试描述应该清楚说明测试目的
4. **AAA 模式**：Arrange（准备）、Act（执行）、Assert（断言）
5. **测试边界情况**：不仅测试正常情况，还要测试边界和错误情况
6. **保持简单**：每个测试只测试一个功能点
7. **避免测试实现细节**：测试行为而不是实现

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Vitest API 参考](https://vitest.dev/api/)
- [测试最佳实践](https://vitest.dev/guide/best-practices.html)
