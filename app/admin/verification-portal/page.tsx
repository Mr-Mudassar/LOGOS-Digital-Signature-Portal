'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

export default function VerificationPortalPage() {
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [signatureId, setSignatureId] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name)
    }
  }

  const handleVerify = () => {
    // Verification logic will go here
    console.log('Verifying document...')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Search className="w-8 h-8 text-primary" />
          Document Verification
        </h1>
        <p className="text-gray-600 mt-2">
          Upload a signed document or enter a Lagos State Signature ID to verify validity.
        </p>
      </div>

      {/* Verification Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-3xl">
        {/* Upload Section */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Upload Signed Document</h3>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                id="file-upload"
              />
              <span className="inline-block px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                Choose file
              </span>
            </label>
            <span className="text-sm text-gray-600">{selectedFile || 'No file chosen'}</span>
            <span className="text-sm text-gray-500 ml-auto">
              PDF with embedded Lagos digital signature
            </span>
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-sm text-gray-500">OR</span>
          </div>
        </div>

        {/* Signature ID Section */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Enter Signature ID</h3>
          <input
            type="text"
            placeholder="LAG-SIG-2025-000123"
            value={signatureId}
            onChange={(e) => setSignatureId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Verify Document
        </button>
      </div>
    </div>
  )
}
