"use client"
import { useMemo } from "react"
import {
  Calendar,
  Edit,
  Mail,
  Phone,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Patient } from "@/types/patient"

export interface UsePatientColumnsProps {
  isAdmin: boolean
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

export function usePatientColumns({
  isAdmin,
  onEdit,
  onDelete,
}: UsePatientColumnsProps) {
  return useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Patient Name",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {row.original.firstName[0]}
                {row.original.lastName[0]}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {row.original.firstName} {row.original.lastName}
              </div>
              <div className="text-sm text-gray-500">Patient ID: #{row.original.id}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email Address",
        cell: ({ row }) => (
          <div className="flex items-center text-sm text-gray-900">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="truncate">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        cell: ({ row }) => (
          <div className="flex items-center text-sm text-gray-900">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span>{row.original.phoneNumber}</span>
          </div>
        ),
      },
      {
        accessorKey: "dob",
        header: "Age & DOB",
        cell: ({ row }) => {
          const age = Math.floor(
            (Date.now() - new Date(row.original.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          )
          return (
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                {age} years old
              </Badge>
              <div className="text-sm text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                {format(new Date(row.original.dob), "MMM dd, yyyy")}
              </div>
            </div>
          )
        },
      },
      ...(isAdmin
        ? [
            {
              id: "actions",
              header: () => <span className="font-semibold text-gray-700">Actions</span>,
              enableSorting: false,
              cell: ({ row }: { row: { original: Patient } }) => (
                <div className="flex justify-center space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row.original)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit patient</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit patient information</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete patient</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete patient record</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ),
            },
          ]
        : []),
    ],
    [isAdmin, onEdit, onDelete],
  )
}
