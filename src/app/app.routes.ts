import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { PageComponent } from './pages/page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'dashboard',
    component: PageComponent,
    data: { title: 'Dashboard', subtitle: 'Your app at a glance', section: 'Overview' },
  },
  // Products
  {
    path: 'products',
    component: PageComponent,
    data: { title: 'Products', subtitle: 'Manage your product catalog', section: 'Products' },
  },
  {
    path: 'products/categories',
    component: PageComponent,
    data: { title: 'Categories', subtitle: 'Organize products by category', section: 'Products' },
  },
  {
    path: 'products/inventory',
    component: PageComponent,
    data: { title: 'Inventory', subtitle: 'Stock levels and warehouse data', section: 'Products' },
  },
  {
    path: 'products/pricing',
    component: PageComponent,
    data: { title: 'Price Lists', subtitle: 'Configure pricing rules', section: 'Products' },
  },
  // Analytics
  {
    path: 'analytics',
    component: PageComponent,
    data: { title: 'Analytics', subtitle: 'Track performance metrics', section: 'Analytics' },
  },
  {
    path: 'analytics/sales',
    component: PageComponent,
    data: { title: 'Sales Report', subtitle: 'Live sales performance', section: 'Analytics' },
  },
  {
    path: 'analytics/users',
    component: PageComponent,
    data: { title: 'User Insights', subtitle: 'Understand your audience', section: 'Analytics' },
  },
  {
    path: 'analytics/conversions',
    component: PageComponent,
    data: { title: 'Conversions', subtitle: 'Conversion funnel analysis', section: 'Analytics' },
  },
  {
    path: 'analytics/revenue',
    component: PageComponent,
    data: { title: 'Revenue', subtitle: 'Revenue streams breakdown', section: 'Analytics' },
  },
  // Orders
  {
    path: 'orders',
    component: PageComponent,
    data: { title: 'Orders', subtitle: 'All customer orders', section: 'Orders' },
  },
  {
    path: 'orders/pending',
    component: PageComponent,
    data: { title: 'Pending Orders', subtitle: 'Orders awaiting processing', section: 'Orders' },
  },
  {
    path: 'orders/shipped',
    component: PageComponent,
    data: { title: 'Shipped Orders', subtitle: 'In-transit deliveries', section: 'Orders' },
  },
  {
    path: 'orders/returns',
    component: PageComponent,
    data: { title: 'Returns', subtitle: 'Return requests & refunds', section: 'Orders' },
  },
  // Settings
  {
    path: 'settings',
    component: PageComponent,
    data: { title: 'Settings', subtitle: 'Configure your workspace', section: 'Settings' },
  },
  {
    path: 'settings/team',
    component: PageComponent,
    data: { title: 'Team & Users', subtitle: 'Manage team members and roles', section: 'Settings' },
  },
  {
    path: 'settings/billing',
    component: PageComponent,
    data: { title: 'Billing', subtitle: 'Subscription and payment details', section: 'Settings' },
  },
  {
    path: 'settings/integrations',
    component: PageComponent,
    data: { title: 'Integrations', subtitle: 'Connect third-party services', section: 'Settings' },
  },
  {
    path: 'settings/security',
    component: PageComponent,
    data: { title: 'Security', subtitle: 'Authentication & access control', section: 'Settings' },
  },
  // Financial
  {
    path: 'financial/credit-cards',
    loadComponent: () => import('./financial/credit-card-tracker/credit-card-tracker.component').then(m => m.CreditCardTrackerComponent),
    data: { title: 'Credit Cards', subtitle: 'Manage bills and payments securely', section: 'Financial' },
  },
  {
    path: 'financial/simple-interest',
    loadComponent: () => import('./financial/calculators/simple-interest.component').then(m => m.SimpleInterestComponent),
    data: { title: 'Simple Interest', subtitle: 'Financial Calculators', section: 'Financial' },
  },
  {
    path: 'financial/compound-interest',
    loadComponent: () => import('./financial/calculators/compound-interest.component').then(m => m.CompoundInterestComponent),
    data: { title: 'Compound Interest', subtitle: 'Financial Calculators', section: 'Financial' },
  },
  {
    path: 'financial/sip',
    loadComponent: () => import('./financial/calculators/sip-calculator.component').then(m => m.SipCalculatorComponent),
    data: { title: 'SIP Calculator', subtitle: 'Systematic Investment Plan', section: 'Financial' },
  },
  {
    path: 'financial/swp',
    loadComponent: () => import('./financial/calculators/swp-calculator.component').then(m => m.SwpCalculatorComponent),
    data: { title: 'SWP Calculator', subtitle: 'Systematic Withdrawal Plan', section: 'Financial' },
  },
  {
    path: 'financial/fd-tdr',
    loadComponent: () => import('./financial/calculators/fd-tdr.component').then(m => m.FdTdrComponent),
    data: { title: 'FD (TDR) Calculator', subtitle: 'Term Deposit Receipt Payout', section: 'Financial' },
  },
  {
    path: 'financial/fd-stdr',
    loadComponent: () => import('./financial/calculators/fd-stdr.component').then(m => m.FdStdrComponent),
    data: { title: 'FD (STDR) Calculator', subtitle: 'Special Term Deposit Receipt', section: 'Financial' },
  },
  {
    path: 'financial/rd',
    loadComponent: () => import('./financial/calculators/rd-calculator.component').then(m => m.RdCalculatorComponent),
    data: { title: 'RD Calculator', subtitle: 'Recurring Deposit', section: 'Financial' },
  },
  { path: '**', redirectTo: '' },
];
