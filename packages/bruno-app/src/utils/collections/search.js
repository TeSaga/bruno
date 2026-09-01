import { isItemARequest } from './index';

const matchString = (val, query) => {
  if (typeof val === 'string') {
    return val.toLowerCase().includes(query);
  }
  if (typeof val === 'number') {
    return String(val).includes(query);
  }
  return false;
};

const matchArrayEntries = (arr, query) => {
  if (!Array.isArray(arr)) return false;
  for (let i = 0; i < arr.length; i++) {
    const entry = arr[i];
    if (!entry) continue;
    if (matchString(entry.name, query) || matchString(entry.value, query) || matchString(entry.description, query)) {
      return true;
    }
  }
  return false;
};

const matchBody = (body, query) => {
  if (!body) return false;
  if (typeof body === 'string') return matchString(body, query);

  if (typeof body === 'object') {
    if (matchString(body.json, query)) return true;
    if (matchString(body.text, query)) return true;
    if (matchString(body.xml, query)) return true;
    if (matchString(body.sparql, query)) return true;
    if (body.graphql) {
      if (matchString(body.graphql.query, query)) return true;
      if (matchString(body.graphql.variables, query)) return true;
    }
    if (matchArrayEntries(body.formUrlEncoded, query)) return true;
    if (matchArrayEntries(body.multipartForm, query)) return true;
    if (matchArrayEntries(body.file, query)) return true;
  }
  return false;
};

export const doesRequestMatchSearchText = (item, searchText = '') => {
  if (!item) return false;
  if (!searchText) return true;

  const query = searchText.toLowerCase().trim();
  if (!query) return true;

  // 1. Match Item Name
  if (matchString(item.name, query) || matchString(item.draft?.name, query)) {
    return true;
  }

  const req = item.draft?.request || item.request;
  if (!req) return false;

  // 2. Match URL & Method
  if (matchString(req.url, query) || matchString(req.method, query)) {
    return true;
  }

  // 3. Match Body (json, text, xml, graphql, formUrlEncoded, multipart)
  if (matchBody(req.body, query)) {
    return true;
  }

  // 4. Match Query Params & Headers
  if (matchArrayEntries(req.params, query)) return true;
  if (matchArrayEntries(req.headers, query)) return true;

  // 5. Match Scripts, Tests, Docs
  if (matchString(req.docs, query) || matchString(item.docs, query)) return true;
  if (matchString(req.tests, query)) return true;
  if (req.script && (matchString(req.script.req, query) || matchString(req.script.res, query))) {
    return true;
  }

  return false;
};

export const doesFolderHaveItemsMatchSearchText = (item, searchText = '') => {
  if (!item?.items || !item.items.length) return false;

  const query = searchText.toLowerCase().trim();
  if (!query) return true;

  // If folder itself matches
  if (matchString(item.name, query)) {
    return true;
  }

  const searchRecursive = (items) => {
    for (let i = 0; i < items.length; i++) {
      const child = items[i];
      if (!child || child.isTransient) continue;

      if (isItemARequest(child)) {
        if (doesRequestMatchSearchText(child, searchText)) {
          return true;
        }
      } else {
        if (matchString(child.name, query)) {
          return true;
        }
        if (child.items?.length && searchRecursive(child.items)) {
          return true;
        }
      }
    }
    return false;
  };

  return searchRecursive(item.items);
};

export const doesCollectionHaveItemsMatchingSearchText = (collection, searchText = '') => {
  if (!collection?.items || !collection.items.length) return false;

  const query = searchText.toLowerCase().trim();
  if (!query) return true;

  if (matchString(collection.name, query)) {
    return true;
  }

  return doesFolderHaveItemsMatchSearchText(collection, searchText);
};
