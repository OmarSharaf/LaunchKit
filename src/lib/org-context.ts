import { cookies } from 'next/headers'

export const ACTIVE_ORG_COOKIE = 'active-org-id'

export async function getActiveOrgId(
  membershipOrgIds: string[]
): Promise<string | undefined> {
  if (membershipOrgIds.length === 0) return undefined

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

  if (fromCookie && membershipOrgIds.includes(fromCookie)) {
    return fromCookie
  }

  return membershipOrgIds[0]
}
