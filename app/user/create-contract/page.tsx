'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { FileSignature, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { LoadingButton } from '@/components/ui/loading-button'
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

// Zod validation schema - removed receiverName
const contractSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(60, 'Title must not exceed 60 characters'),
    initiatorName: z.string().min(2, 'Name must be at least 2 characters'),
    initiatorEmail: z.string().email('Invalid email address'),
    receiverEmail: z.string().email('Invalid email address'),
    userContext: z.string().max(500, 'Context must not exceed 500 characters').optional(),
    category: z.string().min(1, 'Please select a category'),
  })
  .refine((data) => data.initiatorEmail !== data.receiverEmail, {
    message: 'Second party email must be different from your email',
    path: ['receiverEmail'],
  })

type ContractFormData = z.infer<typeof contractSchema>

const MDA_OPTIONS = [
  { value: 'HOUSING', label: 'Housing' },
  { value: 'LAND', label: 'Land' },
  { value: 'CIVIL_SERVICE_COMMISSION', label: 'Civil Service Commission' },
  { value: 'MINISTRY_OF_JUSTICE', label: 'Ministry of Justice' },
  { value: 'OTHER', label: 'Other' },
]

export default function CreateContractPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: '',
      initiatorName: '',
      initiatorEmail: '',
      receiverEmail: '',
      userContext: '',
      category: 'OTHER',
    },
  })

  // Autofill initiator email with session user's email
  useEffect(() => {
    if (session?.user?.email) {
      form.setValue('initiatorEmail', session.user.email)
    }
  }, [session, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      const fileName = selectedFile.name.toLowerCase()
      const isDocx =
        fileName.endsWith('.docx') ||
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const isPdf = fileName.endsWith('.pdf') || selectedFile.type === 'application/pdf'

      if (!isDocx && !isPdf) {
        setError('Only DOCX and PDF files are supported. Please upload a valid document.')
        setFile(null)
        e.target.value = ''
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        setFile(null)
        e.target.value = ''
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const onSubmit = async (data: ContractFormData) => {
    setError('')

    try {
      // Create contract without receiverName
      const contractResponse = await axios.post('/api/contracts', {
        title: data.title,
        initiatorName: data.initiatorName,
        initiatorEmail: data.initiatorEmail,
        receiverName: '', // Will be filled when receiver signs up
        receiverEmail: data.receiverEmail,
        userContext: data.userContext,
        category: data.category,
        referenceDocumentName: file?.name,
      })

      const contractId = contractResponse.data.contract.id

      toast.loading('Generating contract...', { id: 'contract-generation' })

      // Generate contract
      const formDataObj = new FormData()
      formDataObj.append('contractId', contractId)
      formDataObj.append('userContext', data.userContext || '')
      formDataObj.append('initiatorName', data.initiatorName)
      formDataObj.append('receiverName', 'Second Party') // Placeholder
      if (file) {
        formDataObj.append('referenceDocument', file)
      }

      await axios.post('/api/contracts/generate', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Contract created successfully!', { id: 'contract-generation' })

      // Navigate to the contract page
      router.push(`/contracts/${contractId}`)

      // Reset form
      form.reset()
      setFile(null)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'An error occurred while creating the contract'
      setError(errorMessage)
      toast.error(errorMessage, { id: 'contract-generation' })
    }
  }

  return (
    <>
      <main className="max-w-8xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-primary" />
            Create New Contract
          </h1>
          <p className="text-gray-600 mt-2">Define the contract details and generate using AI</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <FormLabel>Contract Type</FormLabel>
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
                        Select the category this contract relates to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Upload Document */}
              <div>
                <FormLabel>Upload Reference Document (Optional)</FormLabel>
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        {file ? file.name : 'Choose DOCX or PDF File (Optional)'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">DOCX or PDF files, up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Primary Party */}
              <div>
                <FormLabel className="text-base font-semibold">Primary Party (Initiator)</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="initiatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            disabled
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This is your registered email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Second Party - Email Only */}
              <div>
                <FormLabel className="text-base font-semibold">Second Party</FormLabel>
                <FormField
                  control={form.control}
                  name="receiverEmail"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The second party&apos;s name will be captured when they sign up to sign the
                        contract
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Context */}
              <FormField
                control={form.control}
                name="userContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={4}
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

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/user/all-contracts')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  loading={form.formState.isSubmitting}
                  loadingText="Generating..."
                >
                  Generate Contract
                </LoadingButton>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </>
  )
}
