import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;

  .variant-trigger {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    color: ${(props) => props.theme.primary.text};
    cursor: pointer;
    white-space: nowrap;
    font-size: ${(props) => props.theme.font.size.sm};
    transition: border-color 0.15s, background 0.15s;
    user-select: none;

    &:hover {
      border-color: rgba(128, 128, 128, 0.4);
      background: rgba(128, 128, 128, 0.08);
    }
  }

  .variant-label {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .variant-caret {
    opacity: 0.6;
    flex-shrink: 0;
  }

  /* ── Rename modal ───────────────────────────────────────────── */
  .rename-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rename-modal {
    background: ${(props) => props.theme.modal?.bg || props.theme.background};
    border: 1px solid ${(props) => props.theme.modal?.border || props.theme.sidebar?.border || 'rgba(128,128,128,0.3)'};
    border-radius: 8px;
    padding: 20px;
    min-width: 300px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.32);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rename-modal-title {
    margin: 0;
    font-size: ${(props) => props.theme.font.size.sm};
    font-weight: 600;
    color: ${(props) => props.theme.text};
  }

  .rename-modal-input {
    width: 100%;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.input?.border || 'rgba(128,128,128,0.4)'};
    background: ${(props) => props.theme.input?.bg || 'transparent'};
    color: ${(props) => props.theme.text};
    font-size: ${(props) => props.theme.font.size.sm};
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: ${(props) => props.theme.primary?.border || props.theme.primary?.text || '#7c3aed'};
    }
  }

  .rename-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .rename-modal-cancel,
  .rename-modal-confirm {
    padding: 5px 14px;
    border-radius: 4px;
    font-size: ${(props) => props.theme.font.size.sm};
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.85;
    }
  }

  .rename-modal-cancel {
    background: transparent;
    border-color: ${(props) => props.theme.modal?.border || 'rgba(128,128,128,0.3)'};
    color: ${(props) => props.theme.text};
  }

  .rename-modal-confirm {
    background: ${(props) => props.theme.primary?.bg || '#7c3aed'};
    color: #fff;
  }
`;

export default Wrapper;
