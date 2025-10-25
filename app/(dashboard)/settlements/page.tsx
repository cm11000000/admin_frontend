'use client'

import React, { useState, useEffect } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { settlementService, SettlementUploadResponse, ImportBatch } from '@/services/api/SettlementApiService'
import { toast } from 'react-hot-toast'
import { DatePicker } from '@/components/ui/date-picker'
import { Combobox } from '@/components/ui/combobox'

export default function SettlementPage() {
  if (typeof window === 'undefined') return null as any;
  const [activeTab, setActiveTab] = useState<'settlement' | 'importBatch'>('settlement')
  const [selectedUploadType, setSelectedUploadType] = useState<'settlement' | 'refund' | 'chargeback'>('settlement')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResponses, setUploadResponses] = useState<SettlementUploadResponse[]>([])
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [filterBatchId, setFilterBatchId] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)

  const loadImportBatches = React.useCallback(async () => {
    setIsLoadingBatches(true)
    try {
      const filters = {
        batchId: filterBatchId || undefined,
        uploadDate: filterDate || undefined,
      }
      const batches = await settlementService.getImportBatches(filters)
      setImportBatches(batches)
    } catch (error: any) {
      console.error('Failed to load import batches:', error)
      toast.error(error.message || 'Failed to load import batches')
    } finally {
      setIsLoadingBatches(false)
    }
  }, [filterBatchId, filterDate])

  // Load import batches when tab changes
  useEffect(() => {
    if (activeTab === 'importBatch') {
      loadImportBatches()
    }
  }, [activeTab, loadImportBatches])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file
      const validation = settlementService.validateFile(file)
      if (!validation.valid) {
        toast.error(validation.errors.join(', '))
        e.target.value = '' // Reset input
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      let response: SettlementUploadResponse

      // Upload based on selected type
      if (selectedUploadType === 'settlement') {
        response = await settlementService.uploadSettlementFile(selectedFile)
      } else if (selectedUploadType === 'refund') {
        response = await settlementService.uploadRefundFile(selectedFile)
      } else {
        response = await settlementService.uploadChargebackFile(selectedFile)
      }

      setUploadResponses(prev => [response, ...prev])
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      if (response.status === 'success') {
        toast.success(`File uploaded successfully. ${response.recordsProcessed} records processed.`)
        // Refresh import batches if on that tab
        if (activeTab === 'importBatch') {
          loadImportBatches()
        }
      } else {
        toast.error(response.message || 'File upload failed')
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadFailures = async (batchId: string) => {
    try {
      await settlementService.downloadFailures(batchId)
      toast.success('Downloading failure records...')
    } catch (error: any) {
      console.error('Download failed:', error)
      toast.error(error.message || 'Failed to download failure records')
    }
  }

  const filteredBatches = importBatches.filter(batch => {
    const matchesBatchId = !filterBatchId || batch.batchId.toLowerCase().includes(filterBatchId.toLowerCase())
    const matchesDate = !filterDate || batch.uploadDate.includes(filterDate)
    return matchesBatchId && matchesDate
  })

  const toggleBatchExpansion = (batchId: string) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId)
  }

  const uploadTypeOptions = [
    { value: 'settlement', label: 'Settlement' },
    { value: 'refund', label: 'Refund' },
    { value: 'chargeback', label: 'Chargeback' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-1" style={{ letterSpacing: '-0.02em' }}>Settlement Management</h1>
            <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Upload and manage settlement files</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/90 rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('settlement')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-extrabold transition-all min-h-[52px] touch-manipulation ${
                activeTab === 'settlement'
                  ? 'bg-orange-500 text-white border-b-2 border-orange-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Settlement
            </button>
            <button
              onClick={() => setActiveTab('importBatch')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-extrabold transition-all min-h-[52px] touch-manipulation ${
                activeTab === 'importBatch'
                  ? 'bg-orange-500 text-white border-b-2 border-orange-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Import Batch
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            {/* Settlement Tab */}
            {activeTab === 'settlement' && (
              <div className="space-y-4 md:space-y-6">
                {/* Upload Section */}
                <div className="relative z-20 bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
                  <div className="mb-3 md:mb-4">
                    <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Upload Settlement File</h2>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Upload settlement, refund, or chargeback files</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    {/* Upload Type Selector */}
                    <div>
                      <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-2">Upload Type</label>
                      <Combobox
                        options={uploadTypeOptions}
                        value={selectedUploadType}
                        onChange={(value) => setSelectedUploadType(value as 'settlement' | 'refund' | 'chargeback')}
                        placeholder="Select upload type"
                      />
                    </div>

                    {/* File Input */}
                    <div>
                      <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-2">Select File</label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                        <div className="flex-1 relative">
                          <input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-pointer hover:border-gray-400 transition-colors min-h-[44px] touch-manipulation"
                          >
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs md:text-sm truncate">
                              {selectedFile ? selectedFile.name : 'Choose file...'}
                            </span>
                          </label>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={!selectedFile || isUploading}
                          className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-xs md:text-sm">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span className="text-xs md:text-sm">Upload →</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-600 mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>Supported formats: XLSX, XLS, CSV (Max 10MB)</p>
                    </div>
                  </div>
                </div>

                {/* Upload Response Table */}
                {uploadResponses.length > 0 && (
                  <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-3 md:p-4 border-b border-gray-200">
                      <h3 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Upload History</h3>
                      <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Recent file upload results</p>
                    </div>

                    {/* Mobile scroll hint */}
                    <div className="px-3 md:px-4 py-2 bg-gray-50 border-b border-gray-200 md:hidden">
                      <p className="text-[10px] text-gray-600 text-center">Scroll horizontally to see all columns</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>File Name</th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Status</th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Records</th>
                            <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(uploadResponses) && uploadResponses.map((response) => (
                            <tr key={response.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{response.fileName}</td>
                              <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm whitespace-nowrap">
                                {response.status === 'success' ? (
                                  <div className="flex items-center gap-1.5 md:gap-2 text-green-600">
                                    <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4 flex-shrink-0" />
                                    <span>Success</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 md:gap-2 text-red-600">
                                    <XCircle className="w-3.5 md:w-4 h-3.5 md:h-4 flex-shrink-0" />
                                    <span>Failed</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 whitespace-nowrap">{response.recordsProcessed}</td>
                              <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{response.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Batch Tab */}
            {activeTab === 'importBatch' && (
              <div className="space-y-4 md:space-y-6">
                {/* Filter Form */}
                <div className="relative z-20 bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
                  <div className="mb-3 md:mb-4">
                    <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Filter Batches</h2>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Search and filter import batches</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-2">Batch ID</label>
                      <input
                        type="text"
                        value={filterBatchId}
                        onChange={(e) => setFilterBatchId(e.target.value)}
                        placeholder="Search by batch ID..."
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-xs md:text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-2">Upload Date</label>
                      <DatePicker
                        value={filterDate}
                        onChange={(date) => setFilterDate(date)}
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mt-3 md:mt-4">
                    <button
                      onClick={() => {
                        setFilterBatchId('')
                        setFilterDate('')
                        loadImportBatches()
                      }}
                      className="px-4 md:px-6 py-2.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-xs md:text-sm min-h-[44px] touch-manipulation"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={loadImportBatches}
                      disabled={isLoadingBatches}
                      className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 text-xs md:text-sm min-h-[44px] touch-manipulation"
                    >
                      {isLoadingBatches ? 'Loading...' : 'Apply Filters →'}
                    </button>
                  </div>
                </div>

                {/* Results Table */}
                <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-3 md:p-4 border-b border-gray-200">
                    <h3 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Import Batches</h3>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>View and manage batch uploads</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {Array.isArray(filteredBatches) && filteredBatches.map((batch) => (
                      <div key={batch.id} className="bg-gray-50/50">
                        {/* Batch Header */}
                        <div
                          className="p-3 md:p-4 hover:bg-gray-100 transition-colors cursor-pointer touch-manipulation"
                          onClick={() => toggleBatchExpansion(batch.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                              <div>
                                <p className="text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">Batch ID</p>
                                <p className="text-xs md:text-sm font-medium text-orange-500 font-mono">{batch.batchId}</p>
                              </div>
                              <div>
                                <p className="text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">File Name</p>
                                <p className="text-xs md:text-sm text-gray-700 truncate">{batch.fileName}</p>
                              </div>
                              <div>
                                <p className="text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">Upload Date</p>
                                <p className="text-xs md:text-sm text-gray-700">{batch.uploadDate}</p>
                              </div>
                              <div>
                                <p className="text-[10px] md:text-xs text-gray-600 mb-0.5 md:mb-1">Records</p>
                                <p className="text-xs md:text-sm text-gray-900">
                                  <span className="text-green-600 font-semibold">{batch.successRecords}</span> / {batch.totalRecords}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <span className={`px-2 md:px-2.5 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap ${
                                  batch.status === 'completed'
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : batch.status === 'processing'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                  {batch.status}
                                </span>
                                {batch.failedRecords > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownloadFailures(batch.batchId)
                                    }}
                                    className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors min-h-[36px] touch-manipulation"
                                    title="Download failure records"
                                  >
                                    <Download className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {batch.failedRecords > 0 && (
                              <div className="ml-2 md:ml-4">
                                {expandedBatch === batch.id ? (
                                  <ChevronUp className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Failure Details */}
                        {expandedBatch === batch.id && batch.failures && batch.failures.length > 0 && (
                          <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                              <AlertCircle className="w-3.5 md:w-4 h-3.5 md:h-4 text-red-600 flex-shrink-0" />
                              <h4 className="text-xs md:text-sm font-semibold text-red-600">Failed Records ({batch.failedRecords})</h4>
                            </div>

                            {/* Mobile scroll hint */}
                            <div className="mb-2 md:hidden">
                              <p className="text-[10px] text-gray-600 text-center">Scroll horizontally to see all columns</p>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                  <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Record ID</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Account Number</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Amount</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Failure Reason</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.isArray(batch?.failures) && batch.failures.map((failure) => (
                                    <tr key={failure.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-orange-500 font-mono whitespace-nowrap">{failure.recordId}</td>
                                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 font-mono whitespace-nowrap">{failure.accountNumber}</td>
                                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 whitespace-nowrap">₹{failure.amount.toLocaleString()}</td>
                                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-red-600 whitespace-nowrap">{failure.reason}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 p-6 md:p-8 text-center mx-4">
              <Loader2 className="w-10 md:w-12 h-10 md:h-12 text-orange-500 animate-spin mx-auto mb-3 md:mb-4" />
              <p className="text-gray-900 font-medium text-sm md:text-base">Uploading file...</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Please wait while we process your file</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
