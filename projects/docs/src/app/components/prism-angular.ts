/**
 * Custom Prism grammar for Angular template syntax.
 *
 * 1. Extends markup (HTML) with Angular control-flow keywords and interpolation.
 * 2. Hooks into TypeScript tokenization to re-highlight HTML/Angular content
 *    that appears inside template-string literals (the `template: \`...\`` pattern).
 */
import Prism from 'prismjs';

// ── Angular tokens injected into the markup grammar ──────────────────────────
// Since 'html' is an alias for 'markup', this enhances both.
Prism.languages.insertBefore('markup', 'tag', {
  'ng-control-flow': {
    pattern:
      /@(?:if|else\s+if|else|for|empty|switch|case|default|let|defer|placeholder|loading|error)\b/,
    alias: 'keyword',
  },
  'ng-interpolation': {
    pattern: /\{\{[\s\S]*?\}\}/,
  },
});

// ── TypeScript template-string re-highlighting ───────────────────────────────
// After TypeScript tokenization, walk the token tree and find template-string
// tokens. Their inner 'string' catch-all tokens contain the raw template text.
// If that text looks like HTML/Angular, re-tokenize it with the enhanced markup
// grammar and wrap it in a 'template-content' token to reset the base color.

Prism.hooks.add('after-tokenize', (env) => {
  if (env['language'] !== 'typescript') return;
  walkTokens(env['tokens'] as (string | Prism.Token)[]);
});

function walkTokens(tokens: (string | Prism.Token)[]): void {
  for (const token of tokens) {
    if (typeof token === 'string') continue;

    if (token.type === 'template-string' && Array.isArray(token.content)) {
      retokenizeTemplateStrings(token.content);
    } else if (Array.isArray(token.content)) {
      walkTokens(token.content);
    }
  }
}

function retokenizeTemplateStrings(
  content: (string | Prism.Token)[],
): void {
  for (let i = 0; i < content.length; i++) {
    const token = content[i];
    if (
      typeof token !== 'string' &&
      token.type === 'string' &&
      typeof token.content === 'string'
    ) {
      // Only re-tokenize when it looks like HTML/Angular content
      if (/<[a-z/!]|@(?:if|for|let|else|switch|defer)|{{/i.test(token.content)) {
        const reTokenized = Prism.tokenize(
          token.content,
          Prism.languages['markup'],
        );
        // Wrap so CSS can reset the base color from string-gold to neutral
        content[i] = new Prism.Token(
          'template-content',
          reTokenized,
        );
      }
    }
  }
}
