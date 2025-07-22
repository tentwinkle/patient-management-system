import { router } from "../trpc"
import { patientRouter } from "./patient"

export const appRouter = router({
  patient: patientRouter,
})

export type AppRouter = typeof appRouter
