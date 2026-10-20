import type { FileBody } from '@opencollection/types/requests/http';
import { toOpenCollectionBody, toBrunoBody } from './body';

describe('file body description', () => {
  it('toOpenCollectionBody: preserves description, omits when absent or whitespace-only', () => {
    const out = toOpenCollectionBody({
      mode: 'file',
      file: [
        { uid: 'f1', filePath: '/tmp/readme.pdf', contentType: 'application/pdf', selected: true, description: 'Upload doc' },
        { uid: 'f2', filePath: '/tmp/other.bin', contentType: 'application/octet-stream', selected: false },
        { uid: 'f3', filePath: '/tmp/plain.bin', contentType: 'application/octet-stream', selected: false, description: '   ' }
      ]
    } as any) as FileBody;

    expect(out?.type).toBe('file');
    expect(out?.data).toHaveLength(3);
    expect(out?.data[0]).toMatchObject({ filePath: '/tmp/readme.pdf', description: 'Upload doc' });
    expect(out?.data[1]).not.toHaveProperty('description');
    expect(out?.data[2]).not.toHaveProperty('description');
  });

  it('toBrunoBody: parses description from file body entries', () => {
    const out = toBrunoBody({
      type: 'file',
      data: [
        { filePath: '/tmp/readme.pdf', contentType: 'application/pdf', selected: true, description: 'Upload doc' },
        { filePath: '/tmp/other.bin', contentType: 'application/octet-stream', selected: false }
      ]
    } as any);

    expect(out?.mode).toBe('file');
    expect(out?.file).toHaveLength(2);

    // already fails on the length check above if no bodies are recieved, the if below is just
    // to satisfy typescript and then validate the content of the files
    if (out?.file) {
      expect(out?.file[0]).toMatchObject({ filePath: '/tmp/readme.pdf', description: 'Upload doc' });
      expect(out?.file[1].description).toBeFalsy();
    }
  });

  it('round-trips file body descriptions through OC conversion', () => {
    const brunoBody = {
      mode: 'file',
      file: [
        { uid: 'f1', filePath: '/tmp/readme.pdf', contentType: 'application/pdf', selected: true, description: 'Upload doc' },
        { uid: 'f2', filePath: '/tmp/other.bin', contentType: 'application/octet-stream', selected: false }
      ]
    } as any;

    const oc = toOpenCollectionBody(brunoBody);
    const back = toBrunoBody(oc);

    expect(back?.file).toHaveLength(2);

    // already fails on the length check above if no bodies are recieved, the if below is just
    // to satisfy typescript and then validate the content of the files
    if (back?.file) {
      expect(back?.file[0]).toMatchObject({ filePath: '/tmp/readme.pdf', description: 'Upload doc' });
      expect(back?.file[1].description).toBeFalsy();
    }
  });
});

describe('body variants', () => {
  it('toOpenCollectionBody: serializes variants as HttpRequestBodyVariant[]', () => {
    const brunoBody = {
      mode: 'json',
      json: '{"default": 1}',
      variants: [
        {
          uid: 'var-1',
          type: 'json',
          name: 'Variant 1',
          content: '{"v": 1}',
          selected: true
        }
      ],
      defaultContent: '{"default": 1}'
    } as any;

    const oc = toOpenCollectionBody(brunoBody);
    expect(Array.isArray(oc)).toBe(true);
    expect(oc).toHaveLength(2);
    expect((oc as any)[0]).toEqual({
      title: 'Default',
      selected: false,
      body: {
        type: 'json',
        data: '{"default": 1}'
      }
    });
    expect((oc as any)[1]).toEqual({
      title: 'Variant 1',
      selected: true,
      body: {
        type: 'json',
        data: '{"v": 1}'
      }
    });
  });

  it('toBrunoBody: parses HttpRequestBodyVariant[] into Bruno variants', () => {
    const ocBody = [
      {
        title: 'Default',
        selected: false,
        body: {
          type: 'json',
          data: '{"default": 1}'
        }
      },
      {
        title: 'Variant 1',
        selected: true,
        body: {
          type: 'json',
          data: '{"v": 1}'
        }
      }
    ];

    const bruno = toBrunoBody(ocBody as any);
    expect(bruno?.mode).toBe('json');
    expect(bruno?.json).toBe('{"v": 1}');
    expect(bruno?.defaultContent).toBe('{"default": 1}');
    expect(bruno?.variants).toHaveLength(1);
    expect(bruno?.variants?.[0]).toMatchObject({
      name: 'Variant 1',
      type: 'json',
      content: '{"v": 1}',
      selected: true
    });
  });

  it('round-trips body with variants through OC conversion', () => {
    const brunoBody = {
      mode: 'json',
      json: '{"v": 1}',
      defaultContent: '{"default": 1}',
      variants: [
        {
          uid: 'var-1',
          type: 'json',
          name: 'Variant 1',
          content: '{"v": 1}',
          selected: true
        },
        {
          uid: 'var-2',
          type: 'json',
          name: 'Variant 2',
          content: '{"v": 2}',
          selected: false
        }
      ]
    } as any;

    const oc = toOpenCollectionBody(brunoBody);
    const back = toBrunoBody(oc);

    expect(back?.mode).toBe('json');
    expect(back?.json).toBe('{"v": 1}');
    expect(back?.defaultContent).toBe('{"default": 1}');
    expect(back?.variants).toHaveLength(2);
    expect(back?.variants?.[0]).toMatchObject({
      name: 'Variant 1',
      type: 'json',
      content: '{"v": 1}',
      selected: true
    });
    expect(back?.variants?.[1]).toMatchObject({
      name: 'Variant 2',
      type: 'json',
      content: '{"v": 2}',
      selected: false
    });
  });
});
