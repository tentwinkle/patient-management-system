import { TRPCError, initTRPC } from "@trpc/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../lib/auth"
import { prisma } from "../lib/prisma"
import type { Session } from "next-auth"

interface CreateTRPCContextOptions {
  req: Request
}

export const createTRPCContext = async (opts: CreateTRPCContextOptions) => {
  const session = await getServerSession(authOptions)

  return {
    session,
    prisma,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: ctx.session as Session & {
        user: {
          id: string
          email: string
          name?: string | null
          image?: string | null
          role: string
        }
      },
      prisma: ctx.prisma,
    },
  })
})

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    })
  }
  return next({ ctx })
})
