import { describe, expect, test } from 'bun:test'
import type { ChannelPlanQuotaResult } from '@proma/shared'
import { shouldDisplayPlanQuota } from './channel-plan-quota-display'

function quota(overrides: Partial<ChannelPlanQuotaResult> = {}): ChannelPlanQuotaResult {
  return { supported: false, provider: 'custom', windows: [], updatedAt: 0, ...overrides }
}

describe('订阅额度区域的显示状态', () => {
  test('Given 尚未查询额度 When 判断显示状态 Then 不展示额度区域', () => {
    expect(shouldDisplayPlanQuota(null)).toBe(false)
  })

  test('Given 渠道明确不支持查询 When 原因文案变化或缺失 Then 始终隐藏额度区域', () => {
    for (const message of ['当前渠道不支持订阅 Plan 额度查询', '当前渠道不支持订阅 Plan 额度查询。', 'Quota is not supported', undefined]) {
      expect(shouldDisplayPlanQuota(quota({ shouldDisplay: false, message }))).toBe(false)
    }
  })

  test('Given 支持的渠道查询失败 When 返回错误原因 Then 保留额度错误区域', () => {
    expect(shouldDisplayPlanQuota(quota({ provider: 'openai-codex', message: '额度查询超时' }))).toBe(true)
  })

  test('Given 已读取额度窗口 When 判断显示状态 Then 显示额度区域', () => {
    expect(shouldDisplayPlanQuota(quota({
      supported: true,
      provider: 'openai-codex',
      windows: [{ type: '5h', label: '每 5 小时', usedPercent: 20, remainingPercent: 80 }],
    }))).toBe(true)
  })

  test('Given 查询成功但没有窗口 When 判断显示状态 Then 保留空数据说明', () => {
    expect(shouldDisplayPlanQuota(quota({ supported: true }))).toBe(true)
  })

  test('Given 查询失败返回恰好等于旧不支持文案的原因 When 未声明隐藏 Then 仍显示错误', () => {
    expect(shouldDisplayPlanQuota(quota({ message: '当前渠道不支持订阅 Plan 额度查询' }))).toBe(true)
  })
})
