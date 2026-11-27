import reducer, {
  addBodyVariant,
  deleteBodyVariant,
  selectBodyVariant,
  updateRequestBody
} from 'providers/ReduxStore/slices/collections';
import { transformRequestToSaveToFilesystem } from 'utils/collections';

const COLLECTION_UID = 'col-1';
const ITEM_UID = 'req-1';
const DEFAULT_BODY = '{"id": 1}';
const ids = { collectionUid: COLLECTION_UID, itemUid: ITEM_UID };

const makeState = (body) => ({
  collections: [
    {
      uid: COLLECTION_UID,
      pathname: '/coll',
      items: [
        {
          uid: ITEM_UID,
          name: 'create user',
          type: 'http-request',
          request: { url: 'https://example.com', method: 'POST', headers: [], params: [], body }
        }
      ]
    }
  ],
  collectionSortOrder: 'default',
  activeWorkspaceUid: null
});

const getItem = (state) => state.collections[0].items[0];
const getDraftBody = (state) => getItem(state).draft.request.body;
const getSavedBody = (state) => transformRequestToSaveToFilesystem(getItem(state)).request.body;

describe('body variants', () => {
  test('editing a variant created from Default does not overwrite Default on save', () => {
    let state = makeState({ mode: 'json', json: DEFAULT_BODY });
    state = reducer(state, addBodyVariant({ ...ids, name: 'Edited' }));
    state = reducer(state, updateRequestBody({ ...ids, content: '{"id": 2}' }));

    const draftBody = getDraftBody(state);
    expect(draftBody.json).toBe('{"id": 2}');
    expect(draftBody.variants[0]).toEqual(expect.objectContaining({ name: 'Edited', content: '{"id": 2}', selected: true }));

    const savedBody = getSavedBody(state);
    expect(savedBody.json).toBe(DEFAULT_BODY);
    expect(savedBody.defaultContent).toBeUndefined();
  });

  test('switching back to Default restores its content', () => {
    let state = makeState({ mode: 'json', json: DEFAULT_BODY });
    state = reducer(state, addBodyVariant({ ...ids, name: 'Other' }));
    state = reducer(state, updateRequestBody({ ...ids, content: '{"id": 2}' }));
    state = reducer(state, selectBodyVariant({ ...ids, variantUid: null }));

    const draftBody = getDraftBody(state);
    expect(draftBody.json).toBe(DEFAULT_BODY);
    expect(draftBody.variants[0].selected).toBe(false);
    expect(draftBody.variants[0].content).toBe('{"id": 2}');
  });

  test('deleting the active variant falls back to the Default content', () => {
    let state = makeState({ mode: 'json', json: DEFAULT_BODY });
    state = reducer(state, addBodyVariant({ ...ids, name: 'Temporary' }));
    state = reducer(state, updateRequestBody({ ...ids, content: '{"temp": true}' }));
    const variantUid = getDraftBody(state).variants[0].uid;
    state = reducer(state, deleteBodyVariant({ ...ids, variantUid }));

    expect(getDraftBody(state).json).toBe(DEFAULT_BODY);
    expect(getDraftBody(state).variants).toEqual([]);
    expect(getSavedBody(state).json).toBe(DEFAULT_BODY);
  });

  test('adding a second variant keeps the original Default', () => {
    let state = makeState({ mode: 'json', json: DEFAULT_BODY });
    state = reducer(state, addBodyVariant({ ...ids, name: 'First' }));
    state = reducer(state, updateRequestBody({ ...ids, content: '{"id": 2}' }));
    state = reducer(state, addBodyVariant({ ...ids, name: 'Second' }));

    const draftBody = getDraftBody(state);
    expect(draftBody.defaultContent).toBe(DEFAULT_BODY);
    expect(draftBody.variants.map((v) => v.selected)).toEqual([false, true]);
    expect(getSavedBody(state).json).toBe(DEFAULT_BODY);
  });

  test('variants cannot be created for form-urlencoded bodies', () => {
    let state = makeState({ mode: 'formUrlEncoded', formUrlEncoded: [] });
    state = reducer(state, addBodyVariant({ ...ids, name: 'Ignored' }));

    expect(getDraftBody(state).variants).toBeUndefined();
  });
});
