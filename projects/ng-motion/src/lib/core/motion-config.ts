/**
 * Global motion configuration via Angular DI.
 */

import { InjectionToken, type Provider } from '@angular/core';
import type { MotionConfig } from './types';

/** Injection token for global motion configuration. */
export const MOTION_CONFIG = new InjectionToken<MotionConfig>('MOTION_CONFIG');

/** Provides global motion configuration via Angular DI. */
export function provideMotionConfig(config: MotionConfig): Provider {
  return { provide: MOTION_CONFIG, useValue: config };
}
