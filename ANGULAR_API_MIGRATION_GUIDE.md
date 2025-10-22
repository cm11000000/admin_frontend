# Angular API Migration Guide for Reports

This document maps the exact Angular APIs to the v5 Next.js report pages.

## Base URLs (from Angular environment.ts)
```typescript
adminUrlNew: 'https://reportapi.sabpaisa.in/'
adminUrl: 'https://adminapi.sabpaisa.in/api/'
txnHistoryDbsUrl: 'https://reportapi.sabpaisa.in/'
splitSettlementURL: 'https://stage-settlepaisa.sabpaisa.in/settlepaisaApi/'
successTxnReportAdmin: 'https://reportapi.sabpaisa.in/transactions/'
```

---

## 1. Settlement Report (`/reports/settlements`)

### Angular API Implementation
**Service Method**: `getSettelmentReport()`
**Endpoint**: `POST https://reportapi.sabpaisa.in/transactions/GetSettledTxnHistory/`

### Request Payload
```typescript
{
  clientCode: string,      // Required, use 'ALL' or specific client
  fromDate: string,         // Format: 'YYYY-MM-DD'
  endDate: string,          // Format: 'YYYY-MM-DD'
  noOfClient: number,       // Use 0
  rpttype: number           // Use 1
}
```

### Response Structure
```typescript
{
  results: [{
    // Settlement data array
  }]
}
```

### Key Features
- Client code dropdown: Call `getClientCodeListUSP_Slave()`
- Export to Excel: Use `excelService.exportAsExcelFile(data, 'sample')`
- Pagination: 10 items per page (default)
- Validation: Client code cannot be 'ALL'

---

## 2. Chargeback Report (`/reports/chargebacks`)

### Angular API Implementation
**Service Method**: `getChargebackReport()`
**Endpoint**: `POST https://reportapi.sabpaisa.in/transactions/GetChargebackTxnHistory/`

### Request Payload
```typescript
{
  clientCode: string,      // Required, use 'ALL' or specific client
  fromDate: string,         // Format: 'YYYY-MM-DD'
  endDate: string,          // Format: 'YYYY-MM-DD'
  noOfClient: number,       // Use 0
  rpttype: number           // Use 1
}
```

### Response Structure
```typescript
// Direct array response (not wrapped in results)
[{
  // Chargeback data
}]
```

### Key Features
- Client code dropdown: Call `getClientCodeListUSP_Slave()`
- Same validation as Settlement Report
- Export functionality: Same as Settlement

---

## 3. PG Report (`/reports/pg-report`)

### Angular API Implementation
**Service Method**: `getPGReport()`
**Endpoint**: `POST https://adminapi.sabpaisa.in/api/REST/ViewPGReport/`

### Request Payload
```typescript
{
  p_fromDate: string,      // Format: 'YYYY-MM-DD'
  p_endDate: string,       // Format: 'YYYY-MM-DD'
  p_payment_id: number     // Payment mode ID (0 for all)
}
```

### Response Structure
```typescript
[{
  success: number,
  failed: number,
  initiated: number,
  aborted: number,
  total: number,
  // ... other fields
}]
```

### Additional Processing
```typescript
// Calculate totals
this.tSuccess = sum of all success
this.tFailed = sum of all failed
this.tInitiated = sum of all initiated
this.tAborted = sum of all aborted
this.tTotals = sum of all total
```

### Key Features
- Payment mode dropdown: Call `getPaymodeListUSP()` → `common-data/30/0`
- Export to Excel: Uses `XLSX.utils.table_to_sheet()` directly on table element
- Table export ID: `tblPgReport`

---

## 4. TID Report (`/reports/tid`)

### Angular API Implementation
**Service Method**: `getMappingDetail()`
**Endpoint**: `GET https://adminapi.sabpaisa.in/api/MappingDetail/Mapping/{clientCode}`

### Request Structure
- URL Parameter: `clientCode` (required)
- No POST body needed

### Response Structure
```typescript
[{
  // Mapping details array
}]
```

### Key Features
- Client code dropdown: Call `getClientCodeListUSP()` → `common-data/0/0`
- No client selection = no data displayed
- Auto-fetch on client change via `onClientChange()`

---

## 5. TSR Report (`/reports/tsr`)

### Angular API Implementation
**Service Method**: `getTSRMonitoring()`
**Endpoint**: `POST https://reportapi.sabpaisa.in/api/transactions/GetTSRMonotoring/`

### Request Payload
```typescript
{
  minutes_values: number,   // Time range: 60, 120, 180, etc. (Last 1 Hour, 2 Hours, etc.)
  pay_mode_id: number,      // Payment mode ID (0 for all)
  p_client_code: string     // Client code ('ALL' or specific)
}
```

### Response Structure
```typescript
[{
  tsr: number,             // TSR percentage
  ep_id: number,
  // ... other fields
}]
```

### Additional Features

#### Get Code/Decode for Payment Modes
**Service Method**: `getCodeDecode()`
**Endpoint**: `GET https://reportapi.sabpaisa.in/REST/codeDecodeData/0/0`

#### Get Client List for TSR
**Service Method**: `getClientListForTSR()`
**Endpoint**: `POST https://reportapi.sabpaisa.in/REST/GetClientDataModeAndEPWise`
```typescript
{
  payment_mode_id: number,
  ep_id: number,
  b_ctg_code: string       // Business category code
}
```

#### Get Pipe List
**Service Method**: `getPipeList()`
**Endpoint**: `POST https://reportapi.sabpaisa.in/REST/GetTSRWithExistingMID`
```typescript
{
  minutes_val: number,
  pay_mode_id: number,
  s_ep_id: number,
  p_b_cat_code: string
}
```

### Key Features
- Auto-refresh functionality
- Dropdown filters: Time range, Payment mode, Client code
- Color coding: Green (TSR >= expected), Red (TSR < expected)
- Popup modal for pipe switching
- Client code dropdown: Call `getClientCodeListUSP()`

---

## 6. Analytics Report (`/reports/analytics`)

### Angular API Implementation
**Service Method**: `getAnylysisReport()`
**Endpoint**: `POST https://adminapi.sabpaisa.in/api/AdminConsolidatedReport/TxnAnalysisReport`

### Request Payload
```typescript
{
  fromDate: string,         // Format: 'YYYY-MM-DD'
  endDate: string,          // Format: 'YYYY-MM-DD'
  pclientCode: string       // 'ALL' or specific client code
}
```

### Response Structure
```typescript
[{
  status: string,          // 'SUCCESS', 'NOT_COMPLETE', 'ABORTED', 'INITIATED'
  total: number,
  cash: number,
  creditCard: number,
  debitCard: number,
  neftrtgs: number,
  netBanking: number,
  upi: number,
  wallet: number,
  sabPaisaQR: number,
  RupayCard: number,
  RuPayCreditCard: number,
  imps: number,
  rtgs: number,
  noMode: number,
  trdate: string,          // Contains GMV data: "totalRecords-totalAmount"
  // ...
}]
```

### Data Processing Logic
```typescript
// Calculate grand total
this.grangTotal = sum of all totals

// Calculate payment mode totals
this.tCash = sum of all cash
this.tCC = sum of all creditCard
this.tDC = sum of all debitCard
this.tNEFT = sum of all neftrtgs
this.tNB = sum of all netBanking
this.tUPI = sum of all upi
this.tWallet = sum of all wallet
this.tSPQR = sum of all sabPaisaQR
this.tRupayCard = sum of all RupayCard
this.tRupayCreditCard = sum of all RuPayCreditCard
this.tIMPS = sum of all imps
this.tRTGS = sum of all rtgs
this.tNoMode = sum of all noMode (only for RoleId === '1')

// Calculate percentages by status
for each record:
  if status === 'SUCCESS':
    tSuccessPer = (total / grangTotal) * 100
  if status === 'NOT_COMPLETE':
    tFailedPer = (total / grangTotal) * 100
  if status === 'ABORTED':
    tAbortedPer = (total / grangTotal) * 100
  if status === 'INITIATED':
    tInitiation += total

// Calculate additional metrics
tNMCStatusPer = (tInitiation / grangTotal) * 100
tNoModePer = (tNoMode / grangTotal) * 100

// Extract GMV data from first record
TxnGmv = data[0].trdate  // Format: "totalRecords-totalAmount"
[totlaRecords, totlaPaidAmt] = TxnGmv.split("-")
```

### Key Features
- Client code dropdown: Call `getClientCodeListUSP()`
- Date range validation (end date >= start date)
- Role-based display (RoleId from localStorage)
- GMV data extraction from `trdate` field
- Multiple aggregations (by status, by payment mode)

---

## 7. Settle Paisa Report (`/reports/settle-paisa`)

### Angular API Implementation

#### Search Client (Main Report)
**Service Method**: `getAdminTxnFilter()`
**Endpoint**: `GET https://reportapi.sabpaisa.in/REST/txnHistory/{filter}`

**Filter Format**: `{clientCode}/{status}/{paymentMode}/{fromDate}/{endDate}/0/0`
Example: `CLI001/SUCCESS/ALL/2025-01-01/2025-01-31/0/0`

#### Get Split Settlement Detail
**Service Method**: `GetSplitSettlementDetail()`
**Endpoint**: `POST https://stage-settlepaisa.sabpaisa.in/settlepaisaApi/fetch/{clientCode}`

### Request Payload (Split Detail)
```typescript
{
  startDate: string,       // Format: 'YYYY-MM-DD'
  endDate: string          // Format: 'YYYY-MM-DD'
}
```

### Response Structure (Split)
```typescript
[{
  serviceBankCommissionAmount: number,
  partnerBankCommissionAmount: number,
  referralCommissionAmount: number,
  settlePaisaCommissionAmount: number,
  totalCommission: number,
  // ...
}]
```

### Data Processing
```typescript
// Calculate totals
this.serviceBankAmt = sum of serviceBankCommissionAmount
this.PartnerBankAmt = sum of partnerBankCommissionAmount
this.RefferalCommAmt = sum of referralCommissionAmount
this.settlePaisaCommAmt = sum of settlePaisaCommissionAmount
this.TotalCommAmt = sum of totalCommission
```

#### Split Transaction
**Service Method**: `GetDatafromSPtoSettlePaisa()`
**Endpoint**: `POST https://stage-settlepaisa.sabpaisa.in/settlepaisaApi/splittTransByClientCode/{clientCode}`

### Request Payload (Split Transaction)
```typescript
// Array of transaction objects
[{
  sabpaisaTxnId: string,
  clientTxnId: string,
  paidAmount: number,
  payeeAmount: number,
  paymentMode: string,
  paymentStatus: string,
  clientName: string,
  clientCode: string,
  transDate: string,
  transCompleteDate: string,
  clientId: string,
  pgName: string
}]
```

### Key Features
- Client code dropdown: Call `getClientCodeListUSP()`
- Date formatting: `DateToStr()` method for display
- Month name mapping: Jan-Dec
- Modal popup for split details
- Transaction splitting functionality

---

## 8. Refund Report (`/reports/refunds`)

### Angular API Implementation
**Service Method**: `getRefundReport()`
**Endpoint**: `POST https://reportapi.sabpaisa.in/transactions/GetRefundTxnHistory/`

### Request Payload
```typescript
{
  clientCode: string,      // Required, use 'ALL' or specific client
  fromDate: string,         // Format: 'YYYY-MM-DD'
  endDate: string,          // Format: 'YYYY-MM-DD'
  noOfClient: number,       // Use 0
  rpttype: number           // Use 1
}
```

---

## Common API Endpoints

### Get Client Code List (Slave)
**Endpoint**: `GET https://reportapi.sabpaisa.in/masters/clientDataMaster/?login_by={userName}`
**Headers**:
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token
}
```

### Get Client Code List (Standard)
**Endpoint**: `GET https://adminapi.sabpaisa.in/api/common-data/0/0`

### Get Payment Mode List
**Endpoint**: `GET https://adminapi.sabpaisa.in/api/common-data/30/0`

---

## Authentication Headers
All API requests should include:
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
}
```

For certain endpoints:
```typescript
{
  'api-key': localStorage.getItem('apikey')
}
```

---

## Excel Export Implementation

### Method 1: Using ExcelService
```typescript
this.excelService.exportAsExcelFile(data, 'filename');
```

### Method 2: Using XLSX Library
```typescript
import * as XLSX from 'xlsx';

exportexcel(): void {
  let element = document.getElementById('tableId');
  const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'ExcelSheet.xlsx');
}
```

### Method 3: With Timestamp
```typescript
export2XL() {
  let timeSpan = new Date().toISOString();
  let prefix = "ExportResult";
  let fileName = `${prefix}-${timeSpan}`;
  let targetTableElm = document.getElementById('tableId');
  let wb = XLSX.utils.table_to_book(targetTableElm, { sheet: prefix });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
```

---

## Date Handling

### Current Date Format
```typescript
const date = new Date();
this.dd = date.getDate().toString().padStart(2, '0');
this.mm = (date.getMonth() + 1).toString().padStart(2, '0');
this.yyyy = date.getFullYear().toString();
this.fromDate = this.yyyy + '-' + this.mm + '-' + this.dd;
this.endDate = this.yyyy + '-' + this.mm + '-' + this.dd;
```

### Date Validation
```typescript
const d1 = new Date(this.fromDate);
const d2 = new Date(this.endDate);
const DifferenceInTime = d2.getTime() - d1.getTime();
const DifferenceInDays = DifferenceInTime / (1000 * 3600 * 24);

if (DifferenceInDays < 0) {
  alert('From date should be less than or equal to end date');
  return;
}
```

---

## Loading State Management

```typescript
// Start loading
let startTime = new Date().getTime();
this.loading = true;

// End loading (with calculated delay)
const endTime = new Date().getTime();
let timeDiff = ((endTime - startTime) / 60);
setTimeout(() => {
  this.loading = false;
}, timeDiff);
```

---

## Error Handling Pattern

```typescript
if (data.length > 0) {
  this.errorMsg = false;
  this.showGrid = true;
  this.showXLExportButton = true;
} else {
  this.errorMsg = true;
  this.showGrid = false;
  this.showXLExportButton = false;
}
```

---

## Pagination Configuration

```typescript
// Default values
this.pageSize = 10;
this.p = 0;  // Current page

// Page size change handler
onChangePageSize(e) {
  this.pageSize = e.target.value;
  this.p = 0;
}
```

---

## localStorage Keys Used

- `userName` - Current logged in user
- `RoleId` - User role (1 = Admin)
- `DepId` - Department ID
- `accessToken` - Bearer token for API auth
- `apikey` - API key for certain endpoints

---

## Implementation Checklist for Each Report

1. ✅ Match exact API endpoint
2. ✅ Match request payload structure
3. ✅ Match response data processing
4. ✅ Implement same filters (client, date, payment mode, etc.)
5. ✅ Implement same validations
6. ✅ Implement same pagination (10 items default)
7. ✅ Implement Excel export with XLSX
8. ✅ Keep v4 dark theme UI
9. ✅ Add Authorization headers
10. ✅ Handle loading states
11. ✅ Handle error states
12. ✅ Match date format (YYYY-MM-DD)
