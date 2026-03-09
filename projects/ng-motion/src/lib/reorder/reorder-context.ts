import { InjectionToken } from '@angular/core';
import type { ReorderContextProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic context consumed by items with varying value types
export const REORDER_CONTEXT = new InjectionToken<ReorderContextProps<any>>('REORDER_CONTEXT');
