# Rate Mapping - Quick Start Guide

## 🚀 Quick Reference for Developers

This is a quick reference guide for implementing Rate Mapping features. For detailed documentation, see `RATE_MAPPING_API_INTEGRATION.md`.

---

## Import the Service

```typescript
import RateMappingApiService from '@/services/api/RateMappingApiService'
```

---

## Feature 1: Create Rate Mapping (3-Step Wizard)

### Step 1: Load Clients
```typescript
const clients = await RateMappingApiService.getClientCodeList()
```

### Step 2: Select Payment Modes
```typescript
// Get assigned modes for client
const modes = await RateMappingApiService.getAssignedPaymentMode(clientCode)

// Save selected modes
await RateMappingApiService.saveClientDetails({
  clientId,
  clientCode,
  paymentModes: selectedModes
})
```

### Step 3: Configure Rates
```typescript
await RateMappingApiService.saveFees({
  clientId,
  clientCode,
  feeSlabs: rateSlabs
})
```

---

## Feature 2: View Rate Mapping

### Load and Display Fees
```typescript
// Get clients
const clients = await RateMappingApiService.getClientCodeList()

// Get fee details for selected client
const fees = await RateMappingApiService.findCheckFee(clientCode)

// Display in read-only table
```

### Approve Configuration (Admin Only)
```typescript
await RateMappingApiService.approveFee({
  approved_by: userName,
  client_code: clientCode,
  approvedfor: 'ManageFee'
})
```

---

## Feature 3: Manage Rate Mapping

### View Mappings
```typescript
const mappings = await RateMappingApiService.getMappingDetail(clientCode)
```

### Update Mapping (Single)
```typescript
await RateMappingApiService.updateMappingByID(
  `${clientId}/${mappingId}`,
  {
    mappingId,
    priority,
    epUsername,
    epPass,
    epMrchntId,
    // ... other fields
  }
)
```

### Update Mapping (Bulk)
```typescript
for (const mapping of selectedMappings) {
  await RateMappingApiService.updateMappingDetail({
    mappingid: mapping.id,
    epmrchntid: bulkMerchantId,
    epusername: bulkUsername,
    eppassword: bulkPassword
  })
}
```

### View Fees
```typescript
const fees = await RateMappingApiService.getFeeForUpdate(clientCode)
```

### Update Fee
```typescript
await RateMappingApiService.updateFeeByID(feeId, {
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
  convchargesApp,  // 1 or 0
  epchargesApp     // 1 or 0
})
```

### Add New Slab
```typescript
const result = await RateMappingApiService.addNewSlab({
  FeeId: feeId,
  ConvChargesType: 'percentage',
  ConvCharges: 2,
  EPChargesTypes: 'percentage',
  EPCharges: 1.5,
  GstType: 'percentage',
  GstValue: 18,
  SlabFloor: 1001,
  SlabCeiling: 5000,
  AddedBy: userName
})

if (result[0].Id > 0) {
  toast.success('Slab added')
}
```

### Delete Slab
```typescript
await RateMappingApiService.deleteSlab(feeId, userName, remarks)
```

### View Agreement PDF
```typescript
const pdf = await RateMappingApiService.viewPDF(clientCode)
if (pdf.length > 0) {
  window.open(pdf[0].file_path, '_blank')
}
```

### View History/Remarks
```typescript
const history = await RateMappingApiService.getRemarksData(feeId)
```

---

## Feature 4: Add Rate for New Pay Mode

### Load Available Modes
```typescript
// Get clients
const clients = await RateMappingApiService.getClientCodeList()

// Get payment modes NOT configured for this client
const modes = await RateMappingApiService.getPaymodeForAddNewRate(clientCode)

// Get endpoints for selected mode
const endpoints = await RateMappingApiService.getEndpointForAddNewRate(paymodeId)
```

### Add Fee
```typescript
const result = await RateMappingApiService.addFeeForNewPaymentMode(
  clientCode,
  paymodeId,
  endpointId,
  amountFrom,
  amountTo,
  rate,
  'percentage',  // commType
  convFee,
  'percentage',  // convFeeType
  userName,
  18  // gst percentage
)

if (result[0].result === 'true') {
  toast.success('Fee added')
}
```

---

## Feature 5: Aggregator Swap

### View Current Aggregator
```typescript
// Build params: S/{clientCode}/{paymentMode}/0/NA/NA/NA/NA/0
const params = `S/${clientCode}/${paymentMode}/0/NA/NA/NA/NA/0`
const current = await RateMappingApiService.getAggName(params)

// Display: current[0].ep_name, ep_id, merchant_id, username, ep_url
```

### Get Available Aggregators
```typescript
const aggregators = await RateMappingApiService.getAggNameForSwap(payModeId)
```

### Update Aggregator
```typescript
// Format URL: remove https:// and replace / with :
const formattedUrl = epUrl
  .replace(/^https?:\/\//, '')
  .replace(/\//g, ':')

// Build params: U/{clientCode}/{paymentMode}/{newAggId}/{merchantId}/{pwd}/{url}/{username}/{oldAggId}
const params = `U/${clientCode}/${paymentMode}/${newAggId}/${merchantId}/${password}/${formattedUrl}/${username}/${oldAggId}`

const result = await RateMappingApiService.getAggName(params)

if (result.length > 0) {
  toast.success('Aggregator updated')
}
```

---

## Feature 6: Clone Rate Mapping

### Load Clients
```typescript
// Source clients
const sourceClients = await RateMappingApiService.getClientCodeList()

// Target clients
const targetClients = await RateMappingApiService.getClientCodeListMapping()

// Preview source fees
const sourceFees = await RateMappingApiService.findCheckFee(sourceClientCode)
```

### Clone
```typescript
const result = await RateMappingApiService.cloneRateMapping(
  sourceClientCode,
  targetClientCode,
  userName
)

// Handle result
switch (result[0].ID) {
  case 1:
    toast.success('Cloned successfully')
    break
  case 2:
  case 3:
    toast.error('Target already has configuration')
    break
  default:
    toast.error('Target client does not exist')
}
```

---

## Common Patterns

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false)

const loadData = async () => {
  setIsLoading(true)
  try {
    const data = await RateMappingApiService.someMethod()
    setData(data)
  } catch (error) {
    toast.error('Failed to load')
  } finally {
    setIsLoading(false)
  }
}
```

### Error Handling
```typescript
try {
  await RateMappingApiService.someMethod()
  toast.success('Success')
} catch (error) {
  toast.error('Failed')
  console.error(error)
}
```

### Check Approval Before Update
```typescript
const checkApproval = async (clientCode: string) => {
  const status = await RateMappingApiService.checkInApproveTable(clientCode)
  if (status.length > 0) {
    toast.warning('Cannot update - already approved')
    return false
  }
  return true
}

// Use before update
if (await checkApproval(clientCode)) {
  // Proceed with update
}
```

### Track History
```typescript
// After any update, insert history
await RateMappingApiService.approveFee({
  approved_by: `${userName}:${remarks}:${recordId}`,
  client_code: clientCode,
  approvedfor: 'updatefee'  // or 'ManageMapping', 'ManageClient', etc.
})
```

### Check Permissions
```typescript
const loginId = localStorage.getItem('loginId')
const permissions = await RateMappingApiService.getRateMappingAuth(loginId)

// Use permissions
if (permissions.manage_fee) {
  // Show fee management UI
}
if (permissions.manage_mapping) {
  // Show mapping management UI
}
```

---

## Data Structures

### Client
```typescript
{
  clientCode: string
  clientName: string
  clientId: number
  clientContact?: string
  clientEmail?: string
}
```

### Payment Mode
```typescript
{
  Id: number
  paymodeId: number
  paymodeName: string
  paymodeType: string
  endpoints?: Endpoint[]
}
```

### Fee Detail
```typescript
{
  Id: number
  bankName: string
  slabNumber: number
  slabFloor: number
  slabCeiling: number
  convchargesType: string  // 'percentage' | 'fixed'
  convcharges: number
  endPointchargesTypes: string
  endPointcharge: number
  gstType: string
  gst: number
  convchargesApp?: number  // 1 = Yes, 0 = No
  epchargesApp?: number
}
```

### Mapping Detail
```typescript
{
  mappingid: number
  priority: number
  epUsername: string
  epPass: string
  epMrchntId: string
  feeForward: string  // 'YES' | 'NO'
  epUrl: string
  clientId: number
  paymodeId: number
  endpointId: number
  active: boolean
  paymodeName?: string
  endpointName?: string
}
```

---

## Environment Setup

Add to `.env.local`:
```bash
NEXT_PUBLIC_ADMIN_URL=https://stage-adminapi.sabpaisa.in/SabPaisaAdmin/
NEXT_PUBLIC_STAGING_URL=https://stage-adminapi.sabpaisa.in/
NEXT_PUBLIC_STG_REPORT_API=https://stage-reportapi.sabpaisa.in/
NEXT_PUBLIC_ACCESS_API=https://adminapi.sabpaisa.in/
NEXT_PUBLIC_COBKYC_URL=https://cobkyc.sabpaisa.in/
```

---

## Testing Checklist

Quick test for each feature:

- [ ] **Create:** Load clients → Select modes → Configure rates → Save
- [ ] **View:** Load fees → Display details → Test approve (admin)
- [ ] **Manage:** View mappings → Update → Add slab → Delete slab → View PDF
- [ ] **Add New:** Select client → Select mode → Select endpoint → Add fee
- [ ] **Swap:** View current → Select new → Enter credentials → Swap
- [ ] **Clone:** Select source → Select target → Preview → Clone

---

## Need Help?

1. **Detailed Docs:** `RATE_MAPPING_API_INTEGRATION.md`
2. **Summary:** `RATE_MAPPING_INTEGRATION_SUMMARY.md`
3. **API Service:** `/services/api/RateMappingApiService.ts`
4. **Angular Reference:** `/adminportalfrontend/src/app/`

---

**Status:** ✅ All APIs Connected
**Last Updated:** October 9, 2024
