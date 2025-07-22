import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"
import type { PaginationParams } from "@/types/patient"

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .transform((str) => new Date(str)),
})

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["firstName", "lastName", "email", "phoneNumber", "dob", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
}) satisfies z.ZodType<PaginationParams>

export const patientRouter = router({
  // Get paginated patients with search and sorting
  getAll: protectedProcedure.input(paginationSchema).query(async ({ ctx, input }) => {
    const { page, limit, search, sortBy, sortOrder } = input
    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phoneNumber: { contains: search } },
          ],
        }
      : {}

    // Build orderBy clause
    const orderBy = { [sortBy]: sortOrder }

    try {
      // Get total count for pagination
      const total = await ctx.prisma.patient.count({ where })

      // Get patients with pagination and sorting
      const patients = await ctx.prisma.patient.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      })

      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch patients",
      })
    }
  }),

  // Get patient by ID - both admin and user can view
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    try {
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.id },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        })
      }

      return patient
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch patient",
      })
    }
  }),

  // Create patient - admin only
  create: adminProcedure.input(patientSchema).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.patient.create({
        data: input,
      })
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A patient with this email already exists",
        })
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create patient",
      })
    }
  }),

  // Update patient - admin only
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: patientSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.patient.update({
          where: { id: input.id },
          data: input.data,
        })
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Patient not found",
            })
          }
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A patient with this email already exists",
            })
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update patient",
        })
      }
    }),

  // Delete patient - admin only
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.patient.delete({
        where: { id: input.id },
      })
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        })
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete patient",
      })
    }
  }),
})
