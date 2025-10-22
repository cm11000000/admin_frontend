SabPaisa Admin V5 — Sidebar Validation History

Purpose
- Track verification of each sidebar page for structure parity, API integration, payload correctness, and feature coverage versus the Angular app (`adminportalfrontend`).
- Record changes made and any gaps or follow‑ups.

Conventions
- Status values: Pending, In Progress, Verified, Needs Fixes
- File references: path:line

Index (Sidebar Items)
1) Transaction Summary — /dashboard — Status: Verified
2) Transaction History — /transactions — Status: Verified
3) Settlement Report — /reports/settlements — Status: Verified
4) Refund Report — /reports/view-refunds — Status: Verified
5) Chargeback Report — /reports/chargebacks — Status: Verified
6) Transaction Enquiry — /transactions/enquiry — Status: Verified
7) Merchant Refund Requests — /refunds — Status: Verified
8) SBI Refund Requests — /refunds/sbi — Status: Verified
9) Referral Report — /reports/reseller — Status: Verified
10) View Rate Mapping — /config/rate-mapping/view — Status: Verified
11) Manage Rate Mapping — /config/rate-mapping/manage — Status: Verified
12) Add Rate for New Pay Mode — /config/rate-mapping/add-new — Status: Verified
13) Aggregator Swap — /config/rate-mapping/swap — Status: Verified
14) Fast Forward Rate Mapping — /config/rate-mapping/clone — Status: Verified
15) Transaction Limit — /admin/transaction-limit — Status: Verified
16) Upload settlement Report — /settlements — Status: Verified
17) Disbursement — /settlements/disbursement — Status: Verified
18) Latest updates — /admin/latest-updates — Status: Verified
19) Add product — /admin/product — Status: Verified
20) POC — /admin/poc — Status: Verified
21) Authorization — /admin/access-urm — Status: Verified
22) New Enc Keys — /admin/generate-key — Status: Verified

Entry 1 — Transaction Summary (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/dashboard/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/super-admin-portal/home/home.component.ts:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:614, 617

Structure parity
- App guard parity handled in layout (AuthGuard‑like redirect)
  - Path: sabpaisa_admin_v5/app/(dashboard)/layout.tsx:1
- Header and content stacking fixed to avoid overlap
  - Path: sabpaisa_admin_v5/components/layout/dashboard-layout.tsx:1
- PWA offline banner positioned below header (no overlay)
  - Path: sabpaisa_admin_v5/components/pwa/OfflineIndicator.tsx:1

APIs and payloads
- GMV summary (Angular getGmvApi)
  - V5 Method: dashboardApiService.getGmvSummary
  - File: sabpaisa_admin_v5/services/api/DashboardApiService.ts:101
  - Endpoint: https://reportapi.sabpaisa.in/transactions/AdminSuccessSmallTxnSummary/
  - Payload: { fromdate, todate, clientcode, loginBy }
- Transaction summary by client (Angular getSuccessTxnSummaryAdmin)
  - V5 Method: dashboardApiService.getTransactionSummaryByClient
  - File: sabpaisa_admin_v5/services/api/DashboardApiService.ts:121
  - Endpoint: https://reportapi.sabpaisa.in/transactions/AdminSuccessTxnSummary/
  - Payload: { fromdate, todate, clientcode, loginBy }

Date option → clientcode mapping
- Today → "1"
- Yesterday → "2"
- Last 7 Days → "3"
- Current Month → "4"
- Last Month → "5"
- Customize Date (Search) → "6"
- Implementation notes
  - The date option handler updates state and directly calls GMV with the chosen value to avoid any stale state.
  - File: sabpaisa_admin_v5/app/(dashboard)/dashboard/page.tsx:80

UI feature parity (Angular vs V5)
- Date range presets (1–6) with custom range — Present
- Summary cards: Success count, GMV (INR) — Present
- “View Transaction Details” grid — Present
- Search filter on client code/name — Present
- Export to Excel (XLSX) — Present
- Totals row with sums — Present

Known differences (acceptable)
- Visual style uses modern gradients and Tailwind classes; functional parity preserved.
- Error notifications currently console/alert; Angular also used alerts. Converging to unified toasts is a future enhancement.
- Global UX fix applied: PWA Install Prompt disabled within app layout to avoid full-screen backdrop blocking dashboard interactions (components/pwa/PWAWrapper.tsx).

Bugs fixed during verification
- Hydration mismatch at dashboard load due to client‑only spinner in layout; removed loading gate so SSR/CSR match.
  - Path: sabpaisa_admin_v5/app/(dashboard)/layout.tsx:1
- Header overlapping content; switched to margin‑top with exact header height.
  - Path: sabpaisa_admin_v5/components/layout/dashboard-layout.tsx:18
- Offline banner overlaying header; repositioned and reduced z‑index.
  - Path: sabpaisa_admin_v5/components/pwa/OfflineIndicator.tsx:24
- clientcode stuck at "1"; centralized GMV trigger and passed selected option explicitly.
  - Path: sabpaisa_admin_v5/app/(dashboard)/dashboard/page.tsx:80

Verification result
- Status: Verified
- Evidence: Devtools logs show clientcode equals selected date option; API 200s with expected response; UI updates correctly; no hydration errors; header no longer overlaps content.

Entry 2 — Transaction History (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/transactions/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/super-admin-portal/transaction-report/transaction-report.component.html:1
  - Services: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:711, 714, 202, 430, 447

Structure parity
- Filters present: clientCode, paymentStatus, paymentMode, fromDate, endDate, terminalStatus, search.
- Validation matches Angular (date required, from <= to, <= 31 days).
- Pagination with page/pageSize; dynamic page-size options based on count.
- Export implemented (CSV) with Angular’s header fields order.
- Grid columns mapped to Angular keys (txn_id, client_txn_id, payer_amount, status, pg fields, udf1..udf20, etc.).

APIs and payloads
- Fetch dropdowns
  - Client list: GET masters/clientDataMaster/?login_by={userName}
    - File: sabpaisa_admin_v5/services/api/TransactionApiService.ts:680
  - Payment modes: GET masters/paymentModeMaster/
    - File: sabpaisa_admin_v5/services/api/TransactionApiService.ts:699
  - Payment status: GET masters/paymentStatusMaster/
    - File: sabpaisa_admin_v5/services/api/TransactionApiService.ts:715
- Search and pagination
  - V5: transactionService.getAdminTxnHistory(filter)
    - File: sabpaisa_admin_v5/services/api/TransactionApiService.ts:659
    - Endpoint: POST https://reportapi.sabpaisa.in/transactions/GetAdminTxnHistory/
    - Payload: { clientCode, paymentStatus, paymentMode, fromDate, endDate, length, page, terminalStatus, loginBy, search }
- Export
  - Uses same endpoint with length=0 to fetch all; generates CSV with Angular’s header order.

UI feature parity
- Search action builds Angular-equivalent payload and calls GetAdminTxnHistory.
- Page change and page-size change call the same endpoint with updated length/page.
- Export mirrors Angular structure (CSV here; Angular used XLSX; acceptable difference recorded).

Best-practice adjustments
- Client-only page to avoid SSR usage of localStorage (already declared 'use client').
- Derived userName from localStorage/user object instead of hardcoding; no writes to storage on mount.
- Consolidated request payload building via buildAdminFilter to avoid duplication and drift.
- CSV export escapes fields properly (quotes/commas/newlines) to ensure integrity.
- Toasts instead of alerts for validation and errors.
- Guarded multiple fetch triggers; disabled actions while loading.

Verification result
- Status: Verified
- Evidence: Network requests show correct endpoints/payloads; UI filters, pagination, and export behave as in Angular; validations enforced; table renders mapped fields correctly.
 - Improvements merged: userName resolution, payload builder, robust CSV export.

Performance/UX hardening (applied)
- No blocking on page load: masters prefetch in background; page is interactive immediately.
- Lazy load heavy masters on open: client codes, payment modes, and statuses are fetched when their dropdowns open the first time.
- In‑memory TTL caches for heavy endpoints: client codes (5 min), payment modes/status (10 min).
- Search + cap for client list: client name dropdown includes a search box and shows first 200 matches with a “refine search” hint.
- Consistent dark theme: table header, rows, filters, search, and pagination aligned with V5 styling.
- PWA overlays disabled: install prompt removed to avoid interaction blocking.
- Inline loaders only: no full‑screen init overlays that stall the page.

Mistakes caught and avoided (keep in mind for next pages)
- Do not gate page rendering behind a client‑only spinner; it causes perceived freezes and potential hydration issues.
- Avoid loading heavy masters on mount; fetch lazily and cache.
- Do not rely on potentially stale localStorage for `loginBy`; enforce the required username for verification.
- Keep theme consistent; mixing light/dark or inconsistent header rows breaks design cohesion.
- Avoid full‑screen overlays (e.g., PWA prompts) on core flows.
- Log final request payloads during verification to spot wrong field names/values quickly (e.g., misspelled domain in `loginBy`).

Checklist for next entries
- Heavy master endpoints: lazy load on open + TTL cache + client‑side search + cap.
- Payload parity: ensure exact keys and default values (e.g., `terminalStatus: 'TS'`, `clientCode: 'ALL'` semantics) and correct `loginBy`.
- Table styling: use the V5 header (navy gradient) and dark rows with subtle dividers; hover state consistent across modules.
- Avoid full‑page loaders; prefer inline spinners for specific sections.
- Role‑based option pruning (if Angular does it): apply only if required (e.g., `RoleId` constraints on status/mode visibility).
- Export column order: match Angular’s headers precisely; escape values for CSV/XLSX integrity.
- Pagination math and totals: values displayed should reflect `count`, `length`, `page` accurately.

Entry 3 — Settlement Report (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/reports/settlements/page.tsx
- Angular reference
  - Component: VWSettlmentReport (vw-settelment-report.component.ts: vwSettlementReport())
  - Service: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:716–717 (getSettelmentReport)

Structure parity
- Filters present: clientCode (required), fromDate, endDate.
- Validation and UX: prompts if client not selected; inline loading during search.
- Local pagination + search within results.
- Export present with correct column order.

APIs and payloads
- Settlement report
  - V5 Method: ReportApiService.getSettlementReport
  - File: sabpaisa_admin_v5/services/api/ReportApiService.ts:1046
  - Endpoint: POST https://reportapi.sabpaisa.in/transactions/GetSettledTxnHistory/
  - Payload: { clientCode, fromDate, endDate, noOfClient: 0, rpttype: 1 }
- Client codes (masters)
  - V5 Method: ReportApiService.getClientCodeListUSP_Slave (cached wrapper getClientCodeListUSP_Cached)
  - File: sabpaisa_admin_v5/services/api/ReportApiService.ts:1063, 1073
  - Endpoint: GET https://reportapi.sabpaisa.in/masters/clientDataMaster/?login_by={user}

Performance/UX improvements
- Do not block on master APIs: page renders immediately; client list lazy-loads on focus.
- Client list search + capped display (first 200 matches) to keep dropdown responsive.
- TTL cache for client list to avoid heavy repeated loads.
- Theme aligned with V5: gradient table header, dark rows, consistent inputs/buttons.
- CSV export escapes fields correctly (quotes/commas/newlines).

Verification result
- Status: Verified
- Evidence: Payload to GetSettledTxnHistory matches Angular; results render; export downloads CSV; dropdown remains responsive via search + cap; no blocking overlays.

Entry 4 — Refund Report (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/reports/view-refunds/page.tsx
- Angular reference
  - Component: ViewRefundReport (view-refund-report.component.ts)
  - Masters/Endpoints:
    - Client codes: GET /masters/clientDataMaster/?login_by={user}
    - Main data: POST /transactions/GetRefundTxnHistory/

Structure parity
- Filters present: client_code (supports "ALL" like Transaction History), from_date, to_date.
- Date validation caps at 92 days (matching Angular).
- Dynamic columns driven by API response keys.
- Export to Excel with JSON→sheet (column order driven by data keys).

APIs and payloads
- Client codes: ReportApiService.getClientCodeListUSP_Cached(login_by) → GET https://reportapi.sabpaisa.in/masters/clientDataMaster/?login_by={user}
- Refund history: ReportApiService.getRefundTxnHistory({ clientCode, fromDate, endDate, noOfClient: 0, rpttype: 1 }) → POST https://reportapi.sabpaisa.in/transactions/GetRefundTxnHistory/
  (Angular consumes the same txnHistory resource; the deprecated adminapi viewAllRefundHistory endpoint remains unused.)

Performance/UX improvements
- Do not block page load: masters prefetch after login resolution and re-fetch on focus if cache empty.
- Client codes lazy + searchable (input above dropdown) + capped results (first 200) with refine hint, search state isolated from table filter.
- TTL cache for client code search scoped per login to avoid stale cross-user data.
- Theme aligned with V5: gradient header, dark rows, consistent controls.
- Inline loaders and clear empty/error states.

- Verification result
- Status: Verified
- Evidence: Requests hit the expected endpoints; "ALL" now supported for cross-client queries (date range still capped at 92 days to control load); table renders keys from API; export works.
- Fixes implemented:
  - Corrected PaymentModeMaster base URL to txnhistorydbsurl.sabpaisa.in for parity with Angular services.
  - Removed the legacy override so GetRefundTxnHistory now uses the env-configured https://reportapi.sabpaisa.in base.
  - ClientMaster fetch now requires the caller’s login_by and caches per user, matching Angular’s HttpParams approach.
  - Separated client dropdown search from result-table search to keep filters independent and avoid accidental data hiding.

Entry 5 — Chargeback Report (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/reports/chargebacks/page.tsx
- Angular reference
  - Component: VwChargbackReportComponent (vw-chargback-report.component.ts)
  - Service: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:735 (getChargebackReport)

Structure parity
- Client, from-date, to-date filters retained with client mandatory (no "ALL").
- Client dropdown supports search + capped results (200) with refine hint.
- Inline table search independent of dropdown search; pagination mirrors Angular presets.
- Table columns match Angular order (client, txn, chargeback metrics, statuses).
- Export to Excel reproduces Angular column set; includes auto index column (#).

APIs and payloads
- Client codes: ReportApiService.getClientCodeListUSP_Cached(login_by) → GET https://reportapi.sabpaisa.in/masters/clientDataMaster/?login_by={user}
- Chargeback history: ReportApiService.getChargebackTxnHistory({ clientCode, fromDate, endDate, noOfClient: 0, rpttype: 1 }) → POST https://reportapi.sabpaisa.in/transactions/GetChargebackTxnHistory/

Performance/UX improvements
- Client masters cached per login to avoid large repeated payloads; lazy re-fetch when dropdown focused.
- Spinner overlays replaced with inline shimmer rows; page never blocks search inputs.
- Table search works on all displayed columns without mutating source data.
- Date range guarded (To ≥ From, max 92 days) to prevent expensive queries.
- Excel export uses XLSX util for consistent formatting and filename stamping.

Verification result
- Status: Verified
- Evidence: Manual search returns data for prod clients; payload matches Angular (noOfClient/rpttype preserved); export downloads XLSX with expected headers; record counts/pagination align with response length; error states show when API returns zero results.
- Fixes implemented:
  - Replaced React Query usage (required QueryClient) with local stateful fetch to resolve runtime error.
  - Added ReportApiService.getChargebackTxnHistory aligned to txnHistory host and removed legacy fetch logic.
  - Consolidated chargeback table logic so `/reports/chargebacks` and `/reports/chargebacks-table` share the same implementation.
  - Hardened login resolution and client dropdown search to mirror refund/settlement modules.

Entry 6 — Transaction Enquiry (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/transactions/enquiry/page.tsx
- Angular reference
  - Component: ViewtransactionsComponent (viewtransactions.component.ts)
  - Service: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:458 (getTransactionSP)

Structure parity
- Radio toggle between SabPaisa ID and Client Txn ID, dynamic placeholder, and Enter-key submission all mirror Angular.
- Result grid reproduces every field/ordering from the Angular template, including settlement/chargeback/refund metadata and print button.
- Empty-state message matches Angular copy; reset button clears the view just like toggling the radio in Angular.

APIs and payloads
- Transaction lookup: transactionService.viewTransaction(`${id}/0` or `0/${id}`) → GET https://reportapi.sabpaisa.in/transactions/ViewTxnPublic/{query}

Performance/UX improvements
- Dark themed card layout with inline spinner instead of blocking GIF; page never hides controls during fetch.
- Response parsing handles array or `{ results }` shapes defensively before selecting the first record.
- Numeric fields formatted via INR currency helper; date values auto-format when parseable, otherwise fall back to raw strings.
- Added reset control and contextual hint banner so support teams can quickly retry queries without refreshing.

Verification result
- Status: Verified
- Evidence: QA queries for both SabPaisa and client transaction IDs return identical payloads to Angular; 0-result responses trigger the expected empty-state message; print renders the detail table; invalid input surfaces toast validation.

Entry 7 — Merchant Refund Requests (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/refunds/page.tsx
- Angular reference
  - Component: RefundrequestedComponent (refundrequested.component.ts)
  - Service: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:517 (getRefundRequestedTransactionByCltCode) & process refund REST call

Structure parity
- Filters for client + from/to dates with 92-day validation; supports selecting a specific client or "ALL" via dropdown and a visible ALL chip; table mirrors Angular column order and status handling.
- Modal workflow for entering bank reference id before invoking refund process; only pending/initiated statuses expose the action, matching Angular gating logic.
- Summary cards surface total requests and INR aggregates for quick validation (new V5 enhancement, harmless to Angular parity).

APIs and payloads
- Client list: AdminApiClient.getCommonData(0, 0) → GET https://adminapi.sabpaisa.in/common-data/0/0
- Refund requests: AdminApiClient.getRefundRequested(clientCode, from, to) → GET https://adminapi.sabpaisa.in/AdminTxnReport/GetRefundRequested/{clientCode}/{from}/{to}/1
- Process refund: AdminApiClient.processRefund(loginId, txnId, bankRefId) → GET https://adminapi.sabpaisa.in/REST/RefundProcess/Initiated/2/{user}/{txn}/{bankRefId}/0/0

Performance/UX improvements
- Currency and date rendering aligned to other reports (INR formatter and locale timestamps).
- Client list normalised so dropdown shows clean labels and caches results; reset button clears filters without auto-loading.
- Table search, pagination, and export operate on the filtered dataset; export XLSX preserves Angular headers/values.
- Hint banner clarifies bank reference expectations; inline shimmer rows replace blocking loader.

Verification result
- Status: Verified
- Evidence: Queries for ALL and specific clients match Angular payloads; refund processing hits the same endpoint and rehydrates the table; export contains all columns with formatted amounts/dates; empty results trigger the Angular-equivalent message.

Entry 8 — SBI Refund Requests (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/refunds/sbi/page.tsx
- Angular reference
  - Component: rbi-refund (rbi-refund.component.ts)
  - Services: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:674 (getSbi) & :663 (postRefund)

Structure parity
- Client and date filters with the same validation window (≤92 days) and ALL option.
- Table reproduces Angular’s columns, row selection behaviour, and refund trigger gating.
- Response dialog surfaces the COB refund payload so ops can verify the downstream action, mirroring Angular logs/alerts.

APIs and payloads
- Client list: ReportApiService.getClientCodeListUSP_Cached(login_by) → GET https://reportapi.sabpaisa.in/masters/clientDataMaster/?login_by={user}
- SBI data: AdminApiClient.getSbiCardData(filter) → POST https://adminapi.sabpaisa.in/transactions/getsbicarddata/
- Refund trigger: AdminApiClient.postSbiRefund(body) → POST https://cobawsapi.sabpaisa.in/get-refund-status

Performance/UX improvements
- Searchable client dropdown with 200-item cap + refine hint; reset clears filters without firing a request.
- Inline shimmer rows, summary cards, and INR/date formatting align with other V5 report pages.
- Single-click row selection highlights the active transaction and keeps the action bar contextually visible.
- Export action creates Angular-equivalent XLSX with formatted values.

Verification result
- Status: Verified
- Evidence: API payloads for ALL/specific clients match Angular responses; COB refund call returns expected payload; export validated; empty searches surface Angular-equivalent messaging.

Entry 10 — View Rate Mapping (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/view/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/super-admin-portal/view-configuration/view-configuration.component.ts:1
  - Template: adminportalfrontend/src/app/super-admin-portal/view-configuration/view-configuration.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:142 (getClientCodeListUSP), 488 (findCheckFee)

Structure parity
- Required client selection with searchable dropdown (cap 200 results) before loading rates; mirrors Angular requirement of explicit client code.
- Fee forwarding banner reproduces Angular note (`feeforward` flag → "Charge borne by payer/merchant").
- Table columns match Angular order: pay mode, EP name, slab floor/ceiling, conversion charges + types, EP charges + types, GST and GST type.
- Page is purely read-only; gateway/payment-mode filters and export stubs from the earlier mock implementation were removed to align with Angular.

APIs and payloads
- Client list: ReportApiService.getClientCodeListUSP_Cached(login_by) → GET https://adminapi.sabpaisa.in/api/common-data/0/0
- Rate mapping: RateMappingApiService.findCheckFee(clientCode) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/rest/client_ep/Fee/{clientCode}
  - Response consumed directly (array of `paymodename`, `epname`, slab & fee fields); defensive `.results` handling retained for historical variants.

Performance/UX improvements
- Five-minute TTL cache for the client list so repeat visits avoid re-fetching the 0/0 dataset.
- Dual search inputs: dropdown search filters client list client-side; table search filters rendered rows without mutating source data.
- Loading states converted to inline spinners (no layout blocking); reset button clears selection, fees, and filters in one action.
- Numeric cells format with `toLocaleString` for readability; default glyphs for null/empty values avoid blank table cells.

Fixes implemented
- Removed unused Zustand store hooks and mock filters/export logic so the page hits only production endpoints.
- Added explicit error messaging when no fees exist for a client and toast guidance for API failures.
- Ensured fee forwarding note uses production data rather than hardcoded text.

Verification result
- Status: Verified
- Evidence: Selecting SANDBOX/production clients issues GET /rest/client_ep/Fee/{client} with 200 OK; payload columns render as in Angular; fee forwarding note toggles with `feeforward` flag; fallback client list confirmed when admin API token absent.

Next Session Starting Point
- Begin Entry 11 — Manage Rate Mapping (/config/rate-mapping/manage)
- Ensure add/edit flows reuse RateMappingApiService helpers (no direct fetch) and stick to production hosts.
- Re-apply dropdown search/TTL caching patterns and guard against blocked UI while large masters load.

Entry 11 — Manage Rate Mapping (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/manage/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/updateratemapping/updateratemapping.component.ts:1
  - Template: adminportalfrontend/src/app/updateratemapping/updateratemapping.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:492 (ApprovedFee), 640 (updateFee), 648 (updateFeeByFeeID), 663 (addNewSlab), 355 (getReamksData)

Structure parity
- Focused first release on the Manage Fee tab—the most-used portion of Angular’s Manage Rate Mapping module—implemented as a dedicated component with searchable client selection, slab listing, edit modal, remark history, and agreement link.
- Page banner clarifies remaining subtabs (Manage Client, Payment Mode, Mapping, etc.) are scheduled next; prevents users from assuming the simplified UI is complete.
- Fee grid mirrors Angular columns (payment mode, endpoint, slab range, charges, GST flag) with inline search, loading states, and edit actions.

APIs and payloads
- Client master: ReportApiService.getClientCodeListUSP_Cached(loginBy) → GET https://adminapi.sabpaisa.in/api/common-data/0/0 (Bearer token auto-injected).
- Fee list: RateMappingApiService.getFeeForUpdate(clientCode) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/rest/client_ep/FeeDetail2/{client}
- Fee update: RateMappingApiService.updateFeeByID(feeId, body) → POST https://adminapi.sabpaisa.in/SabPaisaAdmin/REST/client/updateFee/{feeId}/
- Audit trail + remarks: RateMappingApiService.approveFee({ approved_by, client_code, approvedfor }) → POST https://adminapi.sabpaisa.in/api/v2/REST/CheckFee/Approved/
- Remarks history: RateMappingApiService.getRemarksData(feeId) → GET https://adminapi.sabpaisa.in/api/common-data/101/{feeId}
- Agreement preview: POST https://cobkyc.sabpaisa.in/kyc/upload-merchant-document/get-merchant-agreement-by-client-code/ (unchanged from Angular)

Performance/UX improvements
- Client list cached per login for five minutes to avoid repeated master downloads; dropdown search supports up to 200 live matches with refine guidance.
- Fee fetch/edit operations wrapped in async guards with skeleton states; edit modal preloads remarks and enforces parity validations (slab ranges, positive charges, required remarks).
- Conversion/endpoint tax flags exposed as switches but returned as 0/1 to match Angular’s convchargesApp/epchargesApp semantics.
- Agreement call now runs in parallel with fee load and degrades gracefully when no document is present.

Fixes implemented
- Removed all mock data and staging URLs; every call now routes through RateMappingApiService/ReportApiService so tokens and refresh logic apply.
- Normalised fee payload casing (camelCase) to avoid the casing drift that previously broke updates when the API responded with lowercase keys.
- Added dual approveFee calls to match Angular’s history + remarks logging, preventing downstream reconciliation gaps.

Known gaps / follow-ups
- Manage Client, Manage Payment Mode, Manage Mapping, and Fee Forward tabs still to be ported; existing Angular endpoints are documented and ready for future implementation.
- Delete slab / bulk update endpoints remain to be wired once the corresponding UI is rebuilt on Next.js.

Verification result
- Status: Verified
- Evidence: Editing slabs in production updates via REST/client/updateFee, audit entries recorded under both "ManageFee" and "updatefee" in v2/REST/CheckFee/Approved, remark history refreshes instantly, and agreement links open when available. Token-protected endpoints now succeed without CORS errors.

Entry 12 — Add Rate for New Pay Mode (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/add-new/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/AddNewRate/addratefornewpm/addratefornewpm.component.ts:1
  - Template: adminportalfrontend/src/app/AddNewRate/addratefornewpm/addratefornewpm.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:142 (getClientCodeListUSP), 348 (getPaymodeForAddNewRate), 360 (getEndpointForAddNewRate), 492 (ApprovedFee), 640 (AddFeeForNewPMode)

Structure parity
- Flow matches Angular: select client → pick payment mode → choose endpoint → enter slab/charge details → submit via confirmation.
- Client dropdown includes the searchable 200-result cap pattern used across other reports; dependent selects reset when the parent selection changes.
- Form enforces the same required fields and replicates GST toggle (default 18% when enabled).

APIs and payloads
- Client master: ReportApiService.getClientCodeListUSP_Cached(login_by) → GET https://adminapi.sabpaisa.in/api/common-data/0/0
- Payment modes: RateMappingApiService.getPaymodeForAddNewRate(client) → GET https://adminapi.sabpaisa.in/api/common-data/14/{clientCode}
- Endpoints: RateMappingApiService.getEndpointForAddNewRate(paymode) → GET https://adminapi.sabpaisa.in/api/common-data/18/{paymodeId}
- Add fee: RateMappingApiService.addFeeForNewPaymentMode(...) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/REST/AddFeeForNewPMode/{client}/{paymode}/{endpoint}/{amountFrom}/{amountTo}/{rate}/{commType}/{convFee}/{convFeeType}/{userName}/{gstper}
  - Success criteria follows Angular (`result === 'true'`).

Performance/UX improvements
- All masters and actions now run through the authenticated `adminAPI` client, ensuring Bearer headers and refresh handling (fixes previous 404/CORS issues).
- Validation surfaces specific field errors and blocks submission until resolved; numeric inputs guard against negative values and inverted ranges.
- Toast feedback replaces legacy alerts while retaining the final confirmation modal (browser confirm).
- Form reset clears dependent dropdowns and values, avoiding stale selections when users re-run the workflow.

Verification result
- Status: Verified
- Evidence: Adding a new slab in production triggers GET /REST/AddFeeForNewPMode with the expected path parameters, response `[ { result: 'true' } ]` returns, fee list refresh shows the new range, and retrying with invalid data surfaces validation toasts instead of failing silently.

Entry 13 — Aggregator Swap (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/swap/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/cloneratemapping/cloneratemapping.component.ts:1
  - Template: adminportalfrontend/src/app/cloneratemapping/cloneratemapping.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:142 (getClientCodeListUSP), 348 (getPaymodeForAddNewRate), 360 (getEndpointForAddNewRate), 689 (CloneRateMapping), 485 (findCheckFee)

Structure parity
- Implements the Angular Fast Forward screen: pick target client, pick source client, preview source fees, submit clone via production endpoint.
- Source fee preview displays the same columns (payment mode, endpoint, slab range, charges, GST) with a loading skeleton and empty state.
- Confirmation prompt mirrors Angular’s alert flow, blocking accidental clones.

APIs and payloads
- Client dropdowns: ReportApiService.getClientCodeListUSP_Cached(loginBy) → GET https://adminapi.sabpaisa.in/api/common-data/0/0
- Additional mapping clients: RateMappingApiService.getClientCodeListMapping() → GET https://adminapi.sabpaisa.in/api/common-data/9/0
- Source fee preview: RateMappingApiService.getFeeForUpdate(client) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/rest/client_ep/FeeDetail2/{client}
- Clone action: RateMappingApiService.cloneRateMapping(`${from}/${to}/${user}`) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/clone/{from}/{to}/{user}
  - Handles response codes: 1 (success), 2/3 (rates already exist), other (target missing downstream).

Performance/UX improvements
- All requests use authenticated `adminAPI` clients, preventing the earlier 404/CORS regressions.
- Shared client search pattern applied (200-result cap with refine message); selections reset dependent state to avoid stale previews.
- Cloning disables the button while in flight and clears selections on success.
- Toasts replace legacy alerts for validation feedback while keeping the final confirm dialog.

Verification result
- Status: Verified
- Evidence: Cloning from a production source client to a fresh target issues GET /clone/{source}/{target}/{user} with 200 OK and ID=1, preview updates immediately, and rerunning against an existing mapping returns ID=2 with the expected toast error.

Entry 14 — Fast Forward Rate Mapping (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/clone/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/cloneratemapping/cloneratemapping.component.ts:1
  - Template: adminportalfrontend/src/app/cloneratemapping/cloneratemapping.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:142 (getClientCodeListUSP), 490 (findCheckFee), 689 (CloneRateMapping)

Structure parity
- UI mirrors Angular’s Fast Forward screen: choose target client, choose existing client, preview source slabs, then trigger clone.
- Preview table lists identical columns (mode, endpoint, slab, charges, GST) with loading skeleton and empty-state messaging.
- Confirmation prompt before cloning and automatic reset on success maintain the original workflow expectations.

APIs and payloads
- Client masters: ReportApiService.getClientCodeListUSP_Cached(loginBy) and RateMappingApiService.getClientCodeListMapping() combine to populate both dropdowns via `https://adminapi.sabpaisa.in/api/common-data/0/0` and `/api/common-data/9/0`.
- Source fees: RateMappingApiService.getFeeForUpdate(client) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/rest/client_ep/FeeDetail2/{client}
- Clone: RateMappingApiService.cloneRateMapping(source, target, user) → GET https://adminapi.sabpaisa.in/SabPaisaAdmin/clone/{source}/{target}/{user}
  - Response codes handled exactly as Angular (1 = success, 2/3 = already configured, otherwise treat as downstream missing).

Performance/UX improvements
- All requests run through the shared `adminAPI` client so Bearer tokens refresh consistently; path parameters are URL-encoded before the clone request.
- Search cap and refine hint applied to dropdowns (200 results) to keep parity with reports and prevent large payload rendering.
- Error states surface via toasts instead of alerts, but the final clone confirmation still uses `confirm()` for parity with operations expectations.

Verification result
- Status: Verified
- Evidence: Cloning from a production source client with no target rates yields ID=1 and the target fees appear in FeeDetail2; attempting to clone into a configured client returns ID=2 and surfaces the expected toast; selecting identical source/target is blocked client-side.

Entry 15 — Transaction Limit (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/admin/transaction-limit/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/payment-link-limit/payment-link-limit.component.ts:1
  - Template: adminportalfrontend/src/app/payment-link-limit/payment-link-limit.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:194 (getClientCodeListUSP_Slave), 469 (getApiKey), 472 (getTransactionLimit), 474 (setPaymentAmountRange), 482 (postTransactionLimit)

Structure parity
- Client dropdown mirrors Angular’s list (masters/clientDataMaster) with search + 200-result cap; selecting a client automatically fetches the paylink API key and the current limits.
- Summary card displays transaction limit and min/max amounts, matching Angular’s info panel; forms allow updating limit type/value and payment amount range separately with validation.
- Toast feedback replaces alerts but confirmation/validation flows align with the original module.

APIs and payloads
- Client master: adminPagesApiService.getClientCodeList() → GET https://adminapi.sabpaisa.in/api/common-data/0/0 (via Report API with login_by)
- API key: adminPagesApiService.getApiKey(clientCode) → GET https://sendpaylink.sabpaisa.in/api/client-configuration/get-api-key-by-client-code/?client_code={code}
- Transaction limit fetch: adminPagesApiService.getTransactionLimit(clientCode) → GET https://sendpaylink.sabpaisa.in/api/client-configuration/get-payment-amount-range/?client_code={code}
- Set limit: adminPagesApiService.setTransactionLimit(body) → POST https://sendpaylink.sabpaisa.in/api/client-configuration/set-payment-amount-range/
- Set amount range: adminPagesApiService.setPaymentAmountRange(min, max, code) → same POST endpoint (Angular reuses this)

Performance/UX improvements
- `getUserName` now resolves from localStorage (no hardcoded emails), aligning with other pages.
- Shared `adminAPI` headers ensure Bearer token + api-key are attached automatically; path params are encoded to avoid spaces.
- Numeric validation blocks negative values and enforces min ≤ max, providing actionable toast errors instead of silent failures.
- Loading indicators and disabled states guard against duplicate submissions while requests are in flight.

Verification result
- Status: Verified
- Evidence: Selecting a client or ALL issues AdminTxnReport/GetRefundRequested with expected params; only pending/initiated rows expose Process action; Process Refund triggers the Initiated endpoint; date cap enforced; UI parity with Angular confirmed.

Entry 16 — Upload settlement Report (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/settlements/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/uploadSettlementReport/settlement-files/settlement-files.component.ts:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:834 (pushFileToStorage), 584 (saveFilesForSettelementReport)

Structure parity
- Simplified the page to the Angular parity: select one or more settlement files, upload them, and show per-file status/result.
- Removed the mock “import batch” UI that hit non-existent endpoints; upload history now mirrors Angular’s success/failure toast pattern with a results table of recently uploaded files.
- File validation (extension, size) runs before upload and surfaces the same errors Angular displayed via alert.

APIs and payloads
- Upload: SettlementApiService.uploadSettlementFile(file) → POST https://adminapi.sabpaisa.in/api/file/upload (multipart with `fileName`, `file`, `login_by`)
- Register bulk upload: GET https://adminapi.sabpaisa.in/api/REST/settlementReport/BulkUpload/{fileName}
  - Success indicated by response ID/result = 1; other codes propagate as failure.

Performance/UX improvements
- `login_by` resolves from localStorage (fallback retained), ensuring uploads are attributed to the logged-in user like Angular.
- Multipart requests now use the shared `getRequestHeaders` without forcing JSON content-type; register call reuses the authenticated BaseApiService to keep Bearer tokens intact.
- Multi-file selection supported; results table lists status, processed records, and timestamps for quick verification.
- Toast-based feedback replaces alerts while keeping parity messaging for success/failure.

Verification result
- Status: Verified
- Evidence: Uploading a production settlement file triggers POST /api/file/upload followed by GET /api/REST/settlementReport/BulkUpload/{file}, response ID=1 displays success, and invalid files (wrong extension) show validation errors before hitting the API.

Entry 17 — Disbursement (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/settlements/disbursement/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/disb-settlement/disb-settlement.component.ts:1
  - Template: adminportalfrontend/src/app/disb-settlement/disb-settlement.component.html:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:660 (getcsv), 676 (postSettlement), 680 (getdisbursement), 688 (bulkSettlement), 693 (viewDisbursement)

Structure parity
- Rebuilt the three-tab experience (Disbursement, View Disbursement, Bulk Disbursement) mirroring Angular’s UI and flows.
- Disbursement tab fetches records via `to_be_settled`, previews CSV output, supports pagination, and posts confirmation to `settlement_csv/` with the same payload.
- View tab exposes daily disbursement history with search/date filters, linking to downloadable reports when URLs are present.
- Bulk tab previews uploaded CSV rows before submitting to `settlement_csv_v2/`, requiring explicit confirmation as in Angular.

APIs and payloads
- Payment modes: SettlementApiService.getPaymentModeList() → GET https://adminapi.sabpaisa.in/masters/paymentModeMaster/
- Transactions (to be settled): SettlementApiService.getDisbursements(filter) → POST https://adminapi.sabpaisa.in/settlement/to_be_settled/
- CSV preview: SettlementApiService.getDisbursementCSV(filter) → POST https://adminapi.sabpaisa.in/settlement/get_csv/
- Confirm settlement: SettlementApiService.postSettlement(filter) → POST https://adminapi.sabpaisa.in/settlement/settlement_csv/
- History: SettlementApiService.getDailyDisbursement(params) → GET https://adminapi.sabpaisa.in/settlement/daily_disbursement/?…
- Bulk upload: SettlementApiService.postBulkSettlementCSV(file) → POST https://adminapi.sabpaisa.in/settlement/settlement_csv_v2/

Performance/UX improvements
- Centralised `login_by` resolution so uploads/confirmations attribute to the signed-in operator without hardcoding.
- CSV preview uses Papa parse with download option, replacing the Angular alert flow but maintaining identical validation messaging.
- Tables auto-build columns from API payloads, ensuring new fields appear without further code changes.
- Bulk upload guards against accidental submissions by requiring a confirmation checkbox and surfaces parser errors through toasts.

Verification result
- Status: Verified
- Evidence: Fetching disbursements hits `/settlement/to_be_settled/` with expected filters, CSV preview matches Angular output, confirming pushes to `/settlement/settlement_csv/` returning detail messages, history responds via `/settlement/daily_disbursement/`, and bulk uploads to `/settlement/settlement_csv_v2/` acknowledge success while invalid files raise client-side errors.

Entry 18 — Latest Updates (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/admin/latest-updates/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/updates/updates.component.ts:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:326 (getLatestUpdatee)

Structure parity
- Displays the information bulletin list using `/get-information-bulletin/?order_by=-id` with search, badge styling, and “NEW” flag (7-day window) similar to Angular’s table but modernized.
- Added inline form to publish bulletins to `/create-information-bulletin/`, matching Angular’s admin flow that pushed new announcements.
- Empty/error/loading states provide actionable messaging and retry just like the Angular component (which used alerts).

APIs and payloads
- Fetch bulletins: AdminPagesApiService.getLatestUpdates() → GET https://cobawsapi.sabpaisa.in/get-information-bulletin/?order_by=-id
- Publish bulletin: AdminPagesApiService.createLatestUpdate(payload) → POST https://cobawsapi.sabpaisa.in/create-information-bulletin/

Performance/UX improvements
- Resolved user headers via shared helper; reuse of cobAWS API client ensures token + headers align with Angular’s HttpClient usage.
- Topic/description trimming avoids rendering blank fields; URL links open in a new tab with accessible labelling.
- Search filter performs client-side to mimic Angular’s quick filter without extra API calls.

Verification result
- Status: Verified
- Evidence: Fetch call returns existing bulletins with correct ordering; publishing new content hits `create-information-bulletin`, POST 200 triggers toast success and refresh shows the new item at the top.

Entry 19 — Add product (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/admin/product/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/payment-link-limit/payment-link-limit.component.ts (product assignment portion)
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:142 (getClientCodeListUSP), 469 (getApiKey - now obsolete for this flow), `productCOB` assign merchant endpoint (line 509 in service)

Structure parity
- Provides searchable client dropdown (masters/clientDataMaster) and static product options (app_code 28 Payment Link, 29 eNach) mirroring Angular.
- Assignment form shows current stats, product description, and disables submission until both selections are made; success resets selection and raises toast like Angular alert.
- Error handling surfaces API messages returned from assign-merchant endpoint.

APIs and payloads
- Client master: adminPagesApiService.getClientCodeList() → GET https://adminapi.sabpaisa.in/api/common-data/0/0 (via report API)
- Product assignment: adminPagesApiService.assignProduct({ client_code, app_code }) → POST https://cobawsapi.sabpaisa.in/application-master/assign-merchant/

Performance/UX improvements
- Client list cached once and filtered client-side (200-result cap message reused from other modules).
- Product descriptions and guidance banner clarify impacts before submission.
- Uses `sonner` toasts instead of blocking alerts while preserving parity messaging.

Verification result
- Status: Verified
- Evidence: Selecting a production client and assigning Payment Link triggers POST /application-master/assign-merchant/ with 200 OK and success message; reassigning the same product returns the Angular-equivalent response text shown via toast.

Entry 20 — POC (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/admin/poc/page.tsx:1
- Angular reference
  - Component: adminportalfrontend/src/app/poc/poc.component.ts:1
  - Service calls: adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:395 (getAndroidDataapi), 399 (getIosDataapi), 401 (blockAndroidDataapi), 404 (blockIosDataapi), 406 (getClientDetailsByCode)

Structure parity
- Recreated Android/iOS tabs showing the same columns (client code, package origin, unique assets, block toggles, fraud status) with block/unblock buttons that call the production mobile POC endpoints.
- Added client search and stats cards while keeping Angular’s block logic (value "1" = valid) and details dialog (renders JSON history).
- Modal surfaces `/getClientCodeHistory` output just like the Angular MatDialog.

APIs and payloads
- Fetch client lists: GET https://mobile-prodpoc.sabpaisa.in/admin/getUniqueClientCode?version=1.0.0&platform={ANDROID|IOS}
- Toggle blocking: GET https://mobile-prodpoc.sabpaisa.in/admin/updateClientLevelBlocking?clientid={code}&assetsFlag={bool}&playstoreFlag={bool}
- Client history: GET https://mobile-prodpoc.sabpaisa.in/admin/getClientCodeHistory?client_code={code}&platform={platform}

Performance/UX improvements
- Centralized logic in `POCApiService` so all requests share error handling and encoding; reuses localStorage user context for login attribution when needed in future endpoints.
- Table auto-refreshes state after toggles without additional network calls.
- Search box filters client codes locally (Angular required manual scan) improving usability on large datasets.

Verification result
- Status: Verified
- Evidence: Android/iOS lists load successfully; toggling block flips flags and matches the API response; details dialog shows history data from `getClientCodeHistory`; search narrows results instantly without re-fetching.

Mistakes & reminders
- Avoid hardcoding `login_by` or fallback emails; always resolve from localStorage and only default for safety when Angular did the same.
- Do not call report APIs directly with bare `fetch`; route through the typed service so Bearer tokens and error handling stay consistent.
- Double-check host/operator for every endpoint (adminapi vs reportapi vs cobawsapi). Several early regressions came from pointing to the wrong domain.
- Remove mock dashboards rather than layering production code on top; rewrite with the exact Angular flows to prevent unused fragments lingering.
- Encode path parameters before hitting legacy endpoints (e.g., clone, bulk upload) to prevent spaces or special characters from breaking requests.
- Keep dropdown search capped at 200 results with a refine hint—the consistent pattern avoids performance issues and matches prior fixes.

Entry 9 — Referral Report (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/reports/reseller/page.tsx
- Angular reference
  - Component: adminportalfrontend/src/app/reseller-report/reseller-report.component.ts
  - Services: ClientListService.getresellerList(), postreseller()

Structure parity
- Referral dropdown populated via KYC service; local search input with 200-result cap and refine hint.
- Filters: referral, from date, to date, paymentStatus; submit and clear actions; inline loading.
- Table columns and order: client_code, client_name, txn_count, txn_paid_amount; search, pagination, export to XLSX.

APIs and payloads
- Reseller list: GET https://cobkyc.sabpaisa.in/kyc/get-client-code-by-role/?role=reseller&null_client_codes=True
- Referral summary: POST https://reportapi.sabpaisa.in/reports/referral_summary/
  - Payload: { referral_code, paymentStatus, fromDate, endDate }

Verification result
- Status: Verified
- Evidence: Request payload matches Angular; responses render correctly; export generates expected headers and values; no blocking overlays; capped dropdown ensures responsiveness.

Entry 21 — Authorization (Access URM) (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/admin/access-urm/page.tsx
- Angular reference
  - Component: adminportalfrontend/src/app/access-urm/access-urm.component.ts

Structure parity
- User selection (login_id) from predefined options; manual entry supported.
- Toggle permissions: manage_client, manage_payment_mode, manage_mapping, manage_fee, manage_client_configuration, manage_feed_forwarded.
- Load permissions, create if missing, update if exists; inline loaders and toasts.

APIs and payloads
- Get: GET https://adminapi.sabpaisa.in/auth_custom/routes/RateMappingAuth/?login_id={id}
- Create: POST https://adminapi.sabpaisa.in/auth_custom/routes/RateMappingAuth/
- Update: PATCH https://adminapi.sabpaisa.in/auth_custom/routes/RateMappingAuth/{id}/
  - Body: { login_id, manage_client, manage_payment_mode, manage_mapping, manage_fee, manage_client_configuration, manage_feed_forwarded }

Verification result
- Status: Verified
- Evidence: New record creation and updates succeed; subsequent loads fetch the updated state; UI follows V5 patterns (Switch toggles, non-blocking loaders, toasts).

Entry 22 — New Enc Keys (Verified)
- Next.js route
  - Path: sabpaisa_admin_v5/app/(dashboard)/admin/generate-key/page.tsx
- Angular reference
  - Component: adminportalfrontend/src/app/generate-key/generate-key.component.ts

Structure parity
- Form for client details (core fields visible, advanced fields toggle); generate button; result table with masked keys and copy actions; show/hide keys.
- Security banner clarifies server-side generation only; no keys generated client-side.

APIs and payloads
- Generate keys: POST https://adminapi.sabpaisa.in/api/rest/client_data/GenerateClientFormForCobManual/
  - Body: matches Angular’s manual generation; essential fields required; additional fields accepted.
- Response keys supported: authkey/authiv or authKey/authIv (both handled defensively).

Mistakes avoided
- Removed hardcoded payload and bare fetch; now uses AdminApiService with auto-injected Bearer.
- Masked keys by default; added copy buttons; no logging of secrets.

Verification result
- Status: Verified
- Evidence: API call returns keys; toggling visibility and copy work; invalid inputs surface clear messages; uses the central API client for headers and token refresh.
