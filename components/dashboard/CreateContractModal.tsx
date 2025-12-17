'use client'

import axios from 'axios'
import { useState } from 'react'
import { X, Upload } from 'lucide-react'

interface CreateContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (contractId: string) => void
}

export default function CreateContractModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateContractModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    initiatorName: '',
    initiatorEmail: '',
    receiverName: '',
    receiverEmail: '',
    userContext: '',
    category: 'OTHER',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const MDA_OPTIONS = [
    { value: 'HOUSING', label: 'Housing' },
    { value: 'LAND', label: 'Land' },
    { value: 'CIVIL_SERVICE_COMMISSION', label: 'Civil Service Commission' },
    { value: 'MINISTRY_OF_JUSTICE', label: 'Ministry of Justice' },
    { value: 'OTHER', label: 'Other' },
  ]

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Create the contract with names
      const contractResponse = await axios.post('/api/contracts', {
        title: formData.title,
        initiatorName: formData.initiatorName,
        initiatorEmail: formData.initiatorEmail,
        receiverName: formData.receiverName,
        receiverEmail: formData.receiverEmail,
        userContext: formData.userContext,
        category: formData.category,
        referenceDocumentName: file?.name,
      })

      const contractId = contractResponse.data.contract.id

      // Step 2: Generate contract using OpenAI
      const formDataObj = new FormData()
      formDataObj.append('contractId', contractId)
      formDataObj.append('userContext', formData.userContext || '')
      formDataObj.append('initiatorName', formData.initiatorName)
      formDataObj.append('receiverName', formData.receiverName)
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
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      initiatorName: '',
      initiatorEmail: '',
      receiverName: '',
      receiverEmail: '',
      userContext: '',
      category: 'OTHER',
    })
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
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-6">
            Define the contract, upload the document, and configure parties and providers.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Contract Title */}
            <div>
              <label className="label">Contract Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="e.g. Housing Lease Agreement for Flat 3B, Yaba"
                required
              />
            </div>

            {/* MDA Category */}
            <div>
              <label className="label">MDA Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
              >
                {MDA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the Ministry, Department, or Agency this contract relates to
              </p>
            </div>

            {/* Upload Document */}
            <div>
              <label className="label">Upload Document</label>
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
              <label className="label">Primary Party (Initiator)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.initiatorName}
                  onChange={(e) => setFormData({ ...formData, initiatorName: e.target.value })}
                  className="input-field"
                  placeholder="Full Name"
                  required
                />
                <input
                  type="email"
                  value={formData.initiatorEmail}
                  onChange={(e) => setFormData({ ...formData, initiatorEmail: e.target.value })}
                  className="input-field"
                  placeholder="Email Address"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email is optional - Leave empty to use your account email
              </p>
            </div>

            {/* Counterparty */}
            <div>
              <label className="label">Counterparty (Second Party)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  className="input-field"
                  placeholder="Full Name"
                  required
                />
                <input
                  type="email"
                  value={formData.receiverEmail}
                  onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                  className="input-field"
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>

            {/* Additional Context (Optional) */}
            <div>
              <label className="label">Additional Context (Optional)</label>
              <textarea
                value={formData.userContext}
                onChange={(e) => setFormData({ ...formData, userContext: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Add any additional context or instructions for the contract..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Continue to Workflow Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
