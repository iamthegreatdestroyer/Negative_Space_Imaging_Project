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
export {
  MainLayout,
  NavigationBar,
  Sidebar,
  Footer,
  PrivateRoute,
} from './layout';

// Form Components - Re-export from form directory
export {
  TextField,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  DatePicker,
  DateRangePicker,
} from './form';

// Display Components - Re-export from display directory
export {
  Table,
  Card,
  Gallery,
  Badge,
  StatusBadge,
  CountBadge,
} from './display';

// Type Exports
export type {
  GalleryImage,
  TableColumn,
} from './display';
