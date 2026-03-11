/** Type guard for non-null, non-array objects (TargetAndTransition, not VariantLabels). */
export function isObjectTarget(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
