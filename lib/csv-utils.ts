/**
 * CSV Import/Export Utilities for Rate Mapping
 */

import Papa from 'papaparse'
import type { IRateConfig, IRateImportResult, IRateValidationError } from '@/types/rateMapping'

/**
 * Parse CSV file and convert to rate configurations
 */
export async function parseRateCSV(file: File): Promise<IRateImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importResult = processRateData(results.data)
        resolve(importResult)
      },
      error: () => {
        resolve({
          success: false,
          totalRows: 0,
          successCount: 0,
          errorCount: 0,
          errors: []
        })
      }
    })
  })
}

/**
 * Process parsed CSV data and validate
 */
function processRateData(data: any[]): IRateImportResult {
  const errors: { row: number; errors: IRateValidationError[] }[] = []
  const importedRates: Partial<IRateConfig>[] = []
  let successCount = 0

  data.forEach((row, index) => {
    const rowNumber = index + 2
    const rowErrors = validateRateRow(row)

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, errors: rowErrors })
    } else {
      const rateConfig = mapRowToRateConfig(row)
      importedRates.push(rateConfig)
      successCount++
    }
  })

  return {
    success: errors.length === 0,
    totalRows: data.length,
    successCount,
    errorCount: errors.length,
    errors,
    importedRates: errors.length === 0 ? (importedRates as IRateConfig[]) : undefined
  }
}

/**
 * Validate individual CSV row
 */
function validateRateRow(row: any): IRateValidationError[] {
  const errors: IRateValidationError[] = []

  if (!row.gateway || row.gateway.trim() === '') {
    errors.push({
      field: 'gateway',
      message: 'Gateway is required',
      severity: 'error'
    })
  }

  if (!row.paymentMode || row.paymentMode.trim() === '') {
    errors.push({
      field: 'paymentMode',
      message: 'Payment mode is required',
      severity: 'error'
    })
  }

  const merchantMDR = parseFloat(row.merchantMDR)
  if (isNaN(merchantMDR)) {
    errors.push({
      field: 'merchantMDR',
      message: 'Merchant MDR must be a valid number',
      severity: 'error'
    })
  } else if (merchantMDR < 0 || merchantMDR > 100) {
    errors.push({
      field: 'merchantMDR',
      message: 'Merchant MDR must be between 0 and 100',
      severity: 'error'
    })
  }

  const gatewayMDR = parseFloat(row.gatewayMDR)
  if (isNaN(gatewayMDR)) {
    errors.push({
      field: 'gatewayMDR',
      message: 'Gateway MDR must be a valid number',
      severity: 'error'
    })
  } else if (gatewayMDR < 0 || gatewayMDR > 100) {
    errors.push({
      field: 'gatewayMDR',
      message: 'Gateway MDR must be between 0 and 100',
      severity: 'error'
    })
  }

  if (!isNaN(merchantMDR) && !isNaN(gatewayMDR) && merchantMDR > gatewayMDR) {
    errors.push({
      field: 'merchantMDR',
      message: 'Merchant MDR must be less than or equal to Gateway MDR',
      severity: 'error'
    })
  }

  const fixedCharge = parseFloat(row.fixedCharge || '0')
  if (isNaN(fixedCharge) || fixedCharge < 0) {
    errors.push({
      field: 'fixedCharge',
      message: 'Fixed charge must be a non-negative number',
      severity: 'error'
    })
  }

  const minAmount = parseFloat(row.minAmount || '0')
  const maxAmount = parseFloat(row.maxAmount || '0')

  if (!isNaN(minAmount) && !isNaN(maxAmount) && minAmount > maxAmount) {
    errors.push({
      field: 'minAmount',
      message: 'Minimum amount must be less than maximum amount',
      severity: 'error'
    })
  }

  const settlementCycle = parseInt(row.settlementCycle || '1')
  if (isNaN(settlementCycle) || settlementCycle < 0 || settlementCycle > 365) {
    errors.push({
      field: 'settlementCycle',
      message: 'Settlement cycle must be between 0 and 365 days',
      severity: 'error'
    })
  }

  const priority = parseInt(row.priority || '1')
  if (isNaN(priority) || priority < 1 || priority > 100) {
    errors.push({
      field: 'priority',
      message: 'Priority must be between 1 and 100',
      severity: 'error'
    })
  }

  return errors
}

/**
 * Map CSV row to Rate Config object
 */
function mapRowToRateConfig(row: any): Partial<IRateConfig> {
  return {
    gateway: row.gateway.trim(),
    gatewayId: row.gatewayId?.trim() || row.gateway.trim(),
    paymentMode: row.paymentMode.trim(),
    paymentModeId: row.paymentModeId?.trim() || row.paymentMode.trim(),
    subCategory: row.subCategory?.trim() || undefined,
    subCategoryId: row.subCategoryId?.trim() || row.subCategory?.trim(),
    merchantMDR: parseFloat(row.merchantMDR),
    gatewayMDR: parseFloat(row.gatewayMDR),
    fixedCharge: parseFloat(row.fixedCharge || '0'),
    minAmount: parseFloat(row.minAmount || '0'),
    maxAmount: parseFloat(row.maxAmount || '0'),
    settlementCycle: parseInt(row.settlementCycle || '1'),
    isActive: row.isActive?.toLowerCase() === 'true' || row.isActive === '1',
    priority: parseInt(row.priority || '1'),
    effectiveFrom: row.effectiveFrom || new Date().toISOString()
  }
}

/**
 * Export rate configurations to CSV
 */
export function exportRatesToCSV(
  rates: IRateConfig[],
  filename: string = 'rate-configurations.csv'
): void {
  const csvData = rates.map((rate) => ({
    Gateway: rate.gateway,
    'Gateway ID': rate.gatewayId,
    'Payment Mode': rate.paymentMode,
    'Payment Mode ID': rate.paymentModeId,
    'Sub Category': rate.subCategory || '',
    'Sub Category ID': rate.subCategoryId || '',
    'Merchant MDR (%)': rate.merchantMDR,
    'Gateway MDR (%)': rate.gatewayMDR,
    'Fixed Charge (₹)': rate.fixedCharge,
    'Min Amount (₹)': rate.minAmount,
    'Max Amount (₹)': rate.maxAmount,
    'Settlement Cycle (days)': rate.settlementCycle,
    'Active': rate.isActive ? 'TRUE' : 'FALSE',
    'Priority': rate.priority,
    'Effective From': rate.effectiveFrom,
    'Effective To': rate.effectiveTo || ''
  }))

  const csv = Papa.unparse(csvData)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download CSV template for rate import
 */
export function downloadRateTemplate(): void {
  const template = [
    {
      gateway: 'Paytm',
      gatewayId: 'paytm',
      paymentMode: 'Credit Card',
      paymentModeId: 'credit_card',
      subCategory: 'Visa',
      subCategoryId: 'visa',
      merchantMDR: '1.5',
      gatewayMDR: '2.0',
      fixedCharge: '0',
      minAmount: '0',
      maxAmount: '0',
      settlementCycle: '2',
      isActive: 'TRUE',
      priority: '1',
      effectiveFrom: new Date().toISOString().split('T')[0]
    }
  ]

  const csv = Papa.unparse(template)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'rate-import-template.csv')
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Validate file before upload
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024

  if (!file.name.endsWith('.csv')) {
    return { valid: false, error: 'File must be a CSV file' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  return { valid: true }
}
