'use client'

import axios from 'axios'
import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface CreateContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (contractId: string) => void
}

// Zod validation schema
const contractSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(60, 'Title must not exceed 60 characters'),
  initiatorName: z.string().min(2, 'Name must be at least 2 characters'),
  initiatorEmail: z.string().email('Invalid email address'),
  receiverName: z.string().min(2, 'Name must be at least 2 characters'),
  receiverEmail: z.string().email('Invalid email address'),
  userContext: z.string().max(500, 'Context must not exceed 500 characters').optional(),
  category: z.string().min(1, 'Please select a category'),
})

type ContractFormData = z.infer<typeof contractSchema>

export default function CreateContractModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateContractModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const MDA_OPTIONS = [
    { value: 'HOUSING', label: 'Housing' },
    { value: 'LAND', label: 'Land' },
    { value: 'CIVIL_SERVICE_COMMISSION', label: 'Civil Service Commission' },
    { value: 'MINISTRY_OF_JUSTICE', label: 'Ministry of Justice' },
    { value: 'OTHER', label: 'Other' },
  ]

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: '',
      initiatorName: '',
      initiatorEmail: '',
      receiverName: '',
      receiverEmail: '',
      userContext: '',
      category: 'OTHER',
    },
  })

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('document')) {
        setError('Please upload a PDF or DOCX file')
        return
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const onSubmit = async (data: ContractFormData) => {
    setError('')

    try {
      // Step 1: Create the contract with names
      const contractResponse = await axios.post('/api/contracts', {
        title: data.title,
        initiatorName: data.initiatorName,
        initiatorEmail: data.initiatorEmail,
        receiverName: data.receiverName,
        receiverEmail: data.receiverEmail,
        userContext: data.userContext,
        category: data.category,
        referenceDocumentName: file?.name,
      })

      const contractId = contractResponse.data.contract.id

      // Step 2: Generate contract using OpenAI
      const formDataObj = new FormData()
      formDataObj.append('contractId', contractId)
      formDataObj.append('userContext', data.userContext || '')
      formDataObj.append('initiatorName', data.initiatorName)
      formDataObj.append('receiverName', data.receiverName)
      if (file) {
        formDataObj.append('referenceDocument', file)
      }

      await axios.post('/api/contracts/generate', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onSuccess(contractId)
      resetForm()
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while creating the contract')
    }
  }

  const resetForm = () => {
    form.reset()
    setFile(null)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h2 className="text-xl font-semibold text-gray-900">Create New Contract</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Define the contract, upload the document, and configure parties and providers.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contract Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Housing Lease Agreement for Flat 3B, Yaba"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MDA Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MDA Category</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        {MDA_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Select the Ministry, Department, or Agency this contract relates to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload Document */}
              <div>
                <FormLabel>Upload Document</FormLabel>
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        {file ? file.name : 'Choose File'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.doc"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Primary Party (Initiator) */}
              <div>
                <FormLabel>Primary Party (Initiator)</FormLabel>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <FormField
                    control={form.control}
                    name="initiatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initiatorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email" placeholder="Email Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Counterparty */}
              <div>
                <FormLabel>Counterparty (Second Party)</FormLabel>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <FormField
                    control={form.control}
                    name="receiverName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="receiverEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email" placeholder="Email Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Context (Optional) */}
              <FormField
                control={form.control}
                name="userContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                        placeholder="Add any additional context or instructions for the contract..."
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <p className="text-xs text-gray-500">{field.value?.length || 0}/500</p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="secondary"
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating...' : 'Continue to Workflow Setup'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
