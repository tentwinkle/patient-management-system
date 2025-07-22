jest.mock('../lib/prisma', () => ({ prisma: {} }))
import { appRouter } from '../server/routers/_app'
import { TRPCError } from '@trpc/server'

describe('patientRouter.getAll', () => {
  const session = { user: { id: '1', email: 'a', role: 'ADMIN' } }

  it('returns paginated patients', async () => {
    const patients = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phoneNumber: '123', dob: new Date(), createdAt: new Date(), updatedAt: new Date() },
    ]
    const prisma = {
      patient: {
        count: jest.fn().mockResolvedValue(patients.length),
        findMany: jest.fn().mockResolvedValue(patients),
      },
    }
    const caller = appRouter.createCaller({ session, prisma })
    const result = await caller.patient.getAll({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    })
    expect(prisma.patient.count).toHaveBeenCalled()
    expect(prisma.patient.findMany).toHaveBeenCalled()
    expect(result.patients).toEqual(patients)
    expect(result.pagination.total).toBe(patients.length)
  })

  it('throws TRPCError when prisma fails', async () => {
    const prisma = {
      patient: {
        count: jest.fn().mockRejectedValue(new Error('failed')),
        findMany: jest.fn(),
      },
    }
    const caller = appRouter.createCaller({ session, prisma })
    await expect(
      caller.patient.getAll({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'asc' })
    ).rejects.toBeInstanceOf(TRPCError)
  })
})
