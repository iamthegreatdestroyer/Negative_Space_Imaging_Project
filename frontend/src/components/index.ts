/**
 * Components Barrel Export
 *
 * Central export point for all application components.
 *
 * Usage Examples:
 * ───────────────────────────────────────────────
 *
 * // Layout Components
 * import { MainLayout, NavigationBar, Sidebar, Footer, PrivateRoute } from '@/components/layout'
 *
 * // Form Components
 * import { TextField, Select, Checkbox, Radio, DatePicker } from '@/components/form'
 * import { CheckboxGroup, RadioGroup, DateRangePicker } from '@/components/form'
 *
 * // Display Components
 * import { Table, Card, Gallery, Badge } from '@/components/display'
 * import { StatusBadge, CountBadge } from '@/components/display'
 *
 * // Type Imports
 * import type { GalleryImage, TableColumn } from '@/components/display'
 */

// Layout Components - Re-export from layout directory
export { default as MainLayout } from './layout/MainLayout';
export { default as NavigationBar } from './layout/NavigationBar';
export { default as Sidebar } from './layout/Sidebar';
export { default as Footer } from './layout/Footer';
export { default as PrivateRoute } from './layout/PrivateRoute';

// Form Components - Re-export from form directory
export { default as TextField } from './form/TextField';
export { default as Select } from './form/Select';
export { Checkbox, CheckboxGroup } from './form/Checkbox';
export { Radio, RadioGroup } from './form/Radio';
export { DatePicker, DateRangePicker } from './form/DatePicker';

// Display Components - Re-export from display directory
export { default as Table } from './display/Table';
export { default as Card } from './display/Card';
export { default as Gallery } from './display/Gallery';
export { Badge, StatusBadge, CountBadge } from './display/Badge';

// Type Exports
export type { GalleryImage } from './display/Gallery';
export type { TableColumn } from './display/Table';
export {};
