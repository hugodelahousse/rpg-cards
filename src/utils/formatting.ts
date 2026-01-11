/**
 * Format a slot name for display as a label.
 * Replaces underscores with spaces and adds space before numbers.
 */
export function formatSlotLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/([a-z])([0-9])/g, '$1 $2')
}

/**
 * Format a timestamp as a localized date string.
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
