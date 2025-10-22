# Admin & Config API Integration Documentation

## Overview
This document provides a comprehensive guide for integrating 12 Admin/Config features with real APIs in the V5 Admin Portal. The AdminApiService has been created with all necessary methods.

## Service Location
**File:** `/sabpaisa_admin_v5/services/api/AdminApiService.ts`

---

## Feature Integration Details

### 1. USER MANAGEMENT
**V5 Page:** `/app/(dashboard)/admin/users/page.tsx`
**Status:** Keep mock data (Angular component is empty/under maintenance)
**Implementation:** No API integration needed yet

---

### 2. MENU SETTINGS
**V5 Page:** `/app/(dashboard)/admin/menu-settings/page.tsx`
**APIs Available:**
- `getRoleList()` - Get all roles
- `getFormList(roleId)` - Get forms for a specific role
- `setMenuRights(roleId, formIds, count)` - Set menu rights

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch roles on page load
useEffect(() => {
  const fetchRoles = async () => {
    try {
      const roles = await adminApiService.getRoleList();
      setRoleList(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };
  fetchRoles();
}, []);

// Fetch forms when role is selected
const handleRoleChange = async (roleId: string) => {
  try {
    const forms = await adminApiService.getFormList(roleId);
    setFormList(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
  }
};

// Save menu rights
const handleSubmit = async () => {
  try {
    const formIds = selectedForms.join(',');
    const count = selectedForms.length;
    await adminApiService.setMenuRights(roleId, formIds, count);
    alert('Menu rights updated successfully');
  } catch (error) {
    console.error('Error setting menu rights:', error);
  }
};
```

---

### 3. DYNAMIC MENU
**V5 Page:** `/app/(dashboard)/admin/dynamic-menu/page.tsx`
**APIs Available:**
- `setDynamicMenu(userName, menuType)` - Set dynamic menu for user

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

const handleSubmit = async () => {
  if (!userName || !menuType) {
    alert('Username and menu type are required');
    return;
  }

  try {
    const result = await adminApiService.setDynamicMenu(userName, menuType);
    if (result[0].isExist === 0) {
      alert('Record added successfully');
      setUserName('');
      setMenuType('');
    } else {
      alert('Record already exists');
    }
  } catch (error) {
    console.error('Error setting dynamic menu:', error);
  }
};
```

---

### 4. ACCESS URM
**V5 Page:** `/app/(dashboard)/admin/access-urm/page.tsx`
**APIs Available:**
- `getRateMappingAuth(loginId)` - Get permissions for a user
- `createAccess(data)` - Create new permissions
- `updateAccess(id, data)` - Update existing permissions

**Permissions:**
- `manage_client`
- `manage_payment_mode`
- `manage_mapping`
- `manage_fee`
- `manage_client_configuration`
- `manage_feed_forwarded`

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch permissions when user is selected
const handleUserSelect = async (loginId: string) => {
  try {
    const permissions = await adminApiService.getRateMappingAuth(loginId);
    if (permissions.length === 0) {
      // No permissions, show create form
      setMode('create');
      setPermissions({
        manage_client: false,
        manage_payment_mode: false,
        manage_mapping: false,
        manage_fee: false,
        manage_client_configuration: false,
        manage_feed_forwarded: false,
      });
    } else {
      // Permissions exist, show update form
      setMode('update');
      setPermissionId(permissions[0].id);
      setPermissions(permissions[0]);
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
  }
};

// Create permissions
const handleCreate = async () => {
  try {
    const data = {
      login_id: selectedLoginId,
      ...permissions,
    };
    await adminApiService.createAccess(data);
    alert('Permissions created successfully');
  } catch (error) {
    console.error('Error creating permissions:', error);
  }
};

// Update permissions
const handleUpdate = async () => {
  try {
    const data = {
      login_id: selectedLoginId,
      ...permissions,
    };
    await adminApiService.updateAccess(permissionId, data);
    alert('Permissions updated successfully');
  } catch (error) {
    console.error('Error updating permissions:', error);
  }
};
```

---

### 5. TRANSACTION LIMIT
**V5 Page:** `/app/(dashboard)/admin/transaction-limit/page.tsx`
**APIs Available:**
- `setTransactionLimit(data)` - Set payment amount range
- `getTransactionLimit(clientCode)` - Get payment amount range

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch transaction limit for a client
const handleClientSelect = async (clientCode: string) => {
  try {
    const limit = await adminApiService.getTransactionLimit(clientCode);
    setFormData({
      minimum_payment_amount: limit.minimum_payment_amount,
      maximum_payment_amount: limit.maximum_payment_amount,
    });
  } catch (error) {
    console.error('Error fetching transaction limit:', error);
  }
};

// Set transaction limit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const data = {
      client_code: selectedClientCode,
      minimum_payment_amount: Number(formData.minimum_payment_amount),
      maximum_payment_amount: Number(formData.maximum_payment_amount),
    };
    await adminApiService.setTransactionLimit(data);
    alert('Transaction limit set successfully');
  } catch (error) {
    console.error('Error setting transaction limit:', error);
  }
};
```

---

### 6. PRODUCT
**V5 Page:** `/app/(dashboard)/admin/product/page.tsx`
**APIs Available:**
- `assignProduct(data)` - Assign product to merchant
- `getClientList()` - Get client list

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch client list on page load
useEffect(() => {
  const fetchClients = async () => {
    try {
      const clients = await adminApiService.getClientList();
      setClientList(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  fetchClients();
}, []);

// Assign product
const handleSubmit = async () => {
  try {
    const data = {
      client_code: selectedClientCode,
      app_code: selectedProductId,
    };
    const result = await adminApiService.assignProduct(data);
    alert(result.message || 'Product assigned successfully');
  } catch (error) {
    console.error('Error assigning product:', error);
  }
};
```

---

### 7. POC (Mobile Blocking)
**V5 Page:** `/app/(dashboard)/admin/poc/page.tsx`
**APIs Available:**
- `getAndroidData()` - Get Android client codes
- `getIosData()` - Get iOS client codes
- `updateClientBlocking(clientId, assetsFlag, playstoreFlag)` - Update blocking flags
- `getClientCodeHistory(clientCode, platform)` - Get blocking history

**Note:** V5 POC page is for contacts, Angular is for mobile blocking. Recommend keeping mobile blocking APIs and updating the page purpose.

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch data on page load
useEffect(() => {
  const fetchData = async () => {
    try {
      const [androidData, iosData] = await Promise.all([
        adminApiService.getAndroidData(),
        adminApiService.getIosData(),
      ]);
      setAndroidList(androidData);
      setIosList(iosData);
    } catch (error) {
      console.error('Error fetching POC data:', error);
    }
  };
  fetchData();
}, []);

// Toggle blocking
const toggleBlock = async (clientCode: string, assetsFlag: boolean, playstoreFlag: boolean) => {
  try {
    await adminApiService.updateClientBlocking(clientCode, !assetsFlag, playstoreFlag);
    // Refresh data
    const androidData = await adminApiService.getAndroidData();
    setAndroidList(androidData);
  } catch (error) {
    console.error('Error updating blocking:', error);
  }
};

// View history
const viewHistory = async (clientCode: string, platform: string) => {
  try {
    const history = await adminApiService.getClientCodeHistory(clientCode, platform);
    setHistoryData(history.data);
    setShowHistoryModal(true);
  } catch (error) {
    console.error('Error fetching history:', error);
  }
};
```

---

### 8. GENERATE KEY
**V5 Page:** `/app/(dashboard)/admin/generate-key/page.tsx`
**APIs Available:**
- `generateClientForm(data)` - Generate client form for COB

**Note:** V5 generates API keys, Angular generates client forms. Different purposes - keep both approaches.

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

const handleGenerate = async () => {
  try {
    const data = {
      clientId: formData.clientId,
      clientCode: formData.clientCode,
      clientContact: formData.clientContact,
      clientEmail: formData.clientEmail,
      address: formData.address,
      clientLogoPath: formData.clientLogoPath,
      clientName: formData.clientName,
      clientLink: formData.clientLink,
      stateId: formData.stateId,
      bid: formData.bid,
      stateName: formData.stateName,
      bankName: formData.bankName,
      client_username: formData.client_username,
      client_password: formData.client_password,
      appId: formData.appId,
      status: formData.status,
      client_type: formData.client_type,
      successUrl: formData.successUrl,
      failedUrl: formData.failedUrl,
      subscriptionstatus: formData.subscriptionstatus,
      businessType: formData.businessType,
      businessctgcode: formData.businessctgcode,
      referralcode: formData.referralcode,
      mesaagebypassflag: formData.mesaagebypassflag,
      forcesuccessflag: formData.forcesuccessflag,
      clientMcc: formData.clientMcc,
      masterName: formData.masterName,
    };
    const result = await adminApiService.generateClientForm(data);
    setGeneratedData(result);
    setShowResult(true);
  } catch (error) {
    console.error('Error generating client form:', error);
  }
};
```

---

### 9. CHANGE PASSWORD
**V5 Page:** `/app/(dashboard)/admin/change-password/page.tsx`
**APIs Available:**
- `changePassword(data)` - Change user password
- `validatePassword(password)` - Validate password strength

**Password Validation:** Must contain at least one number, one uppercase letter, one lowercase letter, and be at least 8 characters

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate new password
  if (!adminApiService.validatePassword(formData.newPassword)) {
    alert('Password must contain at least one number, one uppercase and lowercase letter, and at least 8 characters');
    return;
  }

  // Check if passwords match
  if (formData.newPassword !== formData.confirmPassword) {
    alert('New password and confirm password must match');
    return;
  }

  try {
    const userName = localStorage.getItem('userName');
    const data = {
      userLoginId: userName || '',
      newPassword: formData.newPassword,
    };
    const result = await adminApiService.changePassword(data);

    if (result.msg.toUpperCase() === 'PASSWORD CHANGED SUCCESSFULLY') {
      alert('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      alert(result.msg);
    }
  } catch (error) {
    console.error('Error changing password:', error);
  }
};
```

---

### 10. MASTERS
**V5 Page:** `/app/(dashboard)/config/masters/page.tsx`
**APIs Available:**
- `getAggregatorList()` - Get aggregator list
- `manageAggregator(operation, id, code, name, userName, isActive)` - Manage aggregator (S/I/U)
- `managePaymentStatus(operation, id, code, name, userName, isActive)` - Manage payment status
- `manageCategory(operation, id, aggCode, categoryCode, categoryName, userName, isActive)` - Manage category
- `managePaymentMode(operation, id, name, type)` - Manage payment mode

**Master Types:**
1. Aggregator
2. Payment Mode
3. Payment Status
4. Category

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch masters based on selected type
const fetchMasters = async (type: MasterType) => {
  try {
    const userName = localStorage.getItem('userName') || '';
    let data: any[] = [];

    switch (type) {
      case 'Aggregator':
        data = await adminApiService.manageAggregator('S', 0, '', '', userName, 1);
        break;
      case 'Payment Mode':
        data = await adminApiService.managePaymentMode('S', '0', '', '');
        break;
      case 'Payment Status':
        data = await adminApiService.managePaymentStatus('S', 0, '', '', userName, 1);
        break;
      case 'Category':
        data = await adminApiService.manageCategory('S', 0, '', '', '', userName, 1);
        break;
    }

    setMasterData(data);
  } catch (error) {
    console.error('Error fetching masters:', error);
  }
};

// Save/Update Aggregator
const saveAggregator = async (mode: 'create' | 'update') => {
  try {
    const userName = localStorage.getItem('userName') || '';
    const operation = mode === 'create' ? 'I' : 'U';
    const isActive = formData.isActive ? 1 : 0;

    const result = await adminApiService.manageAggregator(
      operation,
      mode === 'update' ? editingItem.id : 0,
      formData.code,
      formData.name,
      userName,
      isActive
    );

    alert(mode === 'create' ? 'Record saved successfully' : 'Record updated successfully');
    fetchMasters('Aggregator');
  } catch (error) {
    console.error('Error saving aggregator:', error);
  }
};

// Similar implementations for Payment Status, Category, and Payment Mode
```

---

### 11. MAPPERS
**V5 Page:** `/app/(dashboard)/config/mappers/page.tsx`
**APIs Available:**
- `getPaymentModeList()` - Get payment mode list
- `getPaymodeAggregatorMapping(paymentMode)` - Get mapper for payment mode
- `updatePaymodeAggregatorMapping(paymentMode, pcodes, count)` - Update mapper

**Note:** V5 is field mappings, Angular is payment mode-aggregator mapping. These are different concepts. Recommend keeping both.

**Implementation Guide (Angular approach):**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Fetch payment modes on page load
useEffect(() => {
  const fetchPaymentModes = async () => {
    try {
      const modes = await adminApiService.getPaymentModeList();
      setPaymentModeList(modes);
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    }
  };
  fetchPaymentModes();
}, []);

// Fetch mapping when payment mode is selected
const handlePaymentModeChange = async (paymentMode: string) => {
  try {
    const mappings = await adminApiService.getPaymodeAggregatorMapping(paymentMode);

    // Separate into assigned and unassigned
    const assigned = mappings.filter(m => m.result === 1);
    const unassigned = mappings.filter(m => m.result === 0);

    setAssignedList(assigned);
    setUnassignedList(unassigned);
  } catch (error) {
    console.error('Error fetching mappings:', error);
  }
};

// Save mappings
const handleSubmit = async () => {
  try {
    // Build pcodes string from assigned list
    const pcodes = assignedList.map(item => item.pcode).join(':');
    const count = assignedList.length;

    await adminApiService.updatePaymodeAggregatorMapping(
      selectedPaymentMode,
      pcodes,
      count
    );

    alert('Mappings updated successfully');
    // Refresh data
    handlePaymentModeChange(selectedPaymentMode);
  } catch (error) {
    console.error('Error updating mappings:', error);
  }
};
```

---

### 12. FEE CONFIGURATION
**V5 Page:** `/app/(dashboard)/config/fees/page.tsx`
**APIs Available:**
- `saveFee(feeData)` - Save fee configuration
- `findFee(clientCode)` - Find fee by client code
- `approveFee(feeData)` - Approve fee

**Implementation Guide:**
```typescript
import adminApiService from '@/services/api/AdminApiService';

// Find fee for a client
const handleFindFee = async (clientCode: string) => {
  try {
    const feeData = await adminApiService.findFee(clientCode);
    setFeeDetails(feeData);
    setShowFeeDetails(true);
  } catch (error) {
    console.error('Error finding fee:', error);
  }
};

// Save fee configuration
const handleSaveFee = async () => {
  try {
    const feeData = {
      // Fee configuration structure
      // Based on your specific fee structure
    };
    await adminApiService.saveFee(feeData);
    alert('Fee configuration saved successfully');
  } catch (error) {
    console.error('Error saving fee:', error);
  }
};

// Approve fee
const handleApproveFee = async () => {
  try {
    const approvalData = {
      // Approval data structure
    };
    await adminApiService.approveFee(approvalData);
    alert('Fee approved successfully');
  } catch (error) {
    console.error('Error approving fee:', error);
  }
};
```

---

## Authentication & Headers

All API calls automatically include:
- **Authorization Header:** `Bearer <token>` (from localStorage)
- **API Key:** `api-key` header (for specific APIs that require it)

The service handles this automatically via interceptors.

---

## Error Handling

Implement consistent error handling across all pages:

```typescript
try {
  const result = await adminApiService.someMethod();
  // Success handling
} catch (error) {
  console.error('Error:', error);
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      router.push('/login');
    } else if (error.response?.status === 403) {
      // Forbidden
      alert('You do not have permission to perform this action');
    } else {
      // Other errors
      alert(error.response?.data?.message || 'An error occurred');
    }
  } else {
    alert('An unexpected error occurred');
  }
}
```

---

## Base URLs

The following base URLs are configured in AdminApiService:

- **Report API:** `https://reportapi.sabpaisa.in`
- **Admin API:** `https://adminapi.sabpaisa.in/api`
- **Access API:** `https://adminapi.sabpaisa.in`
- **PayLink API:** `https://sendpaylink.sabpaisa.in/api`
- **COB API:** `https://cobawsapi.sabpaisa.in`
- **Mobile POC API:** `https://mobile-prodpoc.sabpaisa.in/admin`
- **Login API:** `process.env.NEXT_PUBLIC_LOGIN_BASE_URL`

---

## Special Cases & Decisions

### POC Feature
- **Angular:** Mobile app blocking functionality
- **V5:** Contact management
- **Decision:** Keep Angular's mobile blocking approach as it provides value. Update V5 page to match this functionality or keep separate for different purposes.

### Generate Key Feature
- **Angular:** Generates client forms for COB manual process
- **V5:** Generates API keys for merchants
- **Decision:** These serve different purposes. Keep both implementations.

### Mappers Feature
- **Angular:** Payment mode to aggregator mapping
- **V5:** Field-level data mapping between systems
- **Decision:** Different concepts. Angular's approach is for payment routing, V5's approach is for data transformation. Keep both.

---

## Testing Recommendations

1. **Unit Tests:** Test each API method independently
2. **Integration Tests:** Test full user flows
3. **Error Scenarios:** Test network failures, 401/403 errors, validation errors
4. **Edge Cases:** Test with empty responses, large datasets, special characters
5. **Performance:** Monitor API response times, implement loading states

---

## Next Steps

1. Update each V5 page to use AdminApiService
2. Replace mock data with real API calls
3. Implement proper error handling and loading states
4. Add form validation matching Angular validation rules
5. Test all CRUD operations
6. Update UI/UX based on actual API responses
7. Implement proper state management (consider React Query or SWR)
8. Add request/response logging for debugging
9. Implement retry logic for failed requests
10. Add API response caching where appropriate

---

## Issues & Considerations

1. **Environment Variables:** Ensure LOGIN_BASE_URL is configured
2. **CORS:** Backend may need CORS configuration for V5 domain
3. **Token Refresh:** Implement token refresh logic if tokens expire
4. **API Versioning:** Some APIs may have version differences
5. **Data Format:** Some APIs return arrays even for single records
6. **String-based Parameters:** Many APIs use slash-separated string parameters (legacy pattern)
7. **Response Consistency:** Different APIs have different response formats
8. **Error Messages:** Standardize error message handling across all features

---

## Example Complete Page Integration

Here's a complete example for Menu Settings page:

```typescript
'use client'

import React, { useState, useEffect } from 'react'
import adminApiService from '@/services/api/AdminApiService'
import { Plus, Save, Search, CheckSquare, Square } from 'lucide-react'

interface Role {
  roleId: number
  roleName: string
}

interface Form {
  Id: number
  formName: string
  clientId: number
}

export default function MenuSettingsPage() {
  const [roleList, setRoleList] = useState<Role[]>([])
  const [formList, setFormList] = useState<Form[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedForms, setSelectedForms] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const roles = await adminApiService.getRoleList()
      setRoleList(roles)
    } catch (err) {
      setError('Failed to fetch roles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (roleId: string) => {
    setSelectedRole(roleId)
    setSelectedForms([])

    try {
      setLoading(true)
      const forms = await adminApiService.getFormList(roleId)
      setFormList(forms)

      // Set initially selected forms (those with clientId === 1)
      const preSelected = forms
        .filter(f => f.clientId === 1)
        .map(f => f.Id)
      setSelectedForms(preSelected)
    } catch (err) {
      setError('Failed to fetch forms')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleForm = (formId: number) => {
    setSelectedForms(prev =>
      prev.includes(formId)
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedRole) {
      alert('Please select a role')
      return
    }

    if (selectedForms.length === 0) {
      alert('Please select at least one form')
      return
    }

    if (!confirm('Are you sure you want to reset rights?')) {
      return
    }

    try {
      setLoading(true)
      const formIds = selectedForms.join(',')
      const count = selectedForms.length

      await adminApiService.setMenuRights(selectedRole, formIds, count)
      alert('Menu rights updated successfully')

      // Refresh form list
      await handleRoleChange(selectedRole)
    } catch (err) {
      setError('Failed to update menu rights')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Menu Settings
            </h1>
            <p className="text-sm text-slate-400">
              Configure menu rights for roles
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                disabled={loading}
              >
                <option value="">-- Select Role --</option>
                {roleList.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>

            {formList.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Assign Forms ({selectedForms.length} selected)
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {formList.map((form) => (
                      <div
                        key={form.Id}
                        onClick={() => toggleForm(form.Id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedForms.includes(form.Id)
                            ? 'bg-orange-500/10 border-orange-500/50'
                            : 'bg-slate-900/40 border-slate-600 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectedForms.includes(form.Id) ? (
                            <CheckSquare className="w-5 h-5 text-orange-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-white">
                              {form.formName}
                            </h3>
                            <p className="text-xs text-slate-400">ID: {form.Id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Menu Rights'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Conclusion

The AdminApiService provides a complete set of methods for all 12 features. Each page needs to be updated to:
1. Import adminApiService
2. Replace mock data with API calls
3. Implement proper error handling
4. Add loading states
5. Match validation rules from Angular

The service is production-ready and includes proper TypeScript types, error handling, and authentication.
