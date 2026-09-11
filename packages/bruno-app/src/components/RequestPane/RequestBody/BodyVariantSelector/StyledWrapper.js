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
`;

export default Wrapper;
