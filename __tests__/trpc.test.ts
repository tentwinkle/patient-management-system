jest.mock('../lib/prisma', () => ({ prisma: {} }))
import { router, adminProcedure } from '../server/trpc'
import { TRPCError } from '@trpc/server'

type Context = {
  session: any
  prisma: any
}

const testRouter = router({
  adminOnly: adminProcedure.query(() => 'secret'),
})

const createCaller = (session: any) =>
  testRouter.createCaller({ session, prisma: {} })

describe('adminProcedure', () => {
  it('allows admin users', async () => {
    const caller = createCaller({ user: { id: '1', email: 'a', role: 'ADMIN' } })
    await expect(caller.adminOnly()).resolves.toBe('secret')
  })

  it('throws FORBIDDEN for non-admin users', async () => {
    const caller = createCaller({ user: { id: '1', email: 'a', role: 'USER' } })
    await expect(caller.adminOnly()).rejects.toBeInstanceOf(TRPCError)
  })

  it('throws UNAUTHORIZED when no session', async () => {
    const caller = createCaller(null)
    await expect(caller.adminOnly()).rejects.toBeInstanceOf(TRPCError)
  })
})
