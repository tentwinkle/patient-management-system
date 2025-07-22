"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { trpc } from "@/components/providers/trpc-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Phone, Calendar, Save, X } from "lucide-react"
import { motion } from "framer-motion"
import type { Patient, PatientFormData } from "@/types/patient"

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dob: z.string().min(1, "Date of birth is required"),
}) satisfies z.ZodType<PatientFormData>

interface PatientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
  onSuccess?: () => void
}

export function PatientForm({ open, onOpenChange, patient, onSuccess }: PatientFormProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dob: "",
    },
  })

  // Reset form when dialog opens/closes or patient changes
  useEffect(() => {
    if (open && patient) {
      // Editing existing patient - populate form
      setValue("firstName", patient.firstName)
      setValue("lastName", patient.lastName)
      setValue("email", patient.email)
      setValue("phoneNumber", patient.phoneNumber)
      setValue("dob", new Date(patient.dob).toISOString().split("T")[0])
    } else if (open && !patient) {
      // Adding new patient - reset form
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dob: "",
      })
    }
  }, [open, patient, setValue, reset])

  const createMutation = trpc.patient.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient created successfully",
      })
      void utils.patient.getAll.invalidate()
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateMutation = trpc.patient.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient updated successfully",
      })
      void utils.patient.getAll.invalidate()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: PatientFormData) => {
    if (patient) {
      updateMutation.mutate({
        id: patient.id,
        data: data,
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-semibold">{patient ? "Update Patient" : "Add New Patient"}</DialogTitle>
          <DialogDescription>
            {patient
              ? "Update the patient information below."
              : "Fill in the patient information to create a new record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="John"
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                />
              </div>
              {errors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {errors.firstName.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Doe"
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                />
              </div>
              {errors.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {errors.lastName.message}
                </motion.p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john.doe@example.com"
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="+1-555-0123"
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
            </div>
            {errors.phoneNumber && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.phoneNumber.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
              Date of Birth
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="dob"
                type="date"
                {...register("dob")}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
            </div>
            {errors.dob && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.dob.message}
              </motion.p>
            )}
          </motion.div>

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-11 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && <Save className="mr-2 h-4 w-4" />}
                {patient ? "Update Patient" : "Create Patient"}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
