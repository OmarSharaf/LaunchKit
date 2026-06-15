import { isFeatureEnabled } from './feature-flags'

describe('isFeatureEnabled', () => {
  const original = process.env

  beforeEach(() => {
    process.env = { ...original }
  })

  afterEach(() => {
    process.env = original
  })

  it('returns true when env is true', () => {
    process.env.FEATURE_AUDIT_LOG = 'true'
    expect(isFeatureEnabled('AUDIT_LOG')).toBe(true)
  })

  it('returns false when env is false', () => {
    process.env.FEATURE_API_KEYS = 'false'
    expect(isFeatureEnabled('API_KEYS')).toBe(false)
  })

  it('uses defaults for known flags', () => {
    delete process.env.FEATURE_AUDIT_LOG
    expect(isFeatureEnabled('AUDIT_LOG')).toBe(true)
  })

  it('returns false for unknown flags', () => {
    expect(isFeatureEnabled('UNKNOWN_FLAG')).toBe(false)
  })
})
