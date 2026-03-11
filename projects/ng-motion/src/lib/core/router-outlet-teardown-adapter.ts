import { afterNextRender, VERSION, type ComponentRef, type EnvironmentInjector } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const ROUTER_OUTLET_PATCH_MARK = Symbol.for('ngmMotion.routerOutletTeardownAdapterPatched');
const ROUTER_OUTLET_WARN_MARK = Symbol.for('ngmMotion.routerOutletTeardownAdapterWarned');
const SUPPORTED_ANGULAR_MAJOR = '21';
const SUPPORTED_ANGULAR_MINOR = '2';

type RouterOutletPrototypeWithPatchState = typeof RouterOutlet.prototype & {
  [ROUTER_OUTLET_PATCH_MARK]?: boolean;
  [ROUTER_OUTLET_WARN_MARK]?: boolean;
};

type RouterOutletWithComponentRef = RouterOutlet & {
  activatedComponentRef?: ComponentRef<unknown> | null;
};

const deactivatingRouteHosts = new WeakSet<HTMLElement>();

export function installRouterOutletTeardownAdapter(): void {
  const prototype = RouterOutlet.prototype as RouterOutletPrototypeWithPatchState;
  if (prototype[ROUTER_OUTLET_PATCH_MARK] === true) return;

  prototype[ROUTER_OUTLET_PATCH_MARK] = true;

  if (!isSupportedAngularVersion()) {
    warnOnce(
      prototype,
      `[ngmMotion] Router teardown optimization is disabled for Angular ${VERSION.full}. ` +
        `Expected ${SUPPORTED_ANGULAR_MAJOR}.${SUPPORTED_ANGULAR_MINOR}.x.`,
    );
    return;
  }

  if (
    typeof prototype.deactivate !== 'function' ||
    typeof prototype.detach !== 'function'
  ) {
    warnOnce(
      prototype,
      '[ngmMotion] Router teardown optimization is disabled because RouterOutlet ' +
        'does not expose the expected deactivate/detach methods.',
    );
    return;
  }

  const originalDeactivate = prototype.deactivate;
  prototype.deactivate = function patchedDeactivate(this: RouterOutlet): void {
    runWithMarkedRouteHost(this, prototype, 'microtask', () => {
      originalDeactivate.call(this);
    });
  };

  const originalDetach = prototype.detach;
  prototype.detach = function patchedDetach(this: RouterOutlet) {
    return runWithMarkedRouteHost(this, prototype, 'after-next-render', () =>
      originalDetach.call(this),
    );
  };

  const originalAttach = prototype.attach;
  prototype.attach = function patchedAttach(this: RouterOutlet, ref, activatedRoute): void {
    const hostElement = getComponentRefHostElement(ref);
    if (hostElement !== null) {
      deactivatingRouteHosts.delete(hostElement);
    }
    originalAttach.call(this, ref, activatedRoute);
  };
}

export function isDeactivatingRouteHost(hostElement: HTMLElement): boolean {
  return deactivatingRouteHosts.has(hostElement);
}

function runWithMarkedRouteHost<T>(
  outlet: RouterOutlet,
  prototype: RouterOutletPrototypeWithPatchState,
  cleanupMode: 'microtask' | 'after-next-render',
  callback: () => T,
): T {
  const componentRef = (outlet as RouterOutletWithComponentRef).activatedComponentRef ?? null;
  const hostElement = getOutletHostElement(componentRef, prototype);

  if (hostElement !== null) {
    deactivatingRouteHosts.add(hostElement);
  }

  try {
    return callback();
  } finally {
    if (hostElement !== null) {
      scheduleHostCleanup(hostElement, componentRef, cleanupMode);
    }
  }
}

function getOutletHostElement(
  componentRef: ComponentRef<unknown> | null,
  prototype: RouterOutletPrototypeWithPatchState,
): HTMLElement | null {
  const host = componentRef?.location?.nativeElement;

  if (host instanceof HTMLElement) {
    return host;
  }

  if (componentRef !== null && componentRef !== undefined) {
    warnOnce(
      prototype,
      '[ngmMotion] Router teardown optimization is disabled for one outlet because ' +
        'RouterOutlet.activatedComponentRef.location.nativeElement is no longer an HTMLElement.',
    );
  }

  return null;
}

function getComponentRefHostElement(componentRef: ComponentRef<unknown>): HTMLElement | null {
  const host = componentRef.location.nativeElement;
  return host instanceof HTMLElement ? host : null;
}

function scheduleHostCleanup(
  hostElement: HTMLElement,
  componentRef: ComponentRef<unknown> | null,
  cleanupMode: 'microtask' | 'after-next-render',
): void {
  if (cleanupMode === 'microtask') {
    queueMicrotask(() => {
      deactivatingRouteHosts.delete(hostElement);
    });
    return;
  }

  const injector = componentRef?.injector;
  if (injector !== undefined) {
    afterNextRender(
      () => {
        queueMicrotask(() => {
          deactivatingRouteHosts.delete(hostElement);
        });
      },
      { injector: injector as EnvironmentInjector },
    );
    return;
  }

  setTimeout(() => {
    deactivatingRouteHosts.delete(hostElement);
  });
}

function isSupportedAngularVersion(): boolean {
  return (
    VERSION.major === SUPPORTED_ANGULAR_MAJOR &&
    VERSION.minor === SUPPORTED_ANGULAR_MINOR
  );
}

function warnOnce(
  prototype: RouterOutletPrototypeWithPatchState,
  message: string,
): void {
  if (prototype[ROUTER_OUTLET_WARN_MARK] === true) return;
  prototype[ROUTER_OUTLET_WARN_MARK] = true;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    console.warn(message);
  }
}
