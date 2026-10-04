import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeHtml, page } from '../../../src/server/views/html.js';

describe('HTML views', () => {
  it('escapes dynamic text and attributes', () => {
    assert.equal(
      escapeHtml('<script>"&\'</script>'),
      '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;',
    );
  });

  it('renders a semantic document layout without a SPA shell', () => {
    const output = page('Example', '<section><h2>Example</h2></section>');
    assert.match(output, /<!doctype html>/i);
    assert.match(output, /<main class="page">/);
    assert.doesNotMatch(output, /id="root"|main\.js|react/i);
  });
});
