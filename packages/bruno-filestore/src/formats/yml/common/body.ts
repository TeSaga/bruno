import type { HttpRequestBody as BrunoHttpRequestBody } from '@usebruno/schema-types/requests/http';
import type {
  HttpRequestBody,
  HttpRequestBodyVariant,
  RawBody,
  FormUrlEncodedBody,
  FormUrlEncodedEntry,
  MultipartFormBody,
  MultipartFormEntry,
  FileBody,
  FileBodyVariant
} from '@opencollection/types/requests/http';
import type { FileEntry as BrunoFileEntry } from '@usebruno/schema-types/common/file';

import type { KeyValue as BrunoKeyValue } from '@usebruno/schema-types/common/key-value';
import { uuid, ensureString } from '../../../utils';

export interface BrunoBodyVariant {
  uid?: string;
  type: 'json' | 'text' | 'xml' | 'sparql' | 'formUrlEncoded';
  name: string;
  content: string;
  selected: boolean;
}

export type BrunoHttpRequestBodyWithVariants = BrunoHttpRequestBody & {
  variants?: BrunoBodyVariant[] | null;
  defaultContent?: string | null;
};

const convertSingleBodyToOpenCollection = (
  body: BrunoHttpRequestBodyWithVariants,
  contentOverride?: string
): HttpRequestBody | undefined => {
  switch (body.mode) {
    case 'none':
      return undefined;

    case 'json': {
      const rawBody: RawBody = {
        type: 'json',
        data: contentOverride !== undefined ? contentOverride : (body.json || '')
      };
      return rawBody;
    }

    case 'text': {
      const textBody: RawBody = {
        type: 'text',
        data: contentOverride !== undefined ? contentOverride : (body.text || '')
      };
      return textBody;
    }

    case 'xml': {
      const xmlBody: RawBody = {
        type: 'xml',
        data: contentOverride !== undefined ? contentOverride : (body.xml || '')
      };
      return xmlBody;
    }

    case 'sparql': {
      const sparqlBody: RawBody = {
        type: 'sparql',
        data: contentOverride !== undefined ? contentOverride : (body.sparql || '')
      };
      return sparqlBody;
    }

    case 'formUrlEncoded': {
      const formEntries: FormUrlEncodedEntry[] = body.formUrlEncoded?.map((entry: BrunoKeyValue): FormUrlEncodedEntry => {
        const formEntry: FormUrlEncodedEntry = {
          name: entry.name || '',
          value: entry.value || ''
        };

        if (entry?.description?.trim().length) {
          formEntry.description = entry.description;
        }

        if (entry.enabled === false) {
          formEntry.disabled = true;
        }

        return formEntry;
      }) || [];

      const formBody: FormUrlEncodedBody = {
        type: 'form-urlencoded',
        ...(formEntries.length > 0 && { data: formEntries })
      } as FormUrlEncodedBody;
      return formBody;
    }

    case 'multipartForm': {
      const multipartEntries: MultipartFormEntry[] = body.multipartForm?.map((entry): MultipartFormEntry => {
        const multipartEntry: MultipartFormEntry = {
          name: entry.name || '',
          type: entry.type,
          value: entry.value || (entry.type === 'file' ? [] : '')
        };

        if (entry?.contentType?.trim().length) {
          multipartEntry.contentType = entry.contentType;
        }

        if (entry?.description?.trim().length) {
          multipartEntry.description = entry.description;
        }

        if (entry.enabled === false) {
          multipartEntry.disabled = true;
        }

        return multipartEntry;
      }) || [];

      const multipartBody: MultipartFormBody = {
        type: 'multipart-form',
        ...(multipartEntries.length > 0 && { data: multipartEntries })
      } as MultipartFormBody;
      return multipartBody;
    }

    case 'file': {
      const fileEntries: FileBodyVariant[] = body.file?.map((file): FileBodyVariant => {
        const fileEntry: FileBodyVariant = {
          filePath: file.filePath || '',
          contentType: file.contentType || '',
          selected: file.selected ?? false
        };

        if (file?.description?.trim().length) {
          fileEntry.description = file.description;
        }

        return fileEntry;
      }) || [];

      const fileBody: FileBody = {
        type: 'file',
        ...(fileEntries.length > 0 && { data: fileEntries })
      } as FileBody;
      return fileBody;
    }

    case 'graphql':
      // GraphQL body is handled separately in GraphQL request stringify
      return undefined;

    default:
      return undefined;
  }
};

export const toOpenCollectionBody = (
  body: BrunoHttpRequestBodyWithVariants | null | undefined
): HttpRequestBody | HttpRequestBodyVariant[] | undefined => {
  if (!body) {
    return undefined;
  }

  // If there are variants, serialize as HttpRequestBodyVariant[]
  if (body.variants && body.variants.length > 0) {
    const hasActiveVariant = body.variants.some((v) => v.selected);
    const defaultContent = body.defaultContent !== undefined && body.defaultContent !== null
      ? body.defaultContent
      : undefined;

    const defaultHttpBody = convertSingleBodyToOpenCollection(body, defaultContent) || {
      type: (['json', 'text', 'xml', 'sparql'].includes(body.variants[0]?.type)
        ? body.variants[0].type
        : 'json') as RawBody['type'],
      data: ''
    };

    const defaultVariant: HttpRequestBodyVariant = {
      title: 'Default',
      selected: !hasActiveVariant,
      body: defaultHttpBody
    };

    const variantBodies: HttpRequestBodyVariant[] = body.variants.map((v) => {
      const variantType = v.type === 'formUrlEncoded' ? 'form-urlencoded' : v.type;
      let variantBody: HttpRequestBody;
      if (variantType === 'form-urlencoded') {
        variantBody = {
          type: 'form-urlencoded',
          data: []
        };
      } else {
        variantBody = {
          type: (['json', 'text', 'xml', 'sparql'].includes(variantType) ? variantType : 'json') as RawBody['type'],
          data: v.content || ''
        };
      }

      const variantItem: HttpRequestBodyVariant = {
        title: v.name,
        selected: v.selected ?? false,
        body: variantBody
      };

      return variantItem;
    });

    return [defaultVariant, ...variantBodies];
  }

  return convertSingleBodyToOpenCollection(body);
};

const parseSingleBrunoBody = (body: HttpRequestBody | null | undefined): BrunoHttpRequestBodyWithVariants => {
  if (!body) {
    return {
      mode: 'none',
      json: null,
      text: null,
      xml: null,
      sparql: null,
      formUrlEncoded: [],
      multipartForm: [],
      graphql: null,
      file: [],
      variants: []
    };
  }

  const brunoBody: BrunoHttpRequestBodyWithVariants = {
    mode: 'none',
    json: null,
    text: null,
    xml: null,
    sparql: null,
    formUrlEncoded: [],
    multipartForm: [],
    graphql: null,
    file: [],
    variants: []
  };

  switch (body.type) {
    case 'json':
      brunoBody.mode = 'json';
      brunoBody.json = body.data || '';
      break;

    case 'text':
      brunoBody.mode = 'text';
      brunoBody.text = body.data || '';
      break;

    case 'xml':
      brunoBody.mode = 'xml';
      brunoBody.xml = body.data || '';
      break;

    case 'sparql':
      brunoBody.mode = 'sparql';
      brunoBody.sparql = body.data || '';
      break;

    case 'form-urlencoded':
      brunoBody.mode = 'formUrlEncoded';
      brunoBody.formUrlEncoded = body.data?.map((entry): BrunoKeyValue => {
        const formEntry: BrunoKeyValue = {
          uid: uuid(),
          name: ensureString(entry.name),
          value: ensureString(entry.value),
          enabled: entry.disabled !== true
        };

        if (entry.description) {
          if (typeof entry.description === 'string' && entry.description.trim().length) {
            formEntry.description = entry.description;
          } else if (typeof entry.description === 'object' && entry.description.content?.trim().length) {
            formEntry.description = entry.description.content;
          }
        }

        return formEntry;
      }) || [];
      break;

    case 'multipart-form':
      brunoBody.mode = 'multipartForm';
      brunoBody.multipartForm = body.data?.map((entry): any => {
        const multipartEntry: any = {
          uid: uuid(),
          type: entry.type,
          name: ensureString(entry.name),
          value: entry.type === 'file' ? (entry.value || []) : ensureString(entry.value),
          contentType: entry.contentType || null,
          enabled: entry.disabled !== true
        };

        if (entry.description) {
          if (typeof entry.description === 'string' && entry.description.trim().length) {
            multipartEntry.description = entry.description;
          } else if (typeof entry.description === 'object' && entry.description.content?.trim().length) {
            multipartEntry.description = entry.description.content;
          }
        }

        return multipartEntry;
      }) || [];
      break;

    case 'file':
      brunoBody.mode = 'file';
      brunoBody.file = body.data?.map((file): BrunoFileEntry => {
        const fileEntry: BrunoFileEntry = {
          uid: uuid(),
          filePath: file.filePath || '',
          contentType: file.contentType || '',
          selected: file.selected ?? false
        };

        const fileWithDescription = file as FileBodyVariant;
        const desc = typeof fileWithDescription.description === 'string'
          ? fileWithDescription.description
          : (fileWithDescription.description as { content?: string } | undefined)?.content;
        if (desc && desc.trim().length) fileEntry.description = desc;

        return fileEntry;
      }) || [];
      break;

    default:
      break;
  }

  return brunoBody;
};

export const toBrunoBody = (
  body: HttpRequestBody | HttpRequestBodyVariant[] | null | undefined
): BrunoHttpRequestBodyWithVariants | undefined => {
  if (!body) {
    return parseSingleBrunoBody(null);
  }

  if (Array.isArray(body)) {
    const defaultVariant = body.find((v) => v.title === 'Default') || body[0];
    const otherVariants = body.filter((v) => v !== defaultVariant);

    const brunoBody = parseSingleBrunoBody(defaultVariant?.body);

    brunoBody.variants = otherVariants.map((v) => {
      let type: 'json' | 'text' | 'xml' | 'sparql' | 'formUrlEncoded' = 'json';
      let content = '';

      if (v.body) {
        if (v.body.type === 'form-urlencoded') {
          type = 'formUrlEncoded';
          content = '';
        } else if (['json', 'text', 'xml', 'sparql'].includes(v.body.type)) {
          type = v.body.type as any;
          content = (v.body as RawBody).data || '';
        }
      }

      return {
        uid: (v as any).uid || uuid(),
        name: v.title,
        type,
        content,
        selected: v.selected ?? false
      };
    });

    const activeVariant = brunoBody.variants.find((v) => v.selected);
    if (activeVariant && ['json', 'text', 'xml', 'sparql'].includes(brunoBody.mode)) {
      brunoBody.defaultContent = (brunoBody as any)[brunoBody.mode] || '';
      (brunoBody as any)[brunoBody.mode] = activeVariant.content;
    }

    return brunoBody;
  }

  return parseSingleBrunoBody(body);
};
