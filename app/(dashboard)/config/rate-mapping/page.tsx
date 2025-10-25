'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRateMappingStore } from '@/stores/rateMappingStore'
import RateMappingApiService from '@/services/api/RateMappingApiService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Client {
  id: string
  clientCode: string
  clientName: string
  contact: string
  email: string
  status: 'Active' | 'Inactive'
  configStatus: 'Configured' | 'Pending' | 'Incomplete'
}

interface PaymentModeGroup {
  aggregator: string
  modes: {
    id: string
    name: string
    selected: boolean
  }[]
}

interface EndpointConfig {
  paymentMode: string
  endpoint: string
  priority: number
}

interface RateSlab {
  id: string
  fromAmount: number
  toAmount: number
  rate: number
  commType: 'Percentage' | 'Fixed'
  convFee: number
  gst: 'Inclusive' | 'Exclusive'
}

export default function RateMappingPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [countPerPage, setCountPerPage] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  // 3-Step Wizard State
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [paymentModeGroups, setPaymentModeGroups] = useState<PaymentModeGroup[]>([])
  const [endpointConfigs, setEndpointConfigs] = useState<EndpointConfig[]>([])
  const [rateSlabs, setRateSlabs] = useState<RateSlab[]>([])
  const [editingSlab, setEditingSlab] = useState<RateSlab | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockClients: Client[] = [
        {
          id: '1',
          clientCode: 'CLI001',
          clientName: 'ABC Corporation',
          contact: '+91 9876543210',
          email: 'contact@abc.com',
          status: 'Active',
          configStatus: 'Configured'
        },
        {
          id: '2',
          clientCode: 'CLI002',
          clientName: 'XYZ Enterprises',
          contact: '+91 9876543211',
          email: 'info@xyz.com',
          status: 'Active',
          configStatus: 'Pending'
        },
        {
          id: '3',
          clientCode: 'CLI003',
          clientName: 'Tech Solutions Ltd',
          contact: '+91 9876543212',
          email: 'support@tech.com',
          status: 'Inactive',
          configStatus: 'Incomplete'
        }
      ]
      setClients(mockClients)
    } catch (error) {
      toast.error('Failed to load clients')
    } finally {
      setIsLoading(false)
    }
  }

  const openWizard = (client: Client) => {
    setSelectedClient(client)
    setWizardStep(1)

    // Initialize payment mode groups
    const mockGroups: PaymentModeGroup[] = [
      {
        aggregator: 'Razorpay',
        modes: [
          { id: '1', name: 'Credit Card', selected: false },
          { id: '2', name: 'Debit Card', selected: false },
          { id: '3', name: 'Net Banking', selected: false },
          { id: '4', name: 'UPI', selected: false }
        ]
      },
      {
        aggregator: 'PayU',
        modes: [
          { id: '5', name: 'Wallet', selected: false },
          { id: '6', name: 'EMI', selected: false },
          { id: '7', name: 'Pay Later', selected: false }
        ]
      }
    ]
    setPaymentModeGroups(mockGroups)
    setWizardOpen(true)
  }

  const handleWizardNext = () => {
    if (wizardStep === 1) {
      // Generate endpoint configs from selected payment modes
      const selectedModes = paymentModeGroups.flatMap(group =>
        group.modes.filter(mode => mode.selected).map(mode => ({
          paymentMode: mode.name,
          endpoint: '',
          priority: 1
        }))
      )
      setEndpointConfigs(selectedModes)
      setWizardStep(2)
    } else if (wizardStep === 2) {
      setWizardStep(3)
    }
  }

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1)
    }
  }

  const handleWizardSubmit = async () => {
    try {
      // Submit rate mapping configuration
      toast.success('Rate mapping configured successfully')
      setWizardOpen(false)
      setWizardStep(1)
      setSelectedClient(null)
      await loadInitialData()
    } catch (error) {
      toast.error('Failed to configure rate mapping')
    }
  }

  const addRateSlab = () => {
    const newSlab: RateSlab = {
      id: Date.now().toString(),
      fromAmount: 0,
      toAmount: 0,
      rate: 0,
      commType: 'Percentage',
      convFee: 0,
      gst: 'Inclusive'
    }
    setRateSlabs([...rateSlabs, newSlab])
  }

  const updateRateSlab = (id: string, updates: Partial<RateSlab>) => {
    setRateSlabs(rateSlabs.map(slab =>
      slab.id === id ? { ...slab, ...updates } : slab
    ))
  }

  const deleteRateSlab = (id: string) => {
    setRateSlabs(rateSlabs.filter(slab => slab.id !== id))
  }

  const filteredClients = clients.filter(client =>
    client.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
              Create Rate Mapping
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
              Configure rate mapping for clients
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Link href="/config/rate-mapping/manage">
              <Button variant="outline" className="min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm touch-manipulation border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950">
                Manage Rates
              </Button>
            </Link>
            <Link href="/config/rate-mapping/add-new">
              <Button variant="outline" className="min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm touch-manipulation border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950">
                Add New Pay Mode
              </Button>
            </Link>
          </div>
        </div>

        <Card className="p-4 md:p-6 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by client code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-[44px] w-full bg-gray-50/60 border-gray-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs md:text-sm text-gray-600">Count per page:</Label>
              <Select value={countPerPage} onValueChange={setCountPerPage}>
                <SelectTrigger className="min-h-[44px] w-24 bg-gray-50/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Client Code
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Name
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Contact
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Email
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Config Status
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-medium">
                        {client.clientCode}
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">
                        {client.clientName}
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">
                        {client.contact}
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">
                        {client.email}
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-center">
                        <Badge
                          variant={client.status === 'Active' ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-center">
                        <Badge
                          variant={
                            client.configStatus === 'Configured'
                              ? 'success'
                              : client.configStatus === 'Pending'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {client.configStatus}
                        </Badge>
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openWizard(client)}
                          className="min-h-[44px] px-4 md:px-6 py-2.5 text-xs md:text-sm touch-manipulation bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Rate Mapping
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* 3-Step Wizard Modal */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-gray-200/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Rate Mapping Configuration - {selectedClient?.clientName}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      wizardStep === step
                        ? 'bg-orange-500 text-gray-900'
                        : wizardStep > step
                        ? 'bg-green-500 text-gray-900'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {wizardStep > step ? '✓' : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 ${
                        wizardStep > step
                          ? 'bg-green-500'
                          : 'bg-gray-100'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Payment Modes</span>
              <span>Endpoint Config</span>
              <span>Rate Config</span>
            </div>
          </DialogHeader>

          <div className="mt-6">
            {/* Step 1: Payment Mode Selection */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Payment Modes
                </h3>
                {paymentModeGroups.map((group, groupIndex) => (
                  <div key={group.aggregator} className="border border-gray-300 rounded-lg p-4 bg-gray-50/40">
                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        checked={group.modes.every(m => m.selected)}
                        onCheckedChange={(checked) => {
                          const newGroups = [...paymentModeGroups]
                          newGroups[groupIndex].modes = newGroups[groupIndex].modes.map(m => ({
                            ...m,
                            selected: checked as boolean
                          }))
                          setPaymentModeGroups(newGroups)
                        }}
                      />
                      <span className="font-semibold text-gray-900">
                        {group.aggregator}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6">
                      {group.modes.map((mode, modeIndex) => (
                        <div key={mode.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={mode.selected}
                            onCheckedChange={(checked) => {
                              const newGroups = [...paymentModeGroups]
                              newGroups[groupIndex].modes[modeIndex].selected = checked as boolean
                              setPaymentModeGroups(newGroups)
                            }}
                          />
                          <Label className="text-sm text-gray-300">
                            {mode.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Endpoint Configuration */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configure Endpoints
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Payment Mode
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Endpoint
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {endpointConfigs.map((config, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                            {config.paymentMode}
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Input
                              value={config.endpoint}
                              onChange={(e) => {
                                const newConfigs = [...endpointConfigs]
                                newConfigs[index].endpoint = e.target.value
                                setEndpointConfigs(newConfigs)
                              }}
                              placeholder="Enter endpoint URL"
                              className="min-h-[44px] w-full"
                            />
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Input
                              type="number"
                              value={config.priority}
                              onChange={(e) => {
                                const newConfigs = [...endpointConfigs]
                                newConfigs[index].priority = parseInt(e.target.value)
                                setEndpointConfigs(newConfigs)
                              }}
                              className="min-h-[44px] w-20"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 3: Rate Configuration */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Configure Rate Slabs
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={addRateSlab}
                    className="min-h-[44px] px-4 md:px-6 py-2.5 text-xs md:text-sm touch-manipulation bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    + Add Slab
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          From
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          To
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Rate
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Comm Type
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Conv Fee
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          GST
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rateSlabs.map((slab) => (
                        <tr key={slab.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Input
                              type="number"
                              value={slab.fromAmount}
                              onChange={(e) => updateRateSlab(slab.id, { fromAmount: parseFloat(e.target.value) })}
                              className="min-h-[44px] w-24"
                            />
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Input
                              type="number"
                              value={slab.toAmount}
                              onChange={(e) => updateRateSlab(slab.id, { toAmount: parseFloat(e.target.value) })}
                              className="min-h-[44px] w-24"
                            />
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Input
                              type="number"
                              value={slab.rate}
                              onChange={(e) => updateRateSlab(slab.id, { rate: parseFloat(e.target.value) })}
                              className="min-h-[44px] w-24"
                            />
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Select
                              value={slab.commType}
                              onValueChange={(value: 'Percentage' | 'Fixed') =>
                                updateRateSlab(slab.id, { commType: value })
                              }
                            >
                              <SelectTrigger className="min-h-[44px] w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Percentage">Percentage</SelectItem>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Input
                              type="number"
                              value={slab.convFee}
                              onChange={(e) => updateRateSlab(slab.id, { convFee: parseFloat(e.target.value) })}
                              className="min-h-[44px] w-24"
                            />
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4">
                            <Select
                              value={slab.gst}
                              onValueChange={(value: 'Inclusive' | 'Exclusive') =>
                                updateRateSlab(slab.id, { gst: value })
                              }
                            >
                              <SelectTrigger className="min-h-[44px] w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inclusive">Inclusive</SelectItem>
                                <SelectItem value="Exclusive">Exclusive</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 md:px-6 py-2.5 md:py-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRateSlab(slab.id)}
                              className="min-h-[44px] px-4 md:px-6 py-2.5 text-xs md:text-sm touch-manipulation text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleWizardBack}
              disabled={wizardStep === 1}
              className="min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm touch-manipulation"
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setWizardOpen(false)}
                className="min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm touch-manipulation"
              >
                Cancel
              </Button>
              {wizardStep < 3 ? (
                <Button
                  variant="primary"
                  onClick={handleWizardNext}
                  className="min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm touch-manipulation bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleWizardSubmit}
                  className="min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm touch-manipulation bg-green-500 hover:bg-green-600 text-white"
                >
                  Submit
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
