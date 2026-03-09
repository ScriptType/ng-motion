import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

const INIT_KEY = Symbol.for('ng-motion-testbed-init');
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- globalThis requires cast for symbol-keyed access
const g = globalThis as Record<symbol, boolean>;

if (!g[INIT_KEY]) {
  g[INIT_KEY] = true;
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}
