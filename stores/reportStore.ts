import { create } from 'zustand';
import type {
  DateRange,
  TransactionReportFilter,
  RefundReportFilter,
  ChargebackReportFilter,
  AnalyticsFilter,
  TransactionReportResponse,
  RefundReportResponse,
  ChargebackReportResponse,
  AnalyticsReportResponse,
  ChartType,
  IInsight,
  IScheduledReport,
  IReportExecution,
} from '@/types/reports';

/**
 * Report Store State Interface
 * Manages all report-related state including filters, data, and UI preferences
 */
interface ReportState {
  // Transaction Report State
  transactionFilters: TransactionReportFilter;
  transactionReport: TransactionReportResponse | null;
  transactionLoading: boolean;

  // Refund Report State
  refundFilters: RefundReportFilter;
  refundReport: RefundReportResponse | null;
  refundLoading: boolean;

  // Chargeback Report State
  chargebackFilters: ChargebackReportFilter;
  chargebackReport: ChargebackReportResponse | null;
  chargebackLoading: boolean;

  // Analytics Report State
  analyticsFilters: AnalyticsFilter;
  analyticsReport: AnalyticsReportResponse | null;
  analyticsLoading: boolean;

  // Chart Type Preferences (persisted per report type)
  selectedChartType: {
    transactions?: ChartType;
    refunds?: ChartType;
    chargebacks?: ChartType;
    analytics?: ChartType;
  };

  // Insights State
  insights: IInsight[];
  dismissedInsights: string[];

  // Scheduled Reports State
  scheduledReports: IScheduledReport[];
  reportExecutions: Record<string, IReportExecution[]>;
}

/**
 * Report Store Actions Interface
 * Defines all actions available in the report store
 */
interface ReportActions {
  // Transaction Report Actions
  setTransactionFilters: (filters: Partial<TransactionReportFilter>) => void;
  setTransactionReport: (report: TransactionReportResponse | null) => void;
  setTransactionLoading: (loading: boolean) => void;
  resetTransactionFilters: () => void;

  // Refund Report Actions
  setRefundFilters: (filters: Partial<RefundReportFilter>) => void;
  setRefundReport: (report: RefundReportResponse | null) => void;
  setRefundLoading: (loading: boolean) => void;
  resetRefundFilters: () => void;

  // Chargeback Report Actions
  setChargebackFilters: (filters: Partial<ChargebackReportFilter>) => void;
  setChargebackReport: (report: ChargebackReportResponse | null) => void;
  setChargebackLoading: (loading: boolean) => void;
  resetChargebackFilters: () => void;

  // Analytics Report Actions
  setAnalyticsFilters: (filters: Partial<AnalyticsFilter>) => void;
  setAnalyticsReport: (report: AnalyticsReportResponse | null) => void;
  setAnalyticsLoading: (loading: boolean) => void;
  resetAnalyticsFilters: () => void;

  // Chart Type Actions
  setChartType: (reportType: 'transactions' | 'refunds' | 'chargebacks' | 'analytics', chartType: ChartType) => void;

  // Common Actions
  setDateRange: (dateRange: DateRange) => void;

  // Insights Actions
  setInsights: (insights: IInsight[]) => void;
  dismissInsight: (insightId: string) => void;
  undismissInsight: (insightId: string) => void;

  // Scheduled Reports Actions
  setScheduledReports: (reports: IScheduledReport[]) => void;
  updateScheduledReport: (reportId: string, report: IScheduledReport) => void;
  deleteScheduledReport: (reportId: string) => void;
  setReportExecutions: (reportId: string, executions: IReportExecution[]) => void;

  // Reset All
  resetAllFilters: () => void;
}

/**
 * Get default date range (last 30 days)
 */
const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    from: thirtyDaysAgo.toISOString().split('T')[0] as string,
    to: today.toISOString().split('T')[0] as string,
  };
};

/**
 * Default filters for each report type
 */
const defaultTransactionFilters: TransactionReportFilter = {
  dateRange: getDefaultDateRange(),
  status: 'all',
  page: 1,
  limit: 20,
};

const defaultRefundFilters: RefundReportFilter = {
  dateRange: getDefaultDateRange(),
  status: 'all',
  refundType: 'all',
  page: 1,
  limit: 20,
};

const defaultChargebackFilters: ChargebackReportFilter = {
  dateRange: getDefaultDateRange(),
  status: 'all',
  page: 1,
  limit: 20,
};

const defaultAnalyticsFilters: AnalyticsFilter = {
  dateRange: getDefaultDateRange(),
  comparison: 'previous_period',
  page: 1,
  limit: 20,
};

/**
 * Report Store
 * Central state management for all reports in the application
 */
export const useReportStore = create<ReportState & ReportActions>((set) => ({
  // Initial State
  // Transaction Report
  transactionFilters: defaultTransactionFilters,
  transactionReport: null,
  transactionLoading: false,

  // Refund Report
  refundFilters: defaultRefundFilters,
  refundReport: null,
  refundLoading: false,

  // Chargeback Report
  chargebackFilters: defaultChargebackFilters,
  chargebackReport: null,
  chargebackLoading: false,

  // Analytics Report
  analyticsFilters: defaultAnalyticsFilters,
  analyticsReport: null,
  analyticsLoading: false,

  // Chart Type Preferences
  selectedChartType: {
    transactions: 'line',
    refunds: 'line',
    chargebacks: 'line',
    analytics: 'composed',
  },

  // Insights
  insights: [],
  dismissedInsights: [],

  // Scheduled Reports
  scheduledReports: [],
  reportExecutions: {},

  // Transaction Report Actions
  setTransactionFilters: (filters) => {
    set((state) => ({
      transactionFilters: { ...state.transactionFilters, ...filters },
    }));
  },

  setTransactionReport: (report) => {
    set({ transactionReport: report });
  },

  setTransactionLoading: (loading) => {
    set({ transactionLoading: loading });
  },

  resetTransactionFilters: () => {
    set({ transactionFilters: defaultTransactionFilters });
  },

  // Refund Report Actions
  setRefundFilters: (filters) => {
    set((state) => ({
      refundFilters: { ...state.refundFilters, ...filters },
    }));
  },

  setRefundReport: (report) => {
    set({ refundReport: report });
  },

  setRefundLoading: (loading) => {
    set({ refundLoading: loading });
  },

  resetRefundFilters: () => {
    set({ refundFilters: defaultRefundFilters });
  },

  // Chargeback Report Actions
  setChargebackFilters: (filters) => {
    set((state) => ({
      chargebackFilters: { ...state.chargebackFilters, ...filters },
    }));
  },

  setChargebackReport: (report) => {
    set({ chargebackReport: report });
  },

  setChargebackLoading: (loading) => {
    set({ chargebackLoading: loading });
  },

  resetChargebackFilters: () => {
    set({ chargebackFilters: defaultChargebackFilters });
  },

  // Analytics Report Actions
  setAnalyticsFilters: (filters) => {
    set((state) => ({
      analyticsFilters: { ...state.analyticsFilters, ...filters },
    }));
  },

  setAnalyticsReport: (report) => {
    set({ analyticsReport: report });
  },

  setAnalyticsLoading: (loading) => {
    set({ analyticsLoading: loading });
  },

  resetAnalyticsFilters: () => {
    set({ analyticsFilters: defaultAnalyticsFilters });
  },

  // Chart Type Actions
  setChartType: (reportType, chartType) => {
    set((state) => ({
      selectedChartType: {
        ...state.selectedChartType,
        [reportType]: chartType,
      },
    }));
  },

  // Common Actions
  setDateRange: (dateRange) => {
    set((state) => ({
      transactionFilters: { ...state.transactionFilters, dateRange },
      refundFilters: { ...state.refundFilters, dateRange },
      chargebackFilters: { ...state.chargebackFilters, dateRange },
      analyticsFilters: { ...state.analyticsFilters, dateRange },
    }));
  },

  // Insights Actions
  setInsights: (insights) => {
    set({ insights });
  },

  dismissInsight: (insightId) => {
    set((state) => ({
      dismissedInsights: [...state.dismissedInsights, insightId],
      insights: state.insights.map((insight) =>
        insight.id === insightId ? { ...insight, dismissed: true } : insight
      ),
    }));
  },

  undismissInsight: (insightId) => {
    set((state) => ({
      dismissedInsights: state.dismissedInsights.filter((id) => id !== insightId),
      insights: state.insights.map((insight) =>
        insight.id === insightId ? { ...insight, dismissed: false } : insight
      ),
    }));
  },

  // Scheduled Reports Actions
  setScheduledReports: (reports) => {
    set({ scheduledReports: reports });
  },

  updateScheduledReport: (reportId, report) => {
    set((state) => ({
      scheduledReports: state.scheduledReports.map((r) =>
        r.id === reportId ? report : r
      ),
    }));
  },

  deleteScheduledReport: (reportId) => {
    set((state) => ({
      scheduledReports: state.scheduledReports.filter((r) => r.id !== reportId),
    }));
  },

  setReportExecutions: (reportId, executions) => {
    set((state) => ({
      reportExecutions: {
        ...state.reportExecutions,
        [reportId]: executions,
      },
    }));
  },

  // Reset All Filters
  resetAllFilters: () => {
    set({
      transactionFilters: defaultTransactionFilters,
      refundFilters: defaultRefundFilters,
      chargebackFilters: defaultChargebackFilters,
      analyticsFilters: defaultAnalyticsFilters,
      transactionReport: null,
      refundReport: null,
      chargebackReport: null,
      analyticsReport: null,
    });
  },
}));
