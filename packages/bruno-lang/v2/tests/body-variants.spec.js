const bruToJson = require('../src/bruToJson');
const jsonToBru = require('../src/jsonToBru');
const { escapeBodyVariantContent, unescapeBodyVariantContent } = require('../src/utils');

const makeRequest = (variants, json = '{\n  "id": 1\n}') => ({
  meta: { name: 'variants', type: 'http', seq: '1' },
  http: { method: 'post', url: 'https://example.com', body: 'json', auth: 'none' },
  body: { json, variants }
});

const roundTripVariants = (variants) => bruToJson(jsonToBru(makeRequest(variants))).body.variants;

describe('body variants', () => {
  it('parses a file written before content escaping existed', () => {
    const input = `
meta {
  name: legacy
  type: http
  seq: 1
}

post {
  url: https://example.com
  body: json
  auth: none
}

body:json {
  {
    "id": 1
  }
}

body:json:variant {
  name: Second
  selected: true
  content: '''
    {
      "id": 2
    }
  '''
}

body:text:variant {
  uid: abc123
  name: Plain
  selected: false
  content: '''
    it's \\' fine
  '''
}
`;

    const output = bruToJson(input);

    expect(output.body.json).toBe('{\n  "id": 1\n}');
    expect(output.body.variants).toEqual([
      { uid: undefined, type: 'json', name: 'Second', content: '{\n  "id": 2\n}', selected: true },
      { uid: 'abc123', type: 'text', name: 'Plain', content: 'it\'s \\\' fine', selected: false }
    ]);
  });

  it('round-trips several variants of different types in order', () => {
    const variants = [
      { uid: 'v1', type: 'json', name: 'Happy path', content: '{\n  "ok": true\n}', selected: false },
      { uid: 'v2', type: 'xml', name: 'XML case', content: '<a>\n  <b/>\n</a>', selected: true },
      { uid: 'v3', type: 'text', name: 'Text', content: 'single line', selected: false },
      { uid: 'v4', type: 'sparql', name: 'Query', content: 'SELECT * WHERE { ?s ?p ?o }', selected: false }
    ];

    expect(roundTripVariants(variants)).toEqual(variants);
  });

  it('keeps the default body separate from the variants', () => {
    const output = bruToJson(jsonToBru(makeRequest([
      { uid: 'v1', type: 'json', name: 'Other', content: '{\n  "id": 2\n}', selected: true }
    ])));

    expect(output.body.json).toBe('{\n  "id": 1\n}');
  });

  it('writes content without triple quotes unescaped, so existing files stay byte-identical', () => {
    const bru = jsonToBru(makeRequest([
      { uid: 'v1', type: 'text', name: 'Quotes', content: 'it\'s a \\\' quote \'\' pair', selected: false }
    ]));

    expect(bru).not.toContain('contentEscaped');
    expect(bru).toContain('    it\'s a \\\' quote \'\' pair\n');
  });

  it('round-trips content containing triple quotes', () => {
    const variants = [
      { uid: 'v1', type: 'text', name: 'Triple', content: 'before \'\'\' after', selected: true }
    ];

    const bru = jsonToBru(makeRequest(variants));

    expect(bru).toContain('contentEscaped: true');
    expect(bruToJson(bru).body.variants).toEqual(variants);
  });

  it('round-trips any run of quotes and backslashes through the written file', () => {
    const pieces = ['\'', '\'\'', '\'\'\'', '\'\'\'\'', '\'\'\'\'\'', '\\', '\\\\', '\\\'', '\'\\\'\'', 'x', '\n'];

    for (let a = 0; a < pieces.length; a++) {
      for (let b = 0; b < pieces.length; b++) {
        const content = `start ${pieces[a]}${pieces[b]}\'\'\' end`;
        const variants = [{ uid: 'v1', type: 'text', name: 'Fuzz', content, selected: false }];

        expect(roundTripVariants(variants)).toEqual(variants);
      }
    }
  });

  it('never writes two adjacent quotes inside escaped content', () => {
    const escaped = escapeBodyVariantContent('\'\'\'\'\' \\\'\'\'');

    expect(escaped).not.toMatch(/''/);
    expect(unescapeBodyVariantContent(escaped)).toBe('\'\'\'\'\' \\\'\'\'');
  });
});
