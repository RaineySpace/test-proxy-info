import { describe, it, expect } from 'vitest';
import { testProxyInfo, TestProxyChannel } from '../../src/index';

describe('IPCC 通道集成测试', () => {
  it('应该返回有效的 IP 信息', async () => {
    const result = await testProxyInfo({ channel: TestProxyChannel.IPCC });

    expect(result.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(result.country).toBeTruthy();
    expect(result.channel).toBe(TestProxyChannel.IPCC);
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('返回结果应该包含所有必要字段', async () => {
    const result = await testProxyInfo({ channel: TestProxyChannel.IPCC });

    expect(result).toHaveProperty('ip');
    expect(result).toHaveProperty('country');
    expect(result).toHaveProperty('province');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('timezone');
    expect(result).toHaveProperty('latency');
    expect(result).toHaveProperty('channel');
  });
});
