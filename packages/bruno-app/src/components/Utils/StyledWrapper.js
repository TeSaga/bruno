import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};

  .utils-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid ${(props) => props.theme.sidebar?.borderRight || props.theme.border?.BORDER1 || '#2d3748'};
    flex-shrink: 0;
  }

  .utils-title-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .utils-icon-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: ${(props) => props.theme.tabs?.secondary?.active?.bg || 'rgba(234, 90, 71, 0.12)'};
      color: ${(props) => props.theme.brand || props.theme.workspace?.accent || '#EA5A47'};
    }

    .utils-title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .utils-subtitle {
      font-size: 12px;
      color: ${(props) => props.theme.colors?.text?.muted || '#9ca3af'};
      margin-top: 2px;
    }
  }

  .nav-pills {
    display: flex;
    align-items: center;
    gap: 6px;
    background: ${(props) => props.theme.tabs?.secondary?.bg || 'rgba(0, 0, 0, 0.2)'};
    padding: 3px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.border?.BORDER0 || 'rgba(255, 255, 255, 0.06)'};

    .nav-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      color: ${(props) => props.theme.colors?.text?.muted || '#9ca3af'};
      background: transparent;
      transition: all 0.15s ease;

      &:hover {
        color: ${(props) => props.theme.text};
      }

      &.active {
        color: ${(props) => props.theme.text};
        background: ${(props) => props.theme.tabs?.secondary?.active?.bg || 'rgba(255, 255, 255, 0.1)'};
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .utils-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 20px;
    min-height: 0;
  }

  /* Utility toolbar & buttons */
  .tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid ${(props) => props.theme.input?.border || props.theme.border?.BORDER1 || '#374151'};
    background: ${(props) => props.theme.input?.bg || 'transparent'};
    color: ${(props) => props.theme.text};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: ${(props) => props.theme.tabs?.secondary?.active?.bg || 'rgba(255, 255, 255, 0.08)'};
      border-color: ${(props) => props.theme.input?.focusBorder || '#6b7280'};
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &.primary {
      background: ${(props) => props.theme.brand || props.theme.workspace?.accent || '#EA5A47'};
      color: #ffffff;
      border-color: transparent;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    }
  }

  .mode-switch-group {
    display: inline-flex;
    border-radius: 6px;
    padding: 2px;
    background: ${(props) => props.theme.tabs?.secondary?.bg || 'rgba(0, 0, 0, 0.2)'};
    border: 1px solid ${(props) => props.theme.border?.BORDER0 || 'rgba(255, 255, 255, 0.08)'};

    .mode-switch-btn {
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 4px;
      border: none;
      background: transparent;
      color: ${(props) => props.theme.colors?.text?.muted || '#9ca3af'};
      cursor: pointer;
      transition: all 0.15s ease;

      &.active {
        background: ${(props) => props.theme.tabs?.secondary?.active?.bg || 'rgba(255, 255, 255, 0.12)'};
        color: ${(props) => props.theme.text};
        font-weight: 600;
      }
    }
  }

  /* Textareas */
  textarea.code-textarea {
    width: 100%;
    min-height: 180px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 12px;
    border-radius: 8px;
    background: ${(props) => props.theme.input?.bg || 'rgba(0, 0, 0, 0.2)'};
    border: 1px solid ${(props) => props.theme.input?.border || props.theme.border?.BORDER1 || '#374151'};
    color: ${(props) => props.theme.text};
    resize: vertical;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:focus {
      border-color: ${(props) => props.theme.input?.focusBorder || props.theme.brand || '#EA5A47'};
      box-shadow: 0 0 0 2px rgba(234, 90, 71, 0.15);
    }

    &::placeholder {
      color: ${(props) => props.theme.colors?.text?.muted || '#6b7280'};
      opacity: 0.6;
    }
  }

  /* Cards */
  .panel-card {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.sidebar?.borderRight || props.theme.border?.BORDER1 || '#2d3748'};
    background: ${(props) => props.theme.background?.SURFACE0 || props.theme.tabs?.secondary?.bg || 'rgba(255, 255, 255, 0.02)'};
    overflow: hidden;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-bottom: 1px solid ${(props) => props.theme.sidebar?.borderRight || props.theme.border?.BORDER0 || 'rgba(255, 255, 255, 0.06)'};
      background: ${(props) => props.theme.tabs?.secondary?.active?.bg || 'rgba(0, 0, 0, 0.1)'};
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .card-body {
      padding: 12px;
      flex: 1;
    }
  }

  /* Preformatted code blocks */
  pre.code-block {
    margin: 0;
    padding: 12px;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12.5px;
    line-height: 1.55;
    background: ${(props) => props.theme.input?.bg || 'rgba(0, 0, 0, 0.3)'};
    border: 1px solid ${(props) => props.theme.border?.BORDER0 || 'rgba(255, 255, 255, 0.06)'};
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 280px;
    overflow-y: auto;
  }

  /* JWT Colored Token Preview */
  .jwt-token-preview {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 12px;
    border-radius: 8px;
    background: ${(props) => props.theme.input?.bg || 'rgba(0, 0, 0, 0.25)'};
    border: 1px solid ${(props) => props.theme.input?.border || props.theme.border?.BORDER1 || '#374151'};
    word-break: break-all;
    user-select: text;

    .jwt-part-header {
      color: #f87171;
      font-weight: 500;
    }

    .jwt-part-dot {
      color: #9ca3af;
      font-weight: bold;
    }

    .jwt-part-payload {
      color: #c084fc;
      font-weight: 500;
    }

    .jwt-part-signature {
      color: #38bdf8;
      font-weight: 500;
    }
  }

  /* Badges & Pills */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;

    &.success {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    &.danger {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    &.info {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    &.neutral {
      background: rgba(156, 163, 175, 0.15);
      color: #9ca3af;
      border: 1px solid rgba(156, 163, 175, 0.25);
    }
  }

  /* Claims grid */
  .claims-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    tr {
      border-bottom: 1px solid ${(props) => props.theme.border?.BORDER0 || 'rgba(255, 255, 255, 0.06)'};

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 6px 8px;
      vertical-align: top;

      &.claim-key {
        font-family: ui-monospace, monospace;
        color: ${(props) => props.theme.colors?.text?.muted || '#9ca3af'};
        width: 90px;
        font-weight: 500;
      }

      &.claim-val {
        word-break: break-all;
      }
    }
  }
`;

export default StyledWrapper;
