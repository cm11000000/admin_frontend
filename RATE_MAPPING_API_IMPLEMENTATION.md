# Rate Mapping API Implementation Guide

## Overview
This document details the exact Angular API mappings for all Rate Mapping pages in v5. All APIs now match the Angular `client-list.service.ts` exactly.

## New API Service Created

**File:** `/services/api/RateMappingApiService.ts`

This service contains all Angular API endpoints organized into categories:
- Client Listing & Management
- Payment Mode APIs
- Endpoint APIs
- Mapping APIs
- Fee APIs
- Flag & Configuration APIs
- Clone & Swap APIs
- Partner Bank & App APIs
- Approval & History APIs

---

## Page-by-Page API Mapping

### 1. `/config/rate-mapping/page.tsx` (Client Listing / Create Rate Mapping)

#### Angular Component: `client-listing.component.ts`

#### APIs to Use:

**Load Client List:**
```typescript
// Matches: getClientListNew()
const clients = await RateMappingApiService.getClientList(10)
```

**Get Client Code List:**
```typescript
// Matches: getClientCodeListUSP()
const clientCodes = await RateMappingApiService.getClientCodeList()
```

**Get Payment Mode List (for wizard step 1):**
```typescript
// Matches: getPaymentModeList()
const paymentModes = await RateMappingApiService.getPaymentModeList()
```

**Get Partner Banks (for wizard step 1):**
```typescript
// Matches: getPartnerBankUSP()
const partnerBanks = await RateMappingApiService.getPartnerBankList()
```

**Get App Names (for wizard step 1):**
```typescript
// Matches: getAppNameUSP()
const appNames = await RateMappingApiService.getAppNameList()
```

**Step 1: Save Payment Modes & Endpoints:**
```typescript
// Matches: SavepModeAndendPoint(inputData)
const result = await RateMappingApiService.saveClientDetails({
  clientId: selectedClient.id,
  partnerBankId: selectedBankId,
  appId: selectedAppId,
  paymentModes: selectedPaymentModes,
  endpoints: selectedEndpoints
})
```

**Step 2: Update Mapping Configuration:**
```typescript
// Matches: updateMapping(inputData)
const result = await RateMappingApiService.updateMapping(mappingData)
```

**Step 3: Save Fees:**
```typescript
// Matches: SaveFees(inputData)
const result = await RateMappingApiService.saveFees(feeData)
```

**Generate Client Form for COB:**
```typescript
// Matches: GenerateClientFormForCob(inputData)
const cobResult = await RateMappingApiService.generateClientFormForCob(clientData)
```

---

### 2. `/config/rate-mapping/view/page.tsx` (View Rate Mapping)

#### Angular Component: Part of `updateratemapping.component.ts` (view functionality)

#### APIs to Use:

**Get Client Code List:**
```typescript
const clientCodes = await RateMappingApiService.getClientCodeList()
```

**Get Mapping Details:**
```typescript
// Matches: getMappingDetail(cltCode)
const mappings = await RateMappingApiService.getMappingDetail(clientCode)
```

**Get Fee Details:**
```typescript
// Matches: geFeeForUpdate(cltCode)
const fees = await RateMappingApiService.getFeeForUpdate(clientCode)
```

**Get Assigned Payment Modes:**
```typescript
// Matches: getAssignedPaymenMode(cltID)
const paymentModes = await RateMappingApiService.getAssignedPaymentMode(clientCode)
```

**View PDF Agreement:**
```typescript
// Matches: viewpdf(cltCode)
const pdfData = await RateMappingApiService.viewPDF(clientCode)
```

---

### 3. `/config/rate-mapping/manage/page.tsx` (Manage Rate Mapping)

#### Angular Component: `updateratemapping.component.ts`

This is the most complex page with 6 tabs. Here are the APIs for each tab:

#### Tab 1: Manage Payment Mode

**Get Assigned Payment Modes:**
```typescript
const paymentModes = await RateMappingApiService.getAssignedPaymentMode(clientCode)
```

**Get Payment Mode List (to show not assigned modes):**
```typescript
const allPaymentModes = await RateMappingApiService.getPaymentModeListTest()
```

**Update Payment Mode (Enable/Disable):**
```typescript
// Matches: updateClientPaymode(input1, input2)
const input1 = `${clientId}/${clientPaymodeId}`
await RateMappingApiService.updateClientPaymode(input1, {
  payModeFlag: isEnabled
})
```

**Add New Payment Mode:**
```typescript
// Matches: AddNewPMode endpoint
await RateMappingApiService.addNewPaymentMode(clientCode, paymodeId, userName)
```

**Insert History:**
```typescript
// Matches: ApprovedFee(body)
await RateMappingApiService.approveFee({
  approved_by: userName,
  client_code: clientCode,
  approvedfor: 'ManagePaymentMode'
})
```

#### Tab 2: Manage Mapping

**Get Mapping Details:**
```typescript
const mappings = await RateMappingApiService.getMappingDetail(clientCode)
```

**Get Endpoint List (for modal):**
```typescript
// If payment mode is 3 (Net Banking)
const endpoints = await RateMappingApiService.getEndpointList(mappingId)

// Otherwise by payment mode
const endpoints = await RateMappingApiService.getEndpointListByPaymode(paymodeId)
```

**Update Single Mapping:**
```typescript
// Matches: updateMappingByID(inputData, Ids)
const ids = `${clientId}/${mappingId}`
await RateMappingApiService.updateMappingByID(ids, {
  mappingId,
  priority,
  epUsername,
  epPass,
  epMrchntId,
  feeForward,
  epUrl,
  clientId,
  paymodeId,
  endpointId,
  param1,
  param2,
  param3,
  param4,
  param5,
  param6,
  param7,
  param8,
  param9,
  hasSlabs,
  active
})
```

**Bulk Update Mapping:**
```typescript
// Matches: updateMappingDetail(body)
await RateMappingApiService.updateMappingDetail({
  mappingid: mappingId,
  epmrchntid: merchantId,
  epusername: username,
  eppassword: password
})
```

**Check if in Approve Table:**
```typescript
// Matches: checkinApprovetable(cltcode)
const approveData = await RateMappingApiService.checkInApproveTable(clientCode)
if (approveData.length > 0) {
  alert('You cannot update because it is approved.')
}
```

#### Tab 3: Manage Fee

**Get Fee Details:**
```typescript
const fees = await RateMappingApiService.getFeeForUpdate(clientCode)
```

**Get Remarks Data:**
```typescript
// Matches: getReamksData(cltcode)
const remarks = await RateMappingApiService.getRemarksData(feeId)
```

**Update Fee:**
```typescript
// Matches: updateFeByFeeID(inputData, Ids)
await RateMappingApiService.updateFeeByID(feeId.toString(), {
  feeId,
  slabNumber,
  slabFloor,
  slabCeiling,
  convchargesType,
  convcharges,
  endPointchargesTypes,
  endPointcharge,
  gstType,
  gst,
  convchargesApp,
  epchargesApp
})
```

**Add New Slab:**
```typescript
// Matches: AddNewSlab(body)
const result = await RateMappingApiService.addNewSlab({
  FeeId: feeId,
  ConvChargesType: convchargesType,
  ConvCharges: convcharges,
  EPChargesTypes: endPointchargesTypes,
  EPCharges: endPointcharge,
  GstType: gstType,
  GstValue: gst,
  SlabFloor: slabFloor,
  SlabCeiling: slabCeiling,
  AddedBy: userName
})
```

**Delete Slab:**
```typescript
// Matches: deleteSlab(feeID, loginId, remarks)
await RateMappingApiService.deleteSlab(feeId, loginId, remarks)
```

**Bulk Update Fee:**
```typescript
// Same as updateFeeByID but called multiple times for selected rows
for (const feeId of selectedFeeIds) {
  await RateMappingApiService.updateFeeByID(feeId.toString(), feeData)
}
```

**Insert History/Remarks:**
```typescript
// For update fee
await RateMappingApiService.approveFee({
  approved_by: userName,
  client_code: clientCode,
  approvedfor: 'ManageFee'
})

// For remarks (with feeId)
await RateMappingApiService.approveFee({
  approved_by: `${userName}:${remarks}:${feeId}`,
  client_code: clientCode,
  approvedfor: 'updatefee'
})
```

#### Tab 4: Manage Client Configuration (Client Data Table)

**Get Client Details:**
```typescript
// First get client ID
const clientIdData = await RateMappingApiService.getClientId(clientCode)
const clientId = clientIdData[0].clientId

// Then get client details
const clientDetails = await RateMappingApiService.getClientForUpdate(clientId)
```

**Update Client Data:**
```typescript
// Matches: updateClientDataTable(inputData, Ids)
await RateMappingApiService.updateClientDataTable(clientId, {
  clientId,
  clientCode,
  clientName,
  clientContact,
  clientEmail,
  clientUsername,
  clientPass,
  successReturnURL,
  failureReturnURL,
  pushApiUrl,
  authKey,
  clientIV,
  authFlag,
  authType,
  pushApiFlag,
  uiByPass,
  enquiryFlag,
  refundApplicable,
  isApplication,
  active,
  creationDate,
  createdBy,
  updateDate,
  updatedBy
})
```

#### Tab 5: Manage Flag

**Get Flag Details:**
```typescript
// Matches: getFlagDetail(body)
const flags = await RateMappingApiService.getFlagDetail({
  CltCode: clientCode,
  pType: flagType,
  TypeValue: flagValue,
  upDateBy: userName
})
```

**Update Flag:**
```typescript
// Same as getFlagDetail - it both gets and updates
await RateMappingApiService.getFlagDetail({
  CltCode: clientCode,
  pType: flagType,
  TypeValue: newFlagValue,
  upDateBy: userName
})
```

#### Tab 6: Manage Fee Forwarded

**Get Fee Forwarded Details:**
```typescript
// Matches: getFeeForwardeDetail(input)
const input = `25/${clientCode}`
const feeForwarded = await RateMappingApiService.getFeeForwardedDetail(input)
```

**Update Fee Forwarded:**
```typescript
// Matches: UpdateFeeForwarded(body)
await RateMappingApiService.updateFeeForwarded({
  p_client_id: clientId,
  p_paymode_id: paymodeId,
  p_updatedBy: userName
})
```

#### Permission Check (for all tabs)

**Get Rate Mapping Permissions:**
```typescript
// Matches: getRateMappingAuth(url)
const loginId = localStorage.getItem('loginId')
const permissions = await RateMappingApiService.getRateMappingAuth(loginId)

// permissions object contains:
// - manage_client
// - manage_payment_mode
// - manage_mapping
// - manage_fee
// - manage_client_configuration
// - manage_feed_forwarded
```

---

### 4. `/config/rate-mapping/add-new/page.tsx` (Add Rate for New Pay Mode)

#### Angular Component: `addratefornewpm.component.ts`

#### APIs to Use:

**Get Client Code List:**
```typescript
const clientCodes = await RateMappingApiService.getClientCodeList()
```

**Get Payment Modes (after client selection):**
```typescript
// Matches: getPaymodeForAddNewRate(cltCode)
const paymentModes = await RateMappingApiService.getPaymodeForAddNewRate(clientCode)
```

**Get Endpoints (after payment mode selection):**
```typescript
// Matches: getEndpointForAddNewRate(payModeId)
const endpoints = await RateMappingApiService.getEndpointForAddNewRate(paymodeId)
```

**Submit Fee for New Payment Mode:**
```typescript
// Matches: AddFeeForNewPMode endpoint
const result = await RateMappingApiService.addFeeForNewPaymentMode(
  clientCode,
  paymodeId,
  epid,
  amountFrom,
  amountTo,
  rate,
  commType,
  convFee,
  convFeeType,
  userName,
  gstper
)

// Check result
if (result[0].result === 'true') {
  toast.success('Fee added successfully')
} else {
  toast.error('Fee not added. Please contact administrator.')
}
```

---

### 5. `/config/rate-mapping/swap/page.tsx` (Aggregator Swap)

#### Angular Component: Not found in provided code, but based on service methods

#### APIs to Use:

**Get Client Code List:**
```typescript
const clientCodes = await RateMappingApiService.getClientCodeList()
```

**Get Aggregator Names for Swap:**
```typescript
// Matches: getAggNameForSwap(paymodeid)
const aggregators = await RateMappingApiService.getAggNameForSwap(paymodeId)
```

**Get Aggregator List:**
```typescript
// Matches: getAggregatorList()
const allAggregators = await RateMappingApiService.getAggregatorList()
```

---

### 6. `/config/rate-mapping/clone/page.tsx` (Fast Forward / Clone Rate Mapping)

#### Angular Component: `cloneratemapping.component.ts`

#### APIs to Use:

**Get Client Code List (Source):**
```typescript
// Matches: getClientCodeListUSP()
const clientCodes = await RateMappingApiService.getClientCodeList()
```

**Get Client Code List (Target - with mapping):**
```typescript
// Matches: getClientCodeListMapping()
const mappingClients = await RateMappingApiService.getClientCodeListMapping()
```

**Check Fee Configuration (for preview):**
```typescript
// Matches: findCheckFee(clientCode)
const feeCheck = await RateMappingApiService.findCheckFee(clientCodeFrom)
```

**Clone Rate Mapping:**
```typescript
// Matches: CloneRateMapping(inputVal)
const result = await RateMappingApiService.cloneRateMapping(
  clientCodeFrom,
  clientCodeTo,
  loginBy
)

// Check result
const resultId = result[0].ID
if (resultId === 1) {
  toast.success('Your request has been processed successfully')
} else if (resultId === 2 || resultId === 3) {
  toast.warning('Rate is already configured for this client')
} else {
  toast.error(`Client code ${clientCodeTo} does not exist in sabPaisa2 Database`)
}
```

---

## Environment Variables

Add these to your `.env.local`:

```env
# Rate Mapping APIs
NEXT_PUBLIC_ADMIN_URL=https://stage-adminapi.sabpaisa.in/SabPaisaAdmin/
NEXT_PUBLIC_STG_REPORT_API=https://stage-reportapi.sabpaisa.in/
NEXT_PUBLIC_STAGING_URL=https://stage-adminapi.sabpaisa.in/
NEXT_PUBLIC_BASE_URL_RATE_MAPPING=https://stage-adminapi.sabpaisa.in/
NEXT_PUBLIC_BASE_URL_RATE_MAPPING2=https://adminapi.sabpaisa.in/api/
NEXT_PUBLIC_BASE_URL_NEW=https://cobawsapi.sabpaisa.in/
NEXT_PUBLIC_CLIENT_API_URL=https://stage-reportapi.sabpaisa.in/rest/client_data/
NEXT_PUBLIC_ACCESS_API=https://adminapi.sabpaisa.in/
NEXT_PUBLIC_COBKYC_URL=https://cobkyc.sabpaisa.in/
```

---

## Key Angular Logic to Replicate

### 1. Multi-Step Wizard (Create Rate Mapping)

The Angular implementation has a 3-step wizard:

**Step 1:** Select Partner Bank, App Name, and Payment Modes (with nested checkboxes by aggregator)

**Step 2:** Configure Endpoints for each selected payment mode (priority, credentials, parameters)

**Step 3:** Configure Fees for each endpoint (slabs with floor/ceiling, rates, charges)

### 2. Tab-Based Management

The Manage page has 6 tabs that load data independently:
- Manage Payment Mode
- Manage Mapping
- Manage Fee
- Manage Client Configuration
- Manage Flag
- Manage Fee Forwarded

### 3. Nested Checkbox Structure

Payment modes are grouped by aggregator (SabPaisa, ATOM, INGENICO, etc.) with parent checkboxes that select all children.

### 4. Slab Management

Fees support multiple slabs with:
- Slab Number (1, 2, 3, etc.)
- Floor Amount
- Ceiling Amount
- Convenience Charge (Type & Value)
- Endpoint Charge (Type & Value)
- GST (Type & Value)
- Tax Applicability flags

### 5. Bulk Update Features

Both Mapping and Fee tabs support bulk updates with checkboxes.

### 6. Permission-Based UI

Use `getRateMappingAuth()` to check permissions and show/hide tabs and buttons accordingly.

### 7. Approval Workflow

Check `checkInApproveTable()` before allowing updates. If data exists in approve table, block updates with message: "You cannot view for update because it is approved."

---

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false)
const [errorMsg, setErrorMsg] = useState(false)
const [showGrid, setShowGrid] = useState(false)

// In load function
setLoading(true)
try {
  const data = await RateMappingApiService.someMethod()
  if (data.length > 0) {
    setShowGrid(true)
    setErrorMsg(false)
  } else {
    setShowGrid(false)
    setErrorMsg(true)
  }
} catch (error) {
  setErrorMsg(true)
  toast.error('Failed to load data')
} finally {
  setLoading(false)
}
```

### Client Selection Parsing
```typescript
// Angular parses like: "ClientName:ClientCode"
const onClientChange = (value: string) => {
  const index = value.indexOf(':')
  const clientCode = value.substr(index + 1, value.length)
  // Use clientCode for API calls
}
```

### Role-Based Actions
```typescript
const roleId = localStorage.getItem('RoleId')
const userName = localStorage.getItem('userName')
const rights = Number(localStorage.getItem('rights'))

// Admin check (roleId === '1' or rights >= 0)
const canAddSlab = roleId === '1' || rights >= 0
```

### Insert History Helper
```typescript
const insertHistory = async (clientCode: string, approvedFor: string) => {
  await RateMappingApiService.approveFee({
    approved_by: userName,
    client_code: clientCode,
    approvedfor: approvedFor
  })
}
```

---

## Implementation Checklist

For each page:

- [ ] Replace mock API calls with `RateMappingApiService` methods
- [ ] Add loading states
- [ ] Add error handling with toasts
- [ ] Implement permission checks
- [ ] Add approval workflow checks
- [ ] Keep v4 dark theme design
- [ ] Maintain tab-based interface
- [ ] Support nested checkbox structures
- [ ] Implement slab add/edit/delete
- [ ] Add bulk update functionality
- [ ] Insert history records for changes
- [ ] Add confirmation dialogs for destructive actions
- [ ] Parse Angular-style select values (Name:Code format)
- [ ] Filter search for client dropdowns

---

## Notes

1. **All API endpoints match Angular exactly** - No changes to backend required
2. **Keep v4 UI design** - Only update the API layer
3. **GST default value** - Use `environment.gst` (18)
4. **Wizard flow** - Must complete Step 1 before Step 2, etc.
5. **Validation** - Check for required fields before API calls
6. **Error messages** - Match Angular alert messages exactly
7. **Success messages** - Match Angular alert messages exactly
8. **Data persistence** - Use localStorage for userName, loginId, roleId, etc.

---

## Testing Strategy

1. **Client Listing:** Test with verified and non-verified clients
2. **Create Wizard:** Complete full 3-step flow with various payment modes
3. **Manage Tabs:** Test all 6 tabs independently
4. **Bulk Operations:** Test bulk update for mapping and fees
5. **Permissions:** Test with different role IDs
6. **Approval Flow:** Test with approved and non-approved clients
7. **Clone:** Test successful clone and edge cases (same client, non-existent client)
8. **Add New Rate:** Test full flow from client to endpoint to fee submission

---

## Migration Status

✅ **Completed:**
- RateMappingApiService created with all Angular endpoints
- API documentation completed
- Implementation guide created

⏳ **Pending:**
- Update individual page.tsx files with new APIs
- Test each page thoroughly
- Update types/interfaces if needed
- Add error boundaries
- Add loading skeletons
