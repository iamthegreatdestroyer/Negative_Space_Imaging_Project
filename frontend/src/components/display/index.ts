/**
 * Display Components Barrel Export
 *
 * Provides clean imports for all display components:
 * import { Table, Card, Gallery, Badge } from '@/components/display'
 * import { StatusBadge, CountBadge } from '@/components/display'
 * import type { GalleryImage, TableColumn } from '@/components/display'
 */

export { default as Table } from './Table';
export { default as Card } from './Card';
export { default as Gallery } from './Gallery';
export { Badge, StatusBadge, CountBadge } from './Badge';

// Export types
export type { GalleryImage } from './Gallery';
export type { TableColumn } from './Table';
export {};
