/**
 * @jest-environment node
 */
import { GET } from './route'

const mockQueryRaw = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
  },
}))

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns ok when database is connected', async () => {
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }])
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.database).toBe('connected')
  })

  it('returns degraded when database fails', async () => {
    mockQueryRaw.mockRejectedValue(new Error('connection refused'))
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(503)
    expect(data.status).toBe('degraded')
  })
})
