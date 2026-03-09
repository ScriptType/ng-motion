import { InjectionToken } from '@angular/core';
import type { NodeGroup } from 'motion-dom';

export interface LayoutGroupContextProps {
  id?: string;
  group?: NodeGroup;
}

export const LAYOUT_GROUP = new InjectionToken<LayoutGroupContextProps>('LAYOUT_GROUP');
