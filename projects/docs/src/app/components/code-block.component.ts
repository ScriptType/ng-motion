import { Component, computed, input } from '@angular/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import './prism-angular';

@Component({
  selector: 'app-code-block',
  host: { class: 'block' },
  template: `
    <div class="rounded-xl border border-border overflow-hidden">
      @if (filename()) {
        @if (dots()) {
          <div
            class="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-elevated/50"
          >
            <div class="w-3 h-3 rounded-full bg-accent-pink/60"></div>
            <div class="w-3 h-3 rounded-full bg-accent-gold/60"></div>
            <div class="w-3 h-3 rounded-full bg-accent/60"></div>
            <span class="ml-2 text-xs text-muted font-mono">{{
              filename()
            }}</span>
          </div>
        } @else {
          <div
            class="flex items-center px-4 py-2.5 border-b border-border bg-elevated/50"
          >
            <span class="text-xs text-muted font-mono">{{ filename() }}</span>
          </div>
        }
      }
      <pre
        class="p-5 text-sm font-mono bg-code-bg overflow-x-auto leading-relaxed"
      ><code [innerHTML]="highlighted()" class="whitespace-pre text-secondary"></code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input('typescript');
  readonly filename = input('');
  readonly dots = input(false);

  readonly highlighted = computed(() => {
    const lang = this.lang();
    const grammar = Prism.languages[lang];
    if (!grammar) {
      return this.escapeHtml(this.code());
    }
    return Prism.highlight(this.code(), grammar, lang);
  });

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
