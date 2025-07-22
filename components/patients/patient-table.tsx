"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { trpc } from "@/components/providers/trpc-provider"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PatientForm } from "./patient-form"
import { useToast } from "@/hooks/use-toast"
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Filter,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import { motion, AnimatePresence } from "framer-motion"
import type { Patient, PaginationParams } from "@/types/patient"
import { usePatientColumns } from "./use-patient-columns"

export function PatientTable() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Table state
  const [searchTerm, setSearchTerm] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Build query parameters
  const queryParams = useMemo<PaginationParams>(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch || undefined,
      sortBy: (sorting[0]?.id as PaginationParams["sortBy"]) || "createdAt",
      sortOrder: (sorting[0]?.desc ? "desc" : "asc") as "asc" | "desc",
    }),
    [pagination, debouncedSearch, sorting],
  )

  const { data, isLoading, error, refetch, isFetching } = trpc.patient.getAll.useQuery(queryParams)
  const utils = trpc.useUtils()

  const deleteMutation = trpc.patient.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
      void utils.patient.getAll.invalidate()
      setDeletingPatient(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const isAdmin = (session?.user as { role: string }).role === "ADMIN";

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      await refetch()
      toast({
        title: "Refreshed",
        description: "Patient data has been updated",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    }
  }

  const columns = usePatientColumns({
    isAdmin,
    onEdit: setEditingPatient,
    onDelete: setDeletingPatient,
  })

  // Create table instance
  const table = useReactTable({
    data: data?.patients || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.pagination.totalPages || 0,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-12"
      >
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Patients</h3>
          <p className="text-red-700 mb-4">We encountered an issue while fetching patient data.</p>
          <Button onClick={() => void refetch()} className="bg-red-600 hover:bg-red-700 transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Patient Management</h1>
              </div>
              <p className="text-blue-100">
                {data?.pagination.total || 0} patients registered • {data?.patients?.length || 0} showing
              </p>
            </div>
            {isAdmin && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-md"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name, email, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-[20%] transform -translate-y-1/2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    ×
                  </Button>
                </motion.div>
              )}
            </div>
            <div className="flex gap-3">
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-11 border-gray-300">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => void handleRefresh()}
                    disabled={isFetching}
                    className="h-11 px-4 border-gray-300 hover:bg-gray-50 transition-colors bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh patient data from server</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold text-gray-700 py-4">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center space-y-3"
                      >
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-gray-500">Loading patients...</p>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {searchTerm ? "No patients found" : "No patients yet"}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : "Get started by adding your first patient"}
                          </p>
                          {searchTerm ? (
                            <Button variant="outline" onClick={() => setSearchTerm("")}>
                              Clear search
                            </Button>
                          ) : isAdmin ? (
                            <Button onClick={() => setShowAddForm(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Patient
                            </Button>
                          ) : null}
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-500">Loading patients...</p>
                </div>
              </motion.div>
            ) : data?.patients?.length ? (
              data.patients.map((patient, index) => {
                const age = Math.floor(
                  (new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
                )

                return (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {patient.firstName[0]}
                              {patient.lastName[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">Patient ID: #{patient.id}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {age} years
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700">{patient.email}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-700">{patient.phoneNumber}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700">{format(new Date(patient.dob), "MMM dd, yyyy")}</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex space-x-2 pt-4 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPatient({ ...patient, dob: new Date(patient.dob), createdAt: new Date(patient.createdAt), updatedAt: new Date(patient.updatedAt) })}
                              className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4 mr-2 text-blue-600" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingPatient({ ...patient, dob: new Date(patient.dob), createdAt: new Date(patient.createdAt), updatedAt: new Date(patient.updatedAt) })}
                              className="flex-1 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white rounded-xl border border-gray-200"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No patients found" : "No patients yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first patient"}
                </p>
                {searchTerm ? (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear search
                  </Button>
                ) : isAdmin ? (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Button>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{pagination.pageIndex * pagination.pageSize + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{data.pagination.total}</span> patients
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1 px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    Page {pagination.pageIndex + 1} of {data.pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="hover:bg-blue-50 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add/Edit Patient Form */}
        <PatientForm
          open={showAddForm || !!editingPatient}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddForm(false)
              setEditingPatient(null)
            }
          }}
          patient={editingPatient}
          onSuccess={() => {
            setShowAddForm(false)
            setEditingPatient(null)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingPatient} onOpenChange={() => setDeletingPatient(null)}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-center">Delete Patient Record</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deletingPatient?.firstName} {deletingPatient?.lastName}
                </span>
                &apos;s record? This action cannot be undone and will permanently remove all patient data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-col-reverse gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingPatient && deleteMutation.mutate({ id: deletingPatient.id })}
                disabled={deleteMutation.isPending}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 transition-colors"
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Patient
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
