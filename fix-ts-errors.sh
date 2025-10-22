#!/bin/bash

# Fix dashboard/page.tsx - remove unused imports
sed -i '' 's/import { Activity, CreditCard, TrendingUp, Users, ArrowUpRight, Wallet, DollarSign, ShoppingCart, AlertCircle, CheckCircle, Package, Zap, Search, Filter, ArrowDownRight, RefreshCw, Download } from '\''lucide-react'\''/import { Activity, CreditCard, TrendingUp, Users, ArrowUpRight, DollarSign, ShoppingCart, CheckCircle, Package, Search, Filter, RefreshCw, Download } from '\''lucide-react'\''/' app/\(dashboard\)/dashboard/page.tsx

# Fix dashboard/page.tsx - remove unused Line and RechartsLine imports
sed -i '' 's/import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line as RechartsLine } from '\''recharts'\''/import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '\''recharts'\''/' app/\(dashboard\)/dashboard/page.tsx
sed -i '' 's/import { Line, LineChart, Bar, BarChart } from '\''recharts'\''/import { LineChart, Bar, BarChart } from '\''recharts'\''/' app/\(dashboard\)/dashboard/page.tsx

echo "Fixed dashboard/page.tsx"
