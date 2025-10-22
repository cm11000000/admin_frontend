# Transaction System - Quick Start Guide

## Overview
World-class transaction management system with mobile-first design, advanced filtering, and real-time updates.

## Quick Access

### Pages
- **Transaction List**: `/transactions`
- **Transaction Detail**: `/transactions/[id]`

### Components Location
```
components/transactions/
├── TransactionCard.tsx           # Mobile card
├── TransactionTable.tsx          # Desktop table
├── TransactionFilters.tsx        # Filter panel
├── TransactionDetailModal.tsx    # Detail modal
├── TransactionSkeleton.tsx       # Loading states
└── index.ts                      # Exports
```

## Key Features

### 1. Mobile-First Design
- Swipe actions on transaction cards
- Touch-friendly filters in drawer
- Full-screen modals on mobile
- Adaptive grid/table layouts

### 2. Advanced Filtering
- Date range, status, payment method
- Amount range, gateway, client
- Settlement status
- Applied filters chips

### 3. Search
- Transaction ID, merchant ID
- Customer email, phone number
- Debounced for performance

### 4. Infinite Scroll
- Seamless pagination
- Loading indicators
- Auto-load on scroll

### 5. Bulk Actions
- Multi-select transactions
- Bulk export, refund
- Clear selection

### 6. Export
- CSV, Excel, PDF formats
- Current filters applied
- Background processing

## Usage Examples

### Import Components
```tsx
import {
  TransactionCard,
  TransactionTable,
  TransactionFilters,
  TransactionDetailModal,
  TransactionListSkeleton,
} from '@/components/transactions';
```

### Use Store
```tsx
import { useTransactionStore } from '@/stores/transactionStore';

const {
  transactions,
  isLoading,
  filters,
  fetchTransactions,
  setFilter,
  applyFilters,
} = useTransactionStore();
```

### Display Cards
```tsx
<div className="grid lg:grid-cols-2 gap-4">
  {transactions.map(txn => (
    <TransactionCard
      key={txn.id}
      transaction={txn}
      onViewDetails={handleView}
      onRefund={handleRefund}
    />
  ))}
</div>
```

### Display Table
```tsx
<TransactionTable
  transactions={transactions}
  onSort={handleSort}
  onViewDetails={handleView}
  selectedIds={selectedIds}
  onSelectTransaction={handleSelect}
/>
```

### Apply Filters
```tsx
<TransactionFilters
  filters={filters}
  onFiltersChange={setFilters}
  onApply={applyFilters}
  onClear={clearFilters}
  appliedCount={appliedCount}
/>
```

## API Service

### Search Transactions
```tsx
const response = await transactionService.searchTransactions({
  status: ['success'],
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  page: 1,
  pageSize: 20,
});
```

### Get Transaction Details
```tsx
const transaction = await transactionService.getTransaction(id);
```

### Refund Transaction
```tsx
await transactionService.refundTransaction(id, {
  amount: 1000,
  reason: 'Customer request',
  notes: 'Optional notes',
});
```

### Export Transactions
```tsx
await transactionService.exportTransactions({
  format: 'csv',
  status: ['success'],
  dateFrom: '2024-01-01',
});
```

## State Management

### Fetch Data
```tsx
// Initial fetch
useEffect(() => {
  fetchTransactions(true);
}, []);

// Refresh
await refreshTransactions();

// Load more (infinite scroll)
await loadMoreTransactions();
```

### Manage Filters
```tsx
// Set single filter
setFilter('status', ['success', 'pending']);

// Set multiple filters
setFilters({
  status: ['success'],
  dateFrom: '2024-01-01',
  amountFrom: 1000,
});

// Apply filters
await applyFilters();

// Clear filters
clearFilters();
```

### Selection
```tsx
// Select transaction
selectTransaction(id);

// Deselect
deselectTransaction(id);

// Select all
selectAllTransactions();

// Clear selection
clearSelection();

// Get selected count
const count = getSelectedCount();
```

## Responsive Behavior

### Mobile (< 768px)
- Card layout
- Drawer filters
- Full-screen modals
- Swipe actions

### Tablet (768px - 1024px)
- 2-column grid
- Drawer filters
- Larger modals

### Desktop (> 1024px)
- Table layout option
- Sidebar filters
- Centered modals
- Hover states

## Loading States

### Initial Load
```tsx
{isLoading ? (
  <TransactionListSkeleton viewMode="grid" />
) : (
  <TransactionList />
)}
```

### Empty States
```tsx
{transactions.length === 0 && (
  <TransactionEmptyState
    hasFilters={appliedCount > 0}
    onClearFilters={clearFilters}
  />
)}
```

## Animations

All animations powered by Framer Motion:
- Card entry animations
- Timeline stagger
- Modal transitions
- Swipe gestures
- Loading skeletons

## Performance Tips

1. **Use Infinite Scroll**: Don't load all at once
2. **Debounce Search**: 500ms delay prevents spam
3. **Optimize Filters**: Apply filters, don't auto-filter
4. **Memoize**: Use React.memo for card/row components
5. **Virtual Scrolling**: Table auto-virtualizes

## Common Patterns

### Filter + Search + Export
```tsx
const [search, setSearch] = useState('');

// Debounced search
const handleSearch = debounce((value) => {
  setFilter('search', value);
  applyFilters();
}, 500);

// Export with filters
const handleExport = async (format) => {
  await exportTransactions(format);
  toast.success('Export complete');
};

return (
  <>
    <Input onChange={(e) => handleSearch(e.target.value)} />
    <TransactionFilters {...filterProps} />
    <Button onClick={() => handleExport('csv')}>Export</Button>
  </>
);
```

### View Details
```tsx
const [selectedTxn, setSelectedTxn] = useState(null);
const [modalOpen, setModalOpen] = useState(false);

const handleView = async (transaction) => {
  await fetchTransactionById(transaction.id);
  setModalOpen(true);
};

<TransactionDetailModal
  transaction={selectedTransaction}
  open={modalOpen}
  onClose={() => setModalOpen(false)}
/>
```

### Bulk Actions
```tsx
const handleBulkRefund = async () => {
  const ids = Array.from(selectedTransactions);

  for (const id of ids) {
    await refundTransaction(id, amount, reason);
  }

  clearSelection();
  refreshTransactions();
};
```

## Troubleshooting

### No Data Showing
1. Check `isLoading` state
2. Verify API connection
3. Check filters/search
4. Look at browser console

### Slow Performance
1. Reduce page size
2. Clear unused filters
3. Check network tab
4. Disable auto-refresh

### Filters Not Working
1. Click "Apply Filters"
2. Check filter values
3. Clear and reapply
4. Verify API params

## Best Practices

1. **Always show loading states**
2. **Provide empty state guidance**
3. **Give clear error messages**
4. **Use toast notifications**
5. **Test on mobile devices**
6. **Optimize images/icons**
7. **Lazy load heavy components**
8. **Handle errors gracefully**

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: Focus search
- `Cmd/Ctrl + F`: Open filters
- `Cmd/Ctrl + R`: Refresh
- `Escape`: Close modals
- `Tab`: Navigate through items
- `Enter`: View details

## Mobile Gestures

- **Swipe Left**: Quick actions
- **Swipe Right**: Close actions
- **Tap**: View details
- **Long Press**: Select (planned)
- **Pull Down**: Refresh (planned)

## Support

- **Documentation**: TRANSACTION_SYSTEM_README.md
- **Components**: Check JSDoc comments
- **Types**: TypeScript definitions in files
- **Examples**: See page implementations

---

**Need Help?** Check the full documentation in `TRANSACTION_SYSTEM_README.md`
