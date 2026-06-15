import {
  buildActivityFromMemberships,
  buildChartFromMemberships,
  getDashboardStats,
  getOnboardingSteps,
} from './dashboard-stats'

describe('dashboard-stats', () => {
  it('returns empty-state metrics when no user', () => {
    const { metrics, orgCount } = getDashboardStats(null)
    expect(orgCount).toBe(0)
    expect(metrics[0]?.value).toBe('0')
  })

  it('computes stats from memberships', () => {
    const { metrics, memberCount, activeSubs } = getDashboardStats({
      name: 'Alex',
      memberships: [
        {
          role: 'ADMIN',
          organization: {
            id: 'o1',
            name: 'Acme',
            members: [{ id: '1' }, { id: '2' }],
            subscription: { status: 'ACTIVE', currentPeriodEnd: new Date() },
          },
        },
      ],
    })
    expect(memberCount).toBe(2)
    expect(activeSubs).toBe(1)
    expect(metrics[0]?.value).toBe('1')
  })

  it('builds chart and activity data', () => {
    const memberships = [
      {
        role: 'ADMIN',
        organization: {
          id: 'o1',
          name: 'Acme',
          members: [{ id: '1' }],
          subscription: null,
        },
      },
    ]
    expect(buildChartFromMemberships(memberships)).toHaveLength(7)
    expect(buildActivityFromMemberships([]).length).toBeGreaterThan(0)
    expect(buildActivityFromMemberships(memberships)[0]?.action).toContain(
      'Acme'
    )
  })

  it('tracks onboarding progress', () => {
    const steps = getOnboardingSteps({
      memberships: [
        {
          role: 'ADMIN',
          organization: {
            id: 'o1',
            name: 'Acme',
            members: [{ id: '1' }, { id: '2' }],
            subscription: { status: 'ACTIVE', currentPeriodEnd: new Date() },
          },
        },
      ],
    })
    const byId = Object.fromEntries(steps.map((s) => [s.id, s.done]))
    expect(byId.org).toBe(true)
    expect(byId.team).toBe(true)
    expect(byId.billing).toBe(true)
    expect(byId.env).toBe(false)
    expect(byId.brand).toBe(false)
  })
})
