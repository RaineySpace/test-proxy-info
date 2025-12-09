import { describe, it, expect } from 'vitest';
import { testProxyInfo, TestProxyChannel } from '../src/index';

const SKIP_INTEGRATION_TESTS = process.env.SKIP_INTEGRATION_TESTS !== 'false';

describe.skipIf(SKIP_INTEGRATION_TESTS)('集成测试 - 多通道', () => {
  it('使用默认通道（所有通道）应该返回有效结果', async () => {
    const result = await testProxyInfo();

    expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(result.country).toBeTruthy();
    expect(Object.values(TestProxyChannel)).toContain(result.channel);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('指定多个通道应该返回第一个成功的结果', async () => {
    const result = await testProxyInfo({
      channel: [TestProxyChannel.IP234, TestProxyChannel.IPInfo, TestProxyChannel.BigData],
    });

    expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(result.country).toBeTruthy();
    expect([TestProxyChannel.IP234, TestProxyChannel.IPInfo, TestProxyChannel.BigData]).toContain(result.channel);
  });

  it('返回结果应该包含所有必要字段', async () => {
    const result = await testProxyInfo();

    expect(result).toHaveProperty('ip');
    expect(result).toHaveProperty('country');
    expect(result).toHaveProperty('province');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('latency');
    expect(result).toHaveProperty('channel');

    expect(typeof result.ip).toBe('string');
    expect(typeof result.country).toBe('string');
    expect(typeof result.province).toBe('string');
    expect(typeof result.city).toBe('string');
    expect(typeof result.latency).toBe('number');
    expect(typeof result.channel).toBe('string');
  });
});
