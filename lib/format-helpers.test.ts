import test from 'node:test';
import assert from 'node:assert';
import { formatDate, generateSlug, formatDateTime, formatEventTime, isBlockContent } from './format-helpers.ts';

test('formatDate', async (t) => {
  await t.test('formats a standard date string correctly in German locale', () => {
    const result = formatDate('2023-10-27');
    // In German locale 'de-DE', the default for {year: 'numeric', month: 'long', day: 'numeric'}
    // is usually "27. Oktober 2023" or "27. Okt. 2023" depending on environment,
    // but the options specified 'long' for month.
    assert.match(result, /27\.\s+Oktober\s+2023/);
  });

  await t.test('handles leap years correctly', () => {
    const result = formatDate('2024-02-29');
    assert.match(result, /29\.\s+Februar\s+2024/);
  });
});

test('generateSlug', async (t) => {
  await t.test('converts basic string to slug', () => {
    assert.strictEqual(generateSlug('Hello World'), 'hello-world');
  });

  await t.test('handles German umlauts correctly', () => {
    assert.strictEqual(generateSlug('Bücher über Äpfel'), 'buecher-ueber-aepfel');
    assert.strictEqual(generateSlug('Große Füße'), 'grosse-fuesse');
  });

  await t.test('removes special characters', () => {
    assert.strictEqual(generateSlug('Hello! @World?'), 'hello-world');
  });

  await t.test('trims and handles multiple spaces/dashes', () => {
    assert.strictEqual(generateSlug('  Hello   World--Test  '), 'hello-world-test');
  });
});

test('formatDateTime', async (t) => {
  await t.test('formats date and time correctly', () => {
    const result = formatDateTime('2023-10-27T14:30:00');
    // Result should contain date and time
    assert.match(result, /27\.\s+Oktober\s+2023/);
    assert.match(result, /14:30/);
  });
});

test('formatEventTime', async (t) => {
  await t.test('returns HH:MM for regular events', () => {
    assert.strictEqual(formatEventTime('2023-10-27T14:30:00'), '14:30');
    assert.strictEqual(formatEventTime('2023-10-27T09:05:00'), '09:05');
  });

  await t.test('returns null for all-day events', () => {
    assert.strictEqual(formatEventTime('2023-10-27T14:30:00', true), null);
  });

  await t.test('returns null for invalid dates', () => {
    assert.strictEqual(formatEventTime('invalid-date'), null);
  });
});

test('isBlockContent', async (t) => {
  await t.test('returns true for valid block content', () => {
    const validBlock = JSON.stringify([{ type: 'paragraph', id: '123', content: 'hello' }]);
    assert.strictEqual(isBlockContent(validBlock), true);
  });

  await t.test('returns false for non-JSON content', () => {
    assert.strictEqual(isBlockContent('just a string'), false);
  });

  await t.test('returns false for JSON that is not block content', () => {
    assert.strictEqual(isBlockContent('{"key": "value"}'), false);
    assert.strictEqual(isBlockContent('[]'), false);
  });
});
