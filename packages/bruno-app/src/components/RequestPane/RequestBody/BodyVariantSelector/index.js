import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconPlus, IconTrash, IconPencil, IconCheck, IconChevronDown } from '@tabler/icons';
import {
  addBodyVariant,
  deleteBodyVariant,
  selectBodyVariant,
  renameBodyVariant
} from 'providers/ReduxStore/slices/collections';
import { findCollectionByUid, findItemInCollection } from 'utils/collections';
import MenuDropdown from 'ui/MenuDropdown';
import StyledWrapper from './StyledWrapper';

const SUPPORTED_MODES = ['json', 'text', 'xml', 'sparql', 'formUrlEncoded'];

const BodyVariantSelector = ({ item, collection }) => {
  const dispatch = useDispatch();
  const [renameModal, setRenameModal] = useState(null); // { uid, name } | null

  // Read body directly from Redux so we get live updates
  const body = useSelector((state) => {
    const col = findCollectionByUid(state.collections.collections, collection.uid);
    if (!col) return null;
    const it = findItemInCollection(col, item.uid);
    if (!it) return null;
    return it.draft ? it.draft.request?.body : it.request?.body;
  });

  const variants = body?.variants || [];
  const activeVariant = variants.find((v) => v.selected) || null;
  const label = activeVariant ? activeVariant.name : 'Default';

  if (!body || !SUPPORTED_MODES.includes(body.mode)) return null;

  const handleSelect = useCallback((variantUid) => {
    dispatch(selectBodyVariant({ itemUid: item.uid, collectionUid: collection.uid, variantUid }));
  }, [dispatch, item.uid, collection.uid]);

  const handleAdd = useCallback(() => {
    dispatch(addBodyVariant({ itemUid: item.uid, collectionUid: collection.uid }));
  }, [dispatch, item.uid, collection.uid]);

  const handleDelete = useCallback((variantUid) => {
    dispatch(deleteBodyVariant({ itemUid: item.uid, collectionUid: collection.uid, variantUid }));
  }, [dispatch, item.uid, collection.uid]);

  const handleRename = useCallback((variantUid, name) => {
    dispatch(renameBodyVariant({ itemUid: item.uid, collectionUid: collection.uid, variantUid, name }));
  }, [dispatch, item.uid, collection.uid]);

  const confirmRename = () => {
    if (renameModal && renameModal.name.trim()) {
      handleRename(renameModal.uid, renameModal.name.trim());
    }
    setRenameModal(null);
  };

  const menuItems = useMemo(() => {
    const items = [
      {
        id: '__default__',
        label: 'Default',
        rightSection: !activeVariant ? IconCheck : null,
        onClick: () => handleSelect(null)
      }
    ];

    if (variants.length > 0) {
      items.push({ type: 'divider', id: 'div-variants' });
      variants.forEach((variant, index) => {
        // Use uid if available, otherwise fallback to index-based key
        const variantKey = variant.uid || `__variant_${index}__`;
        items.push({
          id: variantKey,
          label: variant.name,
          rightSection: variant.selected ? IconCheck : null,
          onClick: () => handleSelect(variant.uid || null),
          submenu: [
            {
              id: `rename-${variantKey}`,
              label: 'Rename',
              leftSection: IconPencil,
              onClick: () => setRenameModal({ uid: variant.uid, name: variant.name })
            },
            {
              id: `delete-${variantKey}`,
              label: 'Delete',
              leftSection: IconTrash,
              onClick: () => handleDelete(variant.uid)
            }
          ]
        });
      });
    }

    items.push({ type: 'divider', id: 'div-add' });
    items.push({
      id: '__add__',
      label: 'Add Variant',
      leftSection: IconPlus,
      onClick: handleAdd
    });

    return items;
  }, [variants, activeVariant, handleSelect, handleAdd, handleDelete]);

  const activeId = activeVariant
    ? (activeVariant.uid || `__variant_${variants.indexOf(activeVariant)}__`)
    : '__default__';

  return (
    <StyledWrapper>
      <MenuDropdown
        items={menuItems}
        placement="bottom-end"
        selectedItemId={activeId}
        showGroupDividers={false}
        data-testid="body-variant-dropdown"
      >
        <div className="variant-trigger" data-testid="body-variant-selector-trigger">
          <span className="variant-label">{label}</span>
          <IconChevronDown size={12} strokeWidth={2} className="variant-caret" />
        </div>
      </MenuDropdown>

      {renameModal && (
        <div className="rename-modal-overlay" onClick={() => setRenameModal(null)}>
          <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
            <p className="rename-modal-title">Rename variant</p>
            <input
              autoFocus
              className="rename-modal-input"
              value={renameModal.name}
              onChange={(e) => setRenameModal((m) => ({ ...m, name: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename();
                if (e.key === 'Escape') setRenameModal(null);
              }}
            />
            <div className="rename-modal-actions">
              <button className="rename-modal-cancel" onClick={() => setRenameModal(null)}>Cancel</button>
              <button className="rename-modal-confirm" onClick={confirmRename}>Rename</button>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

export default BodyVariantSelector;
