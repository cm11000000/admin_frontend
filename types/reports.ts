/**
 * Comprehensive Report Types for SabPaisa Admin V5
 * Mobile-first, world-class reporting system
 */

// ============= Base Filter Types =============

export interface DateRange {
  from: string;
  to: string;
}

export interface BaseReportFilter {
  dateRange: DateRange;
  clientCode?: string;
  page?: number;
  limit?: number;
}

// ============= Transaction Report Types =============

export interface TransactionReportFilter extends BaseReportFilter {
  status?: 'success' | 'failed' | 'pending' | 'all';
  paymentMethod?: string;
  gateway?: string;
  minAmount?: number;
  maxAmount?: number;
  groupBy?: 'date' | 'client' | 'payment_method' | 'gateway' | 'hour';
}

export interface TransactionReportData {
  transaction_id: string;
  client_code: string;
  client_name: string;
  amount: number;
  status: string;
  payment_method: string;
  gateway: string;
  transaction_date: string;
  merchant_txn_id?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface TransactionReportSummary {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  success_rate: number;
  total_amount: number;
  successful_amount: number;
  failed_amount: number;
  avg_transaction_amount: number;
}

export interface TransactionReportTrend {
  date: string;
  label: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_amount: number;
  successful_amount: number;
  success_rate: number;
}

export interface TransactionReportBreakdown {
  category: string;
  value: number;
  count: number;
  percentage: number;
  color?: string;
}

export interface TransactionReportResponse {
  summary: TransactionReportSummary;
  trends: TransactionReportTrend[];
  breakdown: {
    by_payment_method: TransactionReportBreakdown[];
    by_gateway: TransactionReportBreakdown[];
    by_status: TransactionReportBreakdown[];
  };
  transactions: TransactionReportData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============= Settlement Report Types =============

export interface SettlementReportFilter extends BaseReportFilter {
  status?: 'settled' | 'pending' | 'processing' | 'all';
  settlementId?: string;
}

export interface SettlementBatch {
  settlement_id: string;
  batch_number: string;
  settlement_date: string;
  total_amount: number;
  transaction_count: number;
  status: string;
  bank_reference?: string;
  utr_number?: string;
  client_code: string;
  client_name: string;
}

export interface SettlementTransaction {
  transaction_id: string;
  merchant_txn_id: string;
  amount: number;
  settlement_amount: number;
  commission: number;
  gst: number;
  transaction_date: string;
  settlement_date: string;
}

export interface SettlementReportSummary {
  total_settlements: number;
  total_amount: number;
  pending_settlements: number;
  pending_amount: number;
  avg_settlement_amount: number;
  total_commission: number;
  total_gst: number;
}

export interface SettlementReportResponse {
  summary: SettlementReportSummary;
  batches: SettlementBatch[];
  trends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SettlementDetailResponse {
  batch: SettlementBatch;
  transactions: SettlementTransaction[];
  summary: {
    total_transactions: number;
    gross_amount: number;
    net_amount: number;
    total_commission: number;
    total_gst: number;
  };
}

// ============= Chargeback Report Types =============

export interface ChargebackReportFilter extends BaseReportFilter {
  status?: 'open' | 'won' | 'lost' | 'pending' | 'all';
  reason?: string;
}

export interface ChargebackData {
  chargeback_id: string;
  transaction_id: string;
  merchant_txn_id: string;
  amount: number;
  reason: string;
  reason_code?: string;
  status: string;
  chargeback_date: string;
  resolution_date?: string;
  client_code: string;
  client_name: string;
  customer_email?: string;
  notes?: string;
}

export interface ChargebackReportSummary {
  total_chargebacks: number;
  open_chargebacks: number;
  won_chargebacks: number;
  lost_chargebacks: number;
  pending_chargebacks: number;
  win_rate: number;
  total_amount: number;
  recovered_amount: number;
  lost_amount: number;
}

export interface ChargebackReportResponse {
  summary: ChargebackReportSummary;
  chargebacks: ChargebackData[];
  trends: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  breakdown: {
    by_reason: TransactionReportBreakdown[];
    by_status: TransactionReportBreakdown[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============= Refund Report Types =============

export interface RefundReportFilter extends BaseReportFilter {
  status?: 'successful' | 'failed' | 'pending' | 'all';
  refundType?: 'full' | 'partial' | 'all';
}

export interface RefundData {
  refund_id: string;
  transaction_id: string;
  merchant_txn_id: string;
  original_amount: number;
  refund_amount: number;
  refund_type: 'full' | 'partial';
  status: string;
  refund_date: string;
  reason?: string;
  client_code: string;
  client_name: string;
  customer_email?: string;
  bank_reference?: string;
}

export interface RefundReportSummary {
  total_refunds: number;
  successful_refunds: number;
  failed_refunds: number;
  pending_refunds: number;
  success_rate: number;
  total_refund_amount: number;
  full_refunds: number;
  partial_refunds: number;
  avg_refund_amount: number;
}

export interface RefundReportResponse {
  summary: RefundReportSummary;
  refunds: RefundData[];
  trends: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  breakdown: {
    by_type: TransactionReportBreakdown[];
    by_status: TransactionReportBreakdown[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============= Analytics Report Types =============

export interface AnalyticsFilter extends BaseReportFilter {
  metrics?: string[];
  comparison?: 'previous_period' | 'previous_year' | 'none';
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage';
}

export interface AnalyticsTimeSeriesData {
  timestamp: string;
  label: string;
  transactions: number;
  amount: number;
  success_rate: number;
  avg_amount: number;
}

export interface AnalyticsClientPerformance {
  client_code: string;
  client_name: string;
  transactions: number;
  amount: number;
  success_rate: number;
  avg_amount: number;
  growth: number;
  rank: number;
}

export interface AnalyticsPaymentMethodStats {
  payment_method: string;
  transactions: number;
  amount: number;
  success_rate: number;
  percentage: number;
}

export interface AnalyticsGatewayStats {
  gateway: string;
  transactions: number;
  amount: number;
  success_rate: number;
  avg_response_time: number;
  uptime: number;
}

export interface AnalyticsReportResponse {
  overview: {
    key_metrics: AnalyticsMetric[];
    summary: TransactionReportSummary;
  };
  time_series: {
    hourly?: AnalyticsTimeSeriesData[];
    daily: AnalyticsTimeSeriesData[];
    weekly?: AnalyticsTimeSeriesData[];
    monthly?: AnalyticsTimeSeriesData[];
  };
  client_performance: {
    top_clients: AnalyticsClientPerformance[];
    client_distribution: TransactionReportBreakdown[];
  };
  payment_analysis: {
    by_method: AnalyticsPaymentMethodStats[];
    by_gateway: AnalyticsGatewayStats[];
  };
  geographic?: {
    by_state: TransactionReportBreakdown[];
    by_city: TransactionReportBreakdown[];
  };
  insights: {
    title: string;
    description: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }[];
}

// ============= Export Types =============

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportRequest {
  report_type: 'transactions' | 'settlements' | 'chargebacks' | 'refunds' | 'analytics';
  format: ExportFormat;
  filters: BaseReportFilter;
  columns?: string[];
  include_summary?: boolean;
}

export interface ExportResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  expires_at: string;
}

// ============= Chart Configuration Types =============

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'composed';

export interface ChartConfig {
  type: ChartType;
  title: string;
  description?: string;
  data_key: string;
  x_axis?: string;
  y_axis?: string;
  colors?: string[];
  show_legend?: boolean;
  show_grid?: boolean;
  responsive?: boolean;
}

// ============= Date Range Presets =============

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'custom';

export interface DateRangePresetConfig {
  label: string;
  getValue: () => DateRange;
}

// ============= Report Category Types =============

export interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  path: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

// ============= Custom Report Builder Types =============

export type DataSource = 'transactions' | 'refunds' | 'chargebacks' | 'settlements';
export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in' | 'not_in';
export type FilterLogic = 'AND' | 'OR';
export type AggregationFunction = 'sum' | 'count' | 'average' | 'min' | 'max';
export type SortDirection = 'asc' | 'desc';

export interface IReportFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: FilterLogic;
}

export interface IReportAggregation {
  id: string;
  function: AggregationFunction;
  field: string;
  alias?: string;
}

export interface ISortConfig {
  field: string;
  direction: SortDirection;
}

export interface ICustomReport {
  id: string;
  name: string;
  description: string;
  dataSource: DataSource;
  columns: string[];
  filters: IReportFilter[];
  aggregations?: IReportAggregation[];
  groupBy?: string[];
  sortBy?: ISortConfig[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  isPublic: boolean;
  tags?: string[];
}

export interface IReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  dataSource: DataSource;
  config: Omit<ICustomReport, 'id' | 'name' | 'description' | 'createdBy' | 'createdAt' | 'updatedAt'>;
  usageCount: number;
  rating?: number;
  isPredefined: boolean;
}

// ============= Scheduled Reports Types =============

export interface IScheduledReport {
  id: string;
  reportId: string;
  reportName: string;
  reportType: 'custom' | 'template';
  schedule: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  recipients: string[];
  format: ExportFormat;
  timezone: string;
  isActive: boolean;
  nextRun: string;
  lastRun?: IReportExecution;
  createdAt: string;
  createdBy: string;
  expiryDate?: string;
}

export interface IReportExecution {
  id: string;
  scheduledReportId: string;
  executedAt: string;
  status: 'success' | 'failed' | 'running';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  duration?: number;
  recordCount?: number;
}

// ============= Reconciliation Types =============

export interface IBankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference: string;
  type: 'credit' | 'debit';
  balance?: number;
  matched?: boolean;
  matchedTransactionId?: string;
}

export interface IReconciliationMatch {
  bankTransactionId: string;
  systemTransactionId: string;
  matchType: 'auto' | 'manual';
  confidence: number;
  matchedBy?: string;
  matchedAt: string;
}

export interface IReconciliationDiscrepancy {
  id: string;
  type: 'missing_in_system' | 'missing_in_bank' | 'amount_mismatch' | 'duplicate';
  bankTransaction?: IBankTransaction;
  systemTransaction?: any;
  difference?: number;
  status: 'pending' | 'resolved' | 'ignored';
  notes?: string;
}

export interface IReconciliationReport {
  id: string;
  period: DateRange;
  totalBankTransactions: number;
  totalSystemTransactions: number;
  matchedCount: number;
  unmatchedBankCount: number;
  unmatchedSystemCount: number;
  discrepancyCount: number;
  totalBankAmount: number;
  totalSystemAmount: number;
  difference: number;
  matches: IReconciliationMatch[];
  discrepancies: IReconciliationDiscrepancy[];
  status: 'in_progress' | 'completed' | 'requires_review';
  createdAt: string;
  completedAt?: string;
}

// ============= Financial Reports Types =============

export interface IRevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  change: number;
  transactions: number;
}

export interface ITaxBreakdown {
  taxType: 'CGST' | 'SGST' | 'IGST' | 'TDS';
  amount: number;
  rate: number;
  taxableAmount: number;
  transactions: number;
}

export interface IProfitLoss {
  revenue: {
    gross: number;
    net: number;
    byCategory: IRevenueBreakdown[];
  };
  costs: {
    gatewayCharges: number;
    operatingCosts: number;
    other: number;
    total: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  period: DateRange;
}

export interface ICashFlow {
  period: DateRange;
  inflows: {
    transactions: number;
    refundsReversed: number;
    other: number;
    total: number;
  };
  outflows: {
    refunds: number;
    settlements: number;
    charges: number;
    other: number;
    total: number;
  };
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

export interface IFinancialReport {
  period: DateRange;
  revenue: IRevenueBreakdown[];
  tax: ITaxBreakdown[];
  profitLoss: IProfitLoss;
  cashFlow: ICashFlow;
  generatedAt: string;
}

// ============= Insights & Analytics Types =============

export type InsightType = 'anomaly' | 'trend' | 'forecast' | 'alert' | 'recommendation';
export type InsightImpact = 'high' | 'medium' | 'low';
export type InsightCategory = 'revenue' | 'performance' | 'fraud' | 'operations' | 'customer';

export interface IInsight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  impact: InsightImpact;
  priority: number;
  data: any;
  action?: {
    label: string;
    url?: string;
    callback?: string;
  };
  createdAt: string;
  expiresAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  dismissedBy?: string;
}

export interface ICohortData {
  cohort: string;
  period: string;
  customers: number;
  revenue: number;
  retention: number;
  value: number;
}

export interface IGeoData {
  state?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  transactions: number;
  amount: number;
  customers: number;
}

export interface ICustomerSegment {
  segment: string;
  customers: number;
  avgLifetimeValue: number;
  avgTransactionValue: number;
  frequency: number;
  revenue: number;
  percentage: number;
}

export interface IAdvancedAnalytics {
  period: DateRange;
  cohortAnalysis: ICohortData[];
  geoAnalysis: IGeoData[];
  customerSegments: ICustomerSegment[];
  insights: IInsight[];
  predictions: {
    nextPeriodRevenue: number;
    nextPeriodTransactions: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  };
}
