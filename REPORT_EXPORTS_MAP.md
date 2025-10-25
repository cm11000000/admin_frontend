Report Exports — Client-Side vs Server-Side

Scope
- Lists report endpoints the app fetches as JSON from the Report API, then converts to CSV/XLSX/PDF in the browser (no server-side export endpoint).
- Also points to pages that use server-generated CSV (analytics) for context.

Client-Side Converted (fetch JSON, convert in code)
- Admin Transaction History
  - Endpoint: transactions/GetAdminTxnHistory/
  - Fetch: sabpaisa_admin_v5/services/api/TransactionApiService.ts:695
  - Export: sabpaisa_admin_v5/app/(dashboard)/transactions/page.tsx:272
  - Notes: Builds a CSV string on the client from the first-page or full list (length=0, page=0) and downloads via Blob.

- Refund Transaction History
  - Endpoint: transactions/GetRefundTxnHistory/
  - Fetch: sabpaisa_admin_v5/services/api/ReportApiService.ts:150
  - Export: sabpaisa_admin_v5/app/(dashboard)/reports/view-refunds/page.tsx:209
  - Notes: Uses SheetJS (xlsx) to generate an XLSX file client-side.

- Chargeback Transaction History
  - Endpoint: transactions/GetChargebackTxnHistory/
  - Fetch: sabpaisa_admin_v5/services/api/ReportApiService.ts:166
  - Export: sabpaisa_admin_v5/app/(dashboard)/reports/chargebacks/page.tsx:7351
  - Notes: Uses SheetJS to generate XLSX locally; the “Chargebacks” module also supports a separate admin export route, but the Reports page converts locally.

- Settled Transaction History
  - Endpoint: transactions/GetSettledTxnHistory/
  - Fetch: sabpaisa_admin_v5/services/api/ReportApiService.ts:1122
  - Export: sabpaisa_admin_v5/app/(dashboard)/reports/settlements/page.tsx:138
  - Notes: Builds CSV client-side from the JSON payload and downloads.

Server-Generated CSV (downloaded directly)
- Analytics CSV endpoints (Report API)
  - success_trends: sabpaisa_admin_v5/app/(dashboard)/reports/insights/page.tsx:199
  - mode_mix: sabpaisa_admin_v5/app/(dashboard)/reports/insights/page.tsx:207
  - funnel: sabpaisa_admin_v5/app/(dashboard)/reports/insights/page.tsx:215
  - failure_reasons: sabpaisa_admin_v5/app/(dashboard)/reports/insights/page.tsx:223
  - endpoint_health: sabpaisa_admin_v5/app/(dashboard)/reports/endpoint-health/page.tsx:91
  - refund_sla: sabpaisa_admin_v5/app/(dashboard)/refunds/analytics/page.tsx:99
  - chargeback_sla: sabpaisa_admin_v5/app/(dashboard)/chargebacks/analytics/page.tsx:99
  - settlement_aging: sabpaisa_admin_v5/app/(dashboard)/reports/settlement-aging/page.tsx:100
  - client_leaderboard: sabpaisa_admin_v5/app/(dashboard)/reports/client-leaderboard/page.tsx:85
  - referral_trends: sabpaisa_admin_v5/app/(dashboard)/reports/referral-trends/page.tsx:63
  - sbicard_summary: sabpaisa_admin_v5/app/(dashboard)/reports/sbi-card/page.tsx:195
  - Mechanism: sabpaisa_admin_v5/services/api/AnalyticsApiService.ts:88 (downloadCsv) posts with csv_flag and downloads blob.

Related Notes
- Custom reports (builder) export directly in the browser using utilities:
  - CSV/Excel/PDF helpers: sabpaisa_admin_v5/lib/exportUtils.ts:12, sabpaisa_admin_v5/lib/exportUtils.ts:52, sabpaisa_admin_v5/lib/exportUtils.ts:114
  - Example usage: sabpaisa_admin_v5/app/(dashboard)/reports/custom/page.tsx:166, :168, :178

Admin API Exports (non-report; for reference)
- Generic: POST /reports/export → sabpaisa_admin_v5/services/api/ReportApiService.ts:240
- Reconciliation export: POST /reports/reconciliation/export → sabpaisa_admin_v5/services/api/ReportApiService.ts:583
- Financial export: POST /reports/financial/export → sabpaisa_admin_v5/services/api/ReportApiService.ts:607
- Settlement CSV preview/confirm: POST /settlement/get_csv/ and /settlement/settlement_csv/ → sabpaisa_admin_v5/services/api/SettlementApiService.ts:193, :358

Gaps (configured keys without concrete endpoint mapping)
- The following client methods use BaseApiService.downloadFile with endpoint keys that aren’t in config/apiConfig.ts (not used by the above report pages):
  - transactionExport: sabpaisa_admin_v5/services/api/TransactionApiService.ts:455
  - refundExport: sabpaisa_admin_v5/services/api/RefundApiService.ts:414
  - paymentLinkExport: sabpaisa_admin_v5/services/api/PaymentLinkApiService.ts:424
  - qrCodeBulkExport: sabpaisa_admin_v5/services/api/PaymentLinkApiService.ts:436
  - If needed, add endpoint mappings in sabpaisa_admin_v5/config/apiConfig.ts to enable these.

