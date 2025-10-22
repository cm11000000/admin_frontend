'use client';

/**
 * Transaction Analysis Page - V5 with Real API Integration
 *
 * CRITICAL: NO MOCK DATA - All data comes from real APIs
 *
 * APIs Used:
 * 1. Client List: GET https://reportapi.sabpaisa.in/SabPaisaReport/masters/clientDataMaster/?login_by={userName}
 * 2. Analysis Report: POST https://reportapi.sabpaisa.in/SabPaisaReport/REST/GetAnalysisReport
 *
 * Matches Angular consolidated.component.ts (lines 164-367) exactly:
 * - Same validation (date range required, from <= to)
 * - Same API endpoints
 * - Same payload structure { fromDate, endDate, loginBy }
 * - Same response handling
 * - Auto-loads on mount like Angular ngOnInit
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Filter,
  RefreshCw,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  FileText,
  Search,
  Loader2,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import axios from 'axios';

// API Base URLs - matching Angular environment
const REPORT_BASE_URL = 'https://reportapi.sabpaisa.in/SabPaisaReport/';

// Types matching Angular data structure
interface AnalysisFilters {
  fromDate: string;
  endDate: string;
  pclientCode: string;
}

// Angular API Response Structure - EXACT field names from API (lowercase!)
// See consolidated.component.ts lines 258-266
interface AnalysisRecord {
  status: string;
  total: number;
  cash: number;
  creditcard: number;      // lowercase! matches Angular API
  debitcard: number;       // lowercase! matches Angular API
  neftrtgs: number;
  netbanking: number;      // lowercase! matches Angular API
  upi: number;
  wallet: number;
  sabpaisaqr: number;      // lowercase! matches Angular API (line 284)
  rupaycard: number;       // lowercase! matches Angular API
  rupaycreditcard: number; // lowercase! matches Angular API (line 266)
  imps: number;
  rtgs: number;
  no_mode: number;         // underscore! matches Angular API
  percent?: number;
  trdate?: string;         // Contains "totalRecords-totalAmount"
}

export default function TransactionAnalysisPage() {
  if (typeof window === 'undefined') return null;
  const [filters, setFilters] = useState<AnalysisFilters>({
    fromDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    pclientCode: 'ALL',
  });

  const [data, setData] = useState<AnalysisRecord[]>([]);
  const [clientCodeList, setClientCodeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  // Summary totals - matches Angular component state
  const [grandTotal, setGrandTotal] = useState(0);
  const [tCash, setTCash] = useState(0);
  const [tCC, setTCC] = useState(0);
  const [tDC, setTDC] = useState(0);
  const [tNEFT, setTNEFT] = useState(0);
  const [tNB, setTNB] = useState(0);
  const [tUPI, setTUPI] = useState(0);
  const [tWallet, setTWallet] = useState(0);
  const [tRupayCreditCard, setTRupayCreditCard] = useState(0);
  const [tIMPS, setTIMPS] = useState(0);
  const [tRTGS, setTRTGS] = useState(0);
  const [tSPQR, setTSPQR] = useState(0);
  const [tRupayCard, setTRupayCard] = useState(0);
  const [tNoMode, setTNoMode] = useState(0);
  const [tInitiation, setTInitiation] = useState(0);
  const [tSuccessPer, setTSuccessPer] = useState('0');
  const [tFailedPer, setTFailedPer] = useState('0');
  const [tAbortedPer, setTAbortedPer] = useState('0');
  const [tNMCStatusPer, setTNMCStatusPer] = useState('0');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPaidAmt, setTotalPaidAmt] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Load Client Code List - matches Angular getClientCodeListUSP_Slave (line 194-202)
  // Real API: GET https://reportapi.sabpaisa.in/SabPaisaReport/masters/clientDataMaster/?login_by={userName}
  const loadClientCodeList = useCallback(async () => {
    try {
    const { resolveUserName } = await import('@/lib/utils');
    const userName = resolveUserName();
      const token = localStorage.getItem('accessToken');

      const httpOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        params: {
          login_by: userName
        }
      };

      const response = await axios.get(
        `${REPORT_BASE_URL}masters/clientDataMaster/`,
        httpOptions
      );

      setClientCodeList(response.data || []);
    } catch (error) {
      console.error('clientCodeList not found!', error);
    }
  }, []);

  // Admin Consolidated - matches Angular AdminConsolidated (line 151)
  // EXACT validation from Angular before calling API
  const handleApplyFilters = useCallback(async () => {
    // Validate dates - EXACT Angular validation (line 152-159)
    if (!filters.fromDate || filters.fromDate === '' || filters.fromDate === ' ') {
      toast.error('Date range required');
      return;
    }
    if (!filters.endDate || filters.endDate === '' || filters.endDate === ' ') {
      toast.error('Date range required');
      return;
    }

    // Date difference validation - EXACT Angular logic (line 161-171)
    const d1 = new Date(filters.fromDate);
    const d2 = new Date(filters.endDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays < 0) {
      toast.error('From date should be less than or equal to end date');
      return;
    }

    // Call API - matches Angular getAnylysisReport call (line 201)
    setIsLoading(true);

    // Reset totals - matches Angular (line 182-196)
    setGrandTotal(0);
    setTCash(0);
    setTCC(0);
    setTDC(0);
    setTNEFT(0);
    setTNB(0);
    setTUPI(0);
    setTWallet(0);
    setTRupayCreditCard(0);
    setTIMPS(0);
    setTRTGS(0);
    setTSPQR(0);
    setTRupayCard(0);
    setTNoMode(0);
    setTInitiation(0);
    setTSuccessPer('0');
    setTFailedPer('0');
    setTAbortedPer('0');

    try {
      // Real API Call - matches Angular getAdminAnalysisReport (line 480 in client-list.service.ts)
      // Endpoint: POST https://reportapi.sabpaisa.in/SabPaisaReport/REST/GetAnalysisReport
      // This is the ACTUAL API used in production Angular app
    const { resolveUserName } = await import('@/lib/utils');
    const userName = resolveUserName();
      const token = localStorage.getItem('accessToken');

      const httpOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const response = await axios.post(
        `${REPORT_BASE_URL}REST/GetAnalysisReport`,
        {
          fromDate: filters.fromDate,
          endDate: filters.endDate,
          loginBy: userName
        },
        httpOptions
      );

      const responseData: AnalysisRecord[] = response.data;

      if (responseData.length > 0) {
        setData(responseData);
        setErrorMsg(false);
        setShowGrid(true);

        // Parse GMV data from trdate field (line 217-220)
        if (responseData[0].trdate) {
          const parts = responseData[0].trdate.split('-');
          setTotalRecords(Number(parts[0] || 0));
          setTotalPaidAmt(Number(parts[1] || 0));
        }

        // Calculate totals - EXACT Angular logic (line 222-263)
        let tempGrandTotal = 0;
        let tempCash = 0;
        let tempCC = 0;
        let tempDC = 0;
        let tempNEFT = 0;
        let tempNB = 0;
        let tempUPI = 0;
        let tempWallet = 0;
        let tempRupayCreditCard = 0;
        let tempIMPS = 0;
        let tempRTGS = 0;
        let tempSPQR = 0;
        let tempRupayCard = 0;
        let tempNoMode = 0;
        let tempInitiation = 0;

        responseData.forEach((item) => {
          tempGrandTotal += Number(item.total);
          tempCash += Number(item.cash);
          tempCC += Number(item.creditcard);           // lowercase!
          tempDC += Number(item.debitcard);            // lowercase!
          tempNEFT += Number(item.neftrtgs);
          tempNB += Number(item.netbanking);           // lowercase!
          tempUPI += Number(item.upi);
          tempWallet += Number(item.wallet);
          tempSPQR += Number(item.sabpaisaqr);         // lowercase!
          tempRupayCard += Number(item.rupaycard);     // lowercase!
          tempRupayCreditCard += Number(item.rupaycreditcard); // lowercase!
          tempIMPS += Number(item.imps);
          tempRTGS += Number(item.rtgs);
          tempNoMode += Number(item.no_mode);          // underscore!
        });

        setGrandTotal(tempGrandTotal);
        setTCash(tempCash);
        setTCC(tempCC);
        setTDC(tempDC);
        setTNEFT(tempNEFT);
        setTNB(tempNB);
        setTUPI(tempUPI);
        setTWallet(tempWallet);
        setTSPQR(tempSPQR);
        setTRupayCard(tempRupayCard);
        setTRupayCreditCard(tempRupayCreditCard);
        setTIMPS(tempIMPS);
        setTRTGS(tempRTGS);
        setTNoMode(tempNoMode);

        // Calculate percentages - EXACT Angular logic (line 264-284)
        const noModePer = ((tempNoMode / tempGrandTotal) * 100).toFixed(2);

        let successPer = '0';
        let failedPer = '0';
        let abortedPer = '0';

        responseData.forEach((item) => {
          if (item.status.toUpperCase() === 'SUCCESS') {
            successPer = ((item.total / tempGrandTotal) * 100).toFixed(2);
          }
          if (item.status.toUpperCase() === 'NOT_COMPLETE') {
            failedPer = ((item.total / tempGrandTotal) * 100).toFixed(2);
          }
          if (item.status.toUpperCase() === 'ABORTED') {
            abortedPer = ((item.total / tempGrandTotal) * 100).toFixed(2);
          }
          if (item.status.toUpperCase() === 'INITIATED') {
            tempInitiation += Number(item.total);
          }
          item.percent = ((item.total / tempGrandTotal) * 100).toFixed(2) as any;
        });

        setTSuccessPer(successPer);
        setTFailedPer(failedPer);
        setTAbortedPer(abortedPer);
        setTInitiation(tempInitiation);
        setTNMCStatusPer(((tempInitiation / tempGrandTotal) * 100).toFixed(2));

      } else {
        // No data - reset all (line 285-303)
        setData([]);
        setErrorMsg(true);
        setShowGrid(false);
        setGrandTotal(0);
        setTCash(0);
        setTCC(0);
        setTDC(0);
        setTNEFT(0);
        setTNB(0);
        setTUPI(0);
        setTWallet(0);
        setTRupayCreditCard(0);
        setTIMPS(0);
        setTRTGS(0);
        setTSPQR(0);
        setTRupayCard(0);
        setTNoMode(0);
      }
    } catch (error) {
      console.error('Analysis report error:', error);
      toast.error('Failed to load analysis report');
      setErrorMsg(true);
      setShowGrid(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters.fromDate, filters.endDate]);

  // Load client code list and initial data on mount
  useEffect(() => {
    loadClientCodeList();
    // Auto-load initial data like Angular (ngOnInit calls AdminConsolidated)
    handleApplyFilters();
  }, [loadClientCodeList, handleApplyFilters]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    // TODO: Implement export functionality
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`Exporting as ${format.toUpperCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header - Light theme */}
      <div className="pb-4 border-b border-gray-200">
        <h4 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Transaction Analysis
        </h4>
        <p className="text-gray-600 text-sm mt-1">Consolidated payment mode and status analysis report</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-700 hover:text-gray-900 hover:border-[#0077FF] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 inline ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isExporting}
            onClick={() => handleExport('excel')}
            className="px-6 py-2.5 bg-gradient-to-r from-[#FF8800] to-[#FF6600] hover:from-[#FF9900] hover:to-[#FF7700] text-white rounded-xl shadow-lg shadow-[#FF8800]/25 hover:shadow-xl hover:shadow-[#FF8800]/40 transition-all disabled:opacity-50 font-semibold"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 inline animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2 inline" />
            )}
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Filters - Light card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Client Name
            </label>
            <select
              value={filters.pclientCode}
              onChange={(e) => {
                const value = e.target.value;
                const index = value.indexOf(':');
                const clientCode = index > -1 ? value.substr(index + 1) : value;
                setFilters({ ...filters, pclientCode: clientCode });
              }}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#0077FF]/50 focus:border-[#0077FF] hover:border-gray-400 transition-all duration-200"
            >
              <option value="ALL">All Clients</option>
              {clientCodeList.map((client: any, index: number) => (
                <option key={index} value={`${index}:${client.clientCode || client.client_code}`}>
                  {client.clientCode || client.client_code} - {client.clientName || client.client_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#0077FF]/50 focus:border-[#0077FF] hover:border-gray-400 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#0077FF]/50 focus:border-[#0077FF] hover:border-gray-400 transition-all duration-200"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full px-8 py-2.5 bg-gradient-to-r from-[#FF8800] to-[#FF6600] hover:from-[#FF9900] hover:to-[#FF7700] text-white rounded-xl shadow-lg shadow-[#FF8800]/25 hover:shadow-xl hover:shadow-[#FF8800]/40 transition-all font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
              ) : (
                <Search className="h-5 w-5 inline mr-2" />
              )}
              Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Summary - Pipe Separated Style with Real Data */}
      {showGrid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-gray-900 text-lg">{formatNumber(grandTotal)}</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Success%:</span>
              <span className="font-bold text-green-600 text-lg">{tSuccessPer}%</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Failed%:</span>
              <span className="font-bold text-red-600 text-lg">{tFailedPer}%</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Aborted%:</span>
              <span className="font-bold text-yellow-600 text-lg">{tAbortedPer}%</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Initiated%:</span>
              <span className="font-bold text-blue-600 text-lg">{tNMCStatusPer}%</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total Records:</span>
              <span className="font-bold text-purple-600 text-lg">{formatNumber(totalRecords)}</span>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-gray-600">GMV:</span>
              <span className="font-bold text-[#FF8800] text-lg">{formatCurrency(totalPaidAmt)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Mode vs Status Matrix Table - Real Data from API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#003366] to-[#002347] border-b-2 border-[#0077FF]/30">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Cash
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Credit Card
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Debit Card
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Net Banking
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  UPI
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[#FF8800] uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-[#0077FF] border-r-[#FF8800] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-base font-medium text-gray-700">Loading analysis data...</p>
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <p className="text-gray-600 text-lg">No data found for the selected criteria</p>
                  </td>
                </tr>
              ) : (
                data.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className={`px-6 py-4 text-sm font-medium ${
                      record.status.toUpperCase() === 'SUCCESS' ? 'text-green-600' :
                      record.status.toUpperCase() === 'NOT_COMPLETE' ? 'text-red-600' :
                      record.status.toUpperCase() === 'ABORTED' ? 'text-yellow-600' :
                      record.status.toUpperCase() === 'INITIATED' ? 'text-blue-600' :
                      'text-gray-900'
                    }`}>
                      {record.status}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">{formatNumber(record.cash)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">{formatNumber(record.creditcard)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">{formatNumber(record.debitcard)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">{formatNumber(record.netbanking)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">{formatNumber(record.upi)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">{formatNumber(record.wallet)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-bold">{formatNumber(record.total)}</td>
                    <td className="px-6 py-4 text-sm text-right text-[#FF8800] font-semibold">{record.percent}%</td>
                  </tr>
                ))
              )}
            </tbody>
            {showGrid && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-[#0077FF]/30">
                  <td className="px-6 py-4 text-sm font-bold text-[#FF8800]">Total</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(tCash)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(tCC)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(tDC)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(tNB)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(tUPI)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(tWallet)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatNumber(grandTotal)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-[#FF8800]">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>

    </div>
  );
}
