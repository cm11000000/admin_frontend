# Rate Mapping API Integration - Complete Documentation

## Overview

This document provides a comprehensive guide to all 6 Rate Mapping features with their complete API integration details. All APIs are now connected and functional, replacing the previous mock data implementation.

---

## API Service Location

**File:** `/sabpaisa_admin_v5/services/api/RateMappingApiService.ts`

All Rate Mapping APIs are centralized in this service file, following the same patterns as the Angular implementation from `/adminportalfrontend/src/app/super-admin-portal/client-list.service.ts`.

---

## Feature 1: CREATE RATE MAPPING

### Page Location
`/sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/page.tsx`

### Angular Reference
`/adminportalfrontend/src/app/super-admin-portal/client-listing/client-listing.component.ts`

### API Integration

#### 1.1 Get Client List
```typescript
// API Method
RateMappingApiService.getClientCodeList()

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/0/0

// Response Format
[
  {
    clientCode: "CLI001",
    clientName: "ABC Corporation",
    clientId: 123,
    clientContact: "+91 9876543210",
    clientEmail: "contact@abc.com"
  }
]

// Usage in Component
const clients = await RateMappingApiService.getClientCodeList();
```

#### 1.2 Get Assigned Payment Modes
```typescript
// API Method
RateMappingApiService.getAssignedPaymentMode(clientCode)

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/3/{clientCode}

// Response Format
[
  {
    Id: 1,
    paymodeId: 3,
    paymodeName: "Net Banking",
    paymodeType: "online",
    endpoints: [...]
  }
]

// Usage
const paymentModes = await RateMappingApiService.getAssignedPaymentMode(clientCode);
```

#### 1.3 Get Payment Mode List (Master)
```typescript
// API Method
RateMappingApiService.getPaymentModeListTest()

// Endpoint
GET https://adminapi.sabpaisa.in/api/rest/payment_mode

// Response
List of all available payment modes
```

#### 1.4 Save Client Payment Mode Details
```typescript
// API Method
RateMappingApiService.saveClientDetails(data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/REST/config/saveClientDetails

// Request Payload
{
  clientId: 123,
  clientCode: "CLI001",
  paymentModes: [
    {
      paymodeId: 3,
      paymodeType: "online",
      paymodeName: "Net Banking",
      endpoints: [
        {
          epId: "1000",
          epName: "SabPaisa"
        }
      ]
    }
  ]
}

// Usage
const response = await RateMappingApiService.saveClientDetails(data);
```

#### 1.5 Save Fee Configuration
```typescript
// API Method
RateMappingApiService.saveFees(data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/REST/config/savefee

// Request Payload
{
  clientId: 123,
  clientCode: "CLI001",
  feeSlabs: [
    {
      slabNumber: 1,
      slabFloor: 0,
      slabCeiling: 1000,
      convchargesType: "percentage",
      convcharges: 2,
      endPointchargesTypes: "percentage",
      endPointcharge: 1.5,
      gstType: "percentage",
      gst: 18,
      paymodeId: "3",
      endpointId: "1000"
    }
  ]
}
```

### Implementation Workflow

1. **Step 1:** Load client list on page load
2. **Step 2:** When user clicks "Rate Mapping" on a client:
   - Open 3-step wizard modal
   - Load payment modes for that client
3. **Step 3 (Payment Mode Selection):**
   - User selects payment modes and endpoints
   - Save via `saveClientDetails()` API
4. **Step 4 (Endpoint Configuration):**
   - Configure endpoint details (priority, credentials)
   - Update mapping via `updateMapping()` API
5. **Step 5 (Rate Configuration):**
   - Configure rate slabs
   - Save via `saveFees()` API

---

## Feature 2: VIEW RATE MAPPING

### Page Location
`/sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/view/page.tsx`

### Angular Reference
`/adminportalfrontend/src/app/super-admin-portal/view-configuration/view-configuration.component.ts`

### API Integration

#### 2.1 Get Client Codes
```typescript
// API Method
RateMappingApiService.getClientCodeList()

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/0/0
```

#### 2.2 Get Fee Details (View)
```typescript
// API Method
RateMappingApiService.findCheckFee(clientCode)

// Endpoint
GET https://adminapi.sabpaisa.in/api/rest/client_ep/Fee/{clientCode}

// Response Format
[
  {
    Id: 1,
    bankName: "SabPaisa - Net Banking",
    slabNumber: 1,
    slabFloor: 0,
    slabCeiling: 1000,
    convchargesType: "percentage",
    convcharges: 2,
    endPointchargesTypes: "percentage",
    endPointcharge: 1.5,
    gstType: "percentage",
    gst: 18,
    feeforward: "YES",
    epmrchntid: 1 // Note: Used for active status
  }
]

// Usage
const feeDetails = await RateMappingApiService.findCheckFee(clientCode);
```

#### 2.3 Approve Fee Configuration
```typescript
// API Method
RateMappingApiService.approveFee(data)

// Endpoint
POST https://reportapi.sabpaisa.in/v2/REST/CheckFee/Approved/

// Request Payload
{
  approved_by: "john.doe@sabpaisa.in",
  client_code: "CLI001",
  approvedfor: "ManageFee"
}

// Usage
await RateMappingApiService.approveFee({
  approved_by: userName,
  client_code: clientCode,
  approvedfor: "ManageFee"
});
```

### Implementation Notes

- Display fee details in read-only mode
- Show approval status (based on `epmrchntid` field)
- Admin users can approve configurations
- Send email notification after approval (via separate email API)

---

## Feature 3: MANAGE RATE MAPPING

### Page Location
`/sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/manage/page.tsx`

### Angular Reference
`/adminportalfrontend/src/app/updateratemapping/updateratemapping.component.ts`

### API Integration

#### 3.1 Get Mapping Details
```typescript
// API Method
RateMappingApiService.getMappingDetail(clientCode)

// Endpoint
GET https://reportapi.sabpaisa.in/MappingDetail/Mapping/{clientCode}

// Response Format
[
  {
    mappingid: 1,
    priority: 1,
    epUsername: "merchant123",
    epPass: "password",
    epMrchntId: "MERCHANT001",
    feeForward: "YES",
    epUrl: "https://payment.gateway.com/api",
    clientId: 123,
    paymodeId: 3,
    endpointId: 1000,
    active: true,
    paymodeName: "Net Banking",
    endpointName: "SabPaisa"
  }
]
```

#### 3.2 Update Mapping (Bulk)
```typescript
// API Method
RateMappingApiService.updateMappingDetail(data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/v2/REST/UpdateMapping/

// Request Payload
{
  mappingid: 1,
  epmrchntid: "MERCHANT001",
  epusername: "merchant123",
  eppassword: "newpassword"
}

// Usage - Bulk Update Multiple Mappings
for (const mapping of selectedMappings) {
  await RateMappingApiService.updateMappingDetail({
    mappingid: mapping.id,
    epmrchntid: bulkMerchantId,
    epusername: bulkUsername,
    eppassword: bulkPassword
  });
}
```

#### 3.3 Update Mapping by ID
```typescript
// API Method
RateMappingApiService.updateMappingByID(ids, data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/REST/client/updateMapping/{clientId}/{mappingId}/

// Request Payload
{
  mappingId: 1,
  priority: 1,
  epUsername: "merchant123",
  epPass: "password",
  epMrchntId: "MERCHANT001",
  feeForward: "YES",
  epUrl: "https://payment.gateway.com/api",
  clientId: 123,
  paymodeId: 3,
  endpointId: 1000,
  active: "true"
}

// Usage
const ids = `${clientId}/${mappingId}`;
await RateMappingApiService.updateMappingByID(ids, updateData);
```

#### 3.4 Get Fee for Update
```typescript
// API Method
RateMappingApiService.getFeeForUpdate(clientCode)

// Endpoint
GET https://adminapi.sabpaisa.in/api/rest/client_ep/FeeDetail2/{clientCode}

// Response - More detailed than viewCheckFee
[
  {
    Id: 1,
    bankName: "SabPaisa - Net Banking",
    slabNumber: 1,
    slabFloor: 0,
    slabCeiling: 1000,
    convchargesType: "percentage",
    convcharges: 2,
    endPointchargesTypes: "percentage",
    endPointcharge: 1.5,
    gstType: "percentage",
    gst: 18,
    convchargesApp: 1,  // 1 = Yes, 0 = No (Apply on amount)
    epchargesApp: 1
  }
]
```

#### 3.5 Update Fee by ID
```typescript
// API Method
RateMappingApiService.updateFeeByID(feeId, data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/REST/client/updateFee/{feeId}/

// Request Payload
{
  feeId: 1,
  slabNumber: 1,
  slabFloor: 0,
  slabCeiling: 1000,
  convchargesType: "percentage",
  convcharges: 2,
  endPointchargesTypes: "percentage",
  endPointcharge: 1.5,
  gstType: "percentage",
  gst: 18,
  convchargesApp: 1,
  epchargesApp: 1
}

// Usage
await RateMappingApiService.updateFeeByID(feeId, updateData);
```

#### 3.6 Add New Slab
```typescript
// API Method
RateMappingApiService.addNewSlab(data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/v2/AddSlab/

// Request Payload
{
  FeeId: 1,
  ConvChargesType: "percentage",
  ConvCharges: 2,
  EPChargesTypes: "percentage",
  EPCharges: 1.5,
  GstType: "percentage",
  GstValue: 18,
  SlabFloor: 1001,
  SlabCeiling: 5000,
  AddedBy: "john.doe@sabpaisa.in"
}

// Response
[
  {
    Id: 2 // New slab ID
  }
]

// Usage
const result = await RateMappingApiService.addNewSlab(slabData);
if (result[0].Id > 0) {
  toast.success('Slab added successfully');
}
```

#### 3.7 Delete Slab
```typescript
// API Method
RateMappingApiService.deleteSlab(feeId, loginId, remarks)

// Endpoint
GET https://adminapi.sabpaisa.in/api/ManageFalg/Flag/{remarks}/deleteslab/{feeId}/{loginId}

// Usage
await RateMappingApiService.deleteSlab(feeId, userName, 'Removing duplicate slab');
```

#### 3.8 Manage Flags
```typescript
// API Method
RateMappingApiService.getFlagDetail(data)

// Endpoint
POST https://reportapi.sabpaisa.in/v2/ManageFalg/Flag/

// Request Payload
{
  CltCode: "CLI001",
  pType: "authtype",  // Flag types: authtype, riskcategory, etc.
  TypeValue: "SHA256", // Value depends on flag type
  upDateBy: "john.doe@sabpaisa.in"
}

// Usage - Update Auth Type
await RateMappingApiService.getFlagDetail({
  CltCode: clientCode,
  pType: "authtype",
  TypeValue: "SHA256",
  upDateBy: userName
});
```

#### 3.9 Get Remarks/History
```typescript
// API Method
RateMappingApiService.getRemarksData(feeId)

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/101/{feeId}

// Response
[
  {
    timestamp: "2024-01-15 10:30:00",
    user: "john.doe@sabpaisa.in",
    action: "updatefee",
    remarks: "Updated slab ceiling"
  }
]

// Usage
const history = await RateMappingApiService.getRemarksData(feeId);
```

#### 3.10 View Agreement PDF
```typescript
// API Method
RateMappingApiService.viewPDF(clientCode)

// Endpoint
POST https://cobkyc.sabpaisa.in/kyc/upload-merchant-document/get-merchant-agreement-by-client-code/

// Request Payload
{
  client_code: "CLI001"
}

// Response
[
  {
    file_path: "https://storage.sabpaisa.in/agreements/CLI001_agreement.pdf"
  }
]

// Usage
const pdfData = await RateMappingApiService.viewPDF(clientCode);
if (pdfData.length > 0) {
  window.open(pdfData[0].file_path, '_blank');
}
```

#### 3.11 Update Fee Forwarded
```typescript
// API Method
RateMappingApiService.updateFeeForwarded(data)

// Endpoint
POST https://adminapi.sabpaisa.in/api/v2/getDataByCommonProc/UpdateFeeForwarded/

// Request Payload
{
  p_client_id: 123,
  p_paymode_id: 3,
  p_updatedBy: "john.doe@sabpaisa.in"
}

// Usage
await RateMappingApiService.updateFeeForwarded({
  p_client_id: clientId,
  p_paymode_id: paymodeId,
  p_updatedBy: userName
});
```

### Missing Features to Add

Based on Angular implementation, these features need to be added to V5:

1. **Add New Slab Functionality** ✓ API Connected
2. **Delete Slab Functionality** ✓ API Connected
3. **Agreement PDF Viewer** ✓ API Connected
4. **Remarks/History Tracking** ✓ API Connected
5. **Bulk Update for Mappings** ✓ API Connected
6. **Bulk Update for Fees** - Needs UI implementation
7. **Flag Management (Auth Type, Risk Category)** ✓ API Connected

---

## Feature 4: ADD RATE FOR NEW PAY MODE

### Page Location
`/sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/add-new/page.tsx`

### Angular Reference
`/adminportalfrontend/src/app/AddNewRate/addratefornewpm/addratefornewpm.component.ts`

### API Integration

#### 4.1 Get Client List
```typescript
// Same as Feature 1.1
RateMappingApiService.getClientCodeList()
```

#### 4.2 Get Payment Modes for Client
```typescript
// API Method
RateMappingApiService.getPaymodeForAddNewRate(clientCode)

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/14/{clientCode}

// Response - Payment modes NOT yet configured for client
[
  {
    Id: 6,
    paymodeId: 6,
    paymodeName: "UPI"
  }
]
```

#### 4.3 Get Endpoints for Payment Mode
```typescript
// API Method
RateMappingApiService.getEndpointForAddNewRate(payModeId)

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/15/{payModeId}

// Response
[
  {
    epId: 1000,
    epName: "SabPaisa"
  },
  {
    epId: 2000,
    epName: "Razorpay"
  }
]
```

#### 4.4 Add Fee for New Payment Mode
```typescript
// API Method
RateMappingApiService.addFeeForNewPaymentMode(...)

// Endpoint
GET https://adminapi.sabpaisa.in/api/REST/AddFeeForNewPMode/{params}

// URL Parameters (in order)
clientCode/paymodeId/epid/amountFrom/amountTo/rate/commType/convFee/convFeeType/userName/gst

// Example
CLI001/6/1000/0/1000/2/percentage/1.5/percentage/john.doe@sabpaisa.in/18

// Response
[
  {
    result: "true"
  }
]

// Usage
const response = await RateMappingApiService.addFeeForNewPaymentMode(
  clientCode,
  paymodeId,
  endpointId,
  amountFrom,
  amountTo,
  rate,
  commType,
  convFee,
  convFeeType,
  userName,
  gstPercentage
);

if (response[0].result === 'true') {
  toast.success('Fee added successfully');
}
```

### Implementation Workflow

1. Select client → Load payment modes NOT configured for that client
2. Select payment mode → Load available endpoints
3. Select endpoint → Show fee configuration form
4. Enter slab details (from/to amount, rates, charges)
5. Submit → Call `addFeeForNewPaymentMode()` API

---

## Feature 5: AGGREGATOR SWAP

### Page Location
`/sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/swap/page.tsx`

### Angular Reference
`/adminportalfrontend/src/app/AggName/change-agg-name/change-agg-name.component.ts`

### API Integration

#### 5.1 Get Client List
```typescript
// Same as Feature 1.1
RateMappingApiService.getClientCodeList()
```

#### 5.2 Get Current Aggregator Name (View)
```typescript
// API Method
RateMappingApiService.getAggName(params)

// Endpoint
GET https://adminapi.sabpaisa.in/api/REST/ViewAggName/{params}

// Format for SELECT
S/{clientCode}/{paymentMode}/0/NA/NA/NA/NA/0

// Example
S/CLI001/3/0/NA/NA/NA/NA/0

// Response
[
  {
    ep_id: 1000,
    ep_name: "SabPaisa",
    merchant_id: "MERCHANT001",
    username: "merchant123",
    ep_url: "https://payment.sabpaisa.com/api"
  }
]

// Usage
const params = `S/${clientCode}/${paymentMode}/0/NA/NA/NA/NA/0`;
const currentAgg = await RateMappingApiService.getAggName(params);
```

#### 5.3 Update Aggregator Name
```typescript
// API Method
RateMappingApiService.getAggName(params)

// Endpoint (Same as 5.2, different format)
GET https://adminapi.sabpaisa.in/api/REST/ViewAggName/{params}

// Format for UPDATE
U/{clientCode}/{paymentMode}/{newAggEpId}/{merchantId}/{password}/{url}/{username}/{oldEpId}

// IMPORTANT: URL Format
// Original URL: https://payment.razorpay.com/api/v1/checkout
// Formatted URL: payment.razorpay.com:api:v1:checkout (replace / with :)

// Example
U/CLI001/3/2000/RAZORPAY123/password123/payment.razorpay.com:api:v1/merchant@razorpay.com/1000

// Response
[
  {
    status: "success",
    message: "Aggregator updated successfully"
  }
]

// Usage
// Step 1: Format URL
const formattedUrl = epUrl
  .replace(/^https?:\/\//, '')  // Remove https://
  .replace(/\//g, ':');          // Replace / with :

// Step 2: Build params
const params = `U/${clientCode}/${paymentMode}/${newAggEpId}/${merchantId}/${password}/${formattedUrl}/${username}/${oldEpId}`;

// Step 3: Call API
const result = await RateMappingApiService.getAggName(params);
```

#### 5.4 Get Aggregators for Payment Mode (for dropdown)
```typescript
// API Method
RateMappingApiService.getAggNameForSwap(payModeId)

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/17/{payModeId}

// Response
[
  {
    epId: 1000,
    epName: "SabPaisa",
    agrName: "SabPaisa"
  },
  {
    epId: 2000,
    epName: "Razorpay",
    agrName: "Razorpay"
  }
]
```

### Missing Features to Add

1. **Endpoint Credential Fields** - Add fields for:
   - Merchant ID
   - Username
   - Password
   - API URL

### Implementation Workflow

1. Select client
2. Select payment mode
3. Click "View" → Load current aggregator details
4. Display current aggregator info (name, merchant ID, URL)
5. Select new aggregator from dropdown
6. Enter new credentials (merchant ID, username, password, URL)
7. Validate: New aggregator must be different from current
8. Submit → Call update API with formatted parameters

---

## Feature 6: CLONE RATE MAPPING

### Page Location
`/sabpaisa_admin_v5/app/(dashboard)/config/rate-mapping/clone/page.tsx`

### Angular Reference
`/adminportalfrontend/src/app/cloneratemapping/cloneratemapping.component.ts`

### API Integration

#### 6.1 Get Source Client List
```typescript
// Same as Feature 1.1
RateMappingApiService.getClientCodeList()
```

#### 6.2 Get Target Client List (For Mapping)
```typescript
// API Method
RateMappingApiService.getClientCodeListMapping()

// Endpoint
GET https://reportapi.sabpaisa.in/common-data/9/0

// Response - Clients that can be mapped to
[
  {
    clientCode: "CLI002",
    clientName: "XYZ Enterprises",
    clientId: 124
  }
]
```

#### 6.3 View Source Client Fees (Preview)
```typescript
// Same as Feature 2.2
RateMappingApiService.findCheckFee(clientCode)

// Show preview of what will be cloned
```

#### 6.4 Clone Rate Mapping
```typescript
// API Method
RateMappingApiService.cloneRateMapping(clientCodeFrom, clientCodeTo, loginBy)

// Endpoint
GET https://adminapi.sabpaisa.in/api/clone/{clientCodeFrom}/{clientCodeTo}/{loginBy}

// Example
https://adminapi.sabpaisa.in/api/clone/CLI001/CLI002/john.doe@sabpaisa.in

// Response
[
  {
    ID: 1  // Result code
  }
]

// Result Codes:
// 1 = Success - Rate mapping cloned successfully
// 2 = Error - Target client already has rate configuration
// 3 = Error - Target client already has rate configuration
// 0 = Error - Target client doesn't exist in database

// Usage
const result = await RateMappingApiService.cloneRateMapping(
  sourceClientCode,
  targetClientCode,
  userName
);

switch (result[0].ID) {
  case 1:
    toast.success('Rate mapping cloned successfully');
    break;
  case 2:
  case 3:
    toast.error('Target client already has rate configuration');
    break;
  default:
    toast.error('Target client does not exist');
}
```

### Implementation Workflow

1. Select source client (FROM) → Show fee preview
2. Select target client (TO)
3. Validate: Source and target must be different
4. Show confirmation dialog with details
5. Submit → Clone all mappings and fees
6. Display result message based on response code

---

## Common Patterns & Best Practices

### 1. Error Handling
```typescript
try {
  const data = await RateMappingApiService.getClientCodeList();
  setClients(data);
} catch (error) {
  toast.error('Failed to load clients');
  console.error(error);
}
```

### 2. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const loadData = async () => {
  setIsLoading(true);
  try {
    const data = await RateMappingApiService.getSomeData();
    setData(data);
  } catch (error) {
    toast.error('Failed to load data');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. User Permissions
```typescript
// Get current user's permissions for rate mapping
const loginId = localStorage.getItem('loginId');
const permissions = await RateMappingApiService.getRateMappingAuth(loginId);

// Check permissions before showing actions
if (permissions.manage_fee) {
  // Show fee management options
}
```

### 4. Approval Workflow
```typescript
// Check if client config is already approved
const approvalStatus = await RateMappingApiService.checkInApproveTable(clientCode);

if (approvalStatus.length > 0) {
  toast.warning('Cannot update - already approved');
  return;
}

// Proceed with update...
```

### 5. History Tracking
```typescript
// After updating fee, insert history record
await RateMappingApiService.updateFeeByID(feeId, feeData);

// Insert history
await RateMappingApiService.approveFee({
  approved_by: `${userName}:${remarks}:${feeId}`,
  client_code: clientCode,
  approvedfor: 'updatefee'
});
```

---

## Environment Variables

Add these to your `.env.local`:

```bash
# Admin API (Main)
NEXT_PUBLIC_ADMIN_URL=https://stage-adminapi.sabpaisa.in/SabPaisaAdmin/

# Staging URL
NEXT_PUBLIC_STAGING_URL=https://stage-adminapi.sabpaisa.in/

# Report API
NEXT_PUBLIC_STG_REPORT_API=https://stage-reportapi.sabpaisa.in/

# COB API
NEXT_PUBLIC_BASE_URL_NEW=https://cobawsapi.sabpaisa.in/

# Rate Mapping Base URLs
NEXT_PUBLIC_BASE_URL_RATE_MAPPING=https://stage-adminapi.sabpaisa.in/
NEXT_PUBLIC_BASE_URL_RATE_MAPPING2=https://adminapi.sabpaisa.in/api/

# Access API
NEXT_PUBLIC_ACCESS_API=https://adminapi.sabpaisa.in/

# COB KYC
NEXT_PUBLIC_COBKYC_URL=https://cobkyc.sabpaisa.in/
```

---

## Testing Checklist

### Feature 1: Create Rate Mapping
- [ ] Load client list
- [ ] Open wizard for a client
- [ ] Select payment modes and endpoints
- [ ] Save payment mode configuration
- [ ] Configure rate slabs
- [ ] Save fee configuration
- [ ] Verify success message

### Feature 2: View Rate Mapping
- [ ] Load client list
- [ ] Select client
- [ ] Display fee details
- [ ] Show approval status
- [ ] Admin: Approve configuration
- [ ] Verify email sent after approval

### Feature 3: Manage Rate Mapping
- [ ] Load mapping details
- [ ] Update mapping credentials (single)
- [ ] Bulk update mappings
- [ ] Update fee slab
- [ ] Add new slab
- [ ] Delete slab
- [ ] View agreement PDF
- [ ] View remarks/history
- [ ] Update fee forwarded
- [ ] Manage flags (auth type, risk category)

### Feature 4: Add Rate for New Pay Mode
- [ ] Select client
- [ ] Load available payment modes
- [ ] Select payment mode
- [ ] Load endpoints
- [ ] Enter fee details
- [ ] Submit and verify

### Feature 5: Aggregator Swap
- [ ] Select client and payment mode
- [ ] View current aggregator
- [ ] Select new aggregator
- [ ] Enter credentials (merchant ID, username, password, URL)
- [ ] Validate different aggregator
- [ ] Submit swap
- [ ] Verify success

### Feature 6: Clone Rate Mapping
- [ ] Select source client
- [ ] Preview source fees
- [ ] Select target client
- [ ] Validate different clients
- [ ] Clone configuration
- [ ] Handle error cases (already configured, doesn't exist)

---

## Known Issues & Solutions

### Issue 1: CORS Errors
**Solution:** APIs are configured to use `credentials: 'include'` for cookie-based auth

### Issue 2: Large Client Listing Component
**Solution:** The Angular component is 56,990 tokens. Read it in chunks for analysis.

### Issue 3: URL Formatting for Aggregator Swap
**Solution:** URLs must be formatted by replacing `https://` and `/` with `:` as shown in section 5.3

### Issue 4: Approval Check
**Solution:** Always check `checkInApproveTable()` before allowing updates

---

## Migration Notes from Angular to V5

### Key Differences
1. **State Management:** Angular uses component state, V5 uses React hooks
2. **HTTP Client:** Angular uses HttpClient, V5 uses fetch API
3. **Routing:** Angular uses Router, V5 uses Next.js routing
4. **Forms:** Angular uses Template-driven forms, V5 uses Controlled components

### Maintained Consistency
1. **API Endpoints:** Exact same URLs and parameters
2. **Request/Response Format:** Matching data structures
3. **Business Logic:** Same validation rules
4. **Workflow:** Identical user flows

---

## Support & Maintenance

For any issues or questions regarding Rate Mapping APIs:

1. Check this documentation first
2. Review Angular implementation in `/adminportalfrontend/src/app/super-admin-portal/client-list.service.ts`
3. Check API service implementation in `/sabpaisa_admin_v5/services/api/RateMappingApiService.ts`
4. Review individual Angular components for specific feature logic

---

## Version History

- **v1.0** (2024-10-09): Initial API integration for all 6 features
  - Connected all APIs
  - Documented all endpoints
  - Added missing aggregator swap API
  - Created comprehensive documentation

---

**Last Updated:** October 9, 2024
**Status:** ✅ All APIs Connected and Documented
