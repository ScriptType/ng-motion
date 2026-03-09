import { Directive, inject, input } from '@angular/core';
import { nodeGroup } from 'motion-dom';
import { LAYOUT_GROUP, type LayoutGroupContextProps } from './layout-group-context';

@Directive({
  selector: '[ngmLayoutGroup]',
  providers: [
    {
      provide: LAYOUT_GROUP,
      useFactory: (): LayoutGroupContextProps => {
        const dir = inject(NgmLayoutGroupDirective);
        return dir.context;
      },
    },
  ],
})
export class NgmLayoutGroupDirective {
  readonly ngmLayoutGroup = input<string>('');
  readonly inherit = input<boolean | 'id'>(true);

  private readonly parentGroup = inject(LAYOUT_GROUP, { optional: true, skipSelf: true });

  /** @internal Layout group context provided to children. */
  readonly context: LayoutGroupContextProps;

  constructor() {
    // Note: signal inputs aren't bound yet in the constructor, so we read defaults.
    // Layout group IDs are typically static attributes, so this is acceptable.
    const upstreamId = this.parentGroup?.id;
    const id: string | undefined = upstreamId != null && upstreamId !== ''
      ? upstreamId
      : undefined;

    const group = this.parentGroup?.group ?? nodeGroup();

    this.context = { id, group };
  }
}
