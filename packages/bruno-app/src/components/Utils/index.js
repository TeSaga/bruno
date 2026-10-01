import React, { useState } from 'react';
import { IconTools, IconBinary, IconKey } from '@tabler/icons';
import StyledWrapper from './StyledWrapper';
import Base64Util from './Base64Util';
import JwtUtil from './JwtUtil';

const UtilsTab = () => {
  const [activeTab, setActiveTab] = useState('base64'); // 'base64' | 'jwt'

  return (
    <StyledWrapper>
      {/* Top Header */}
      <div className="utils-header">
        <div className="utils-title-section">
          <div className="utils-icon-badge">
            <IconTools size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="utils-title">Developer Utilities</div>
            <div className="utils-subtitle">Base64 Encoder/Decoder & JWT Inspector</div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="nav-pills" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'base64'}
            className={`nav-pill ${activeTab === 'base64' ? 'active' : ''}`}
            onClick={() => setActiveTab('base64')}
          >
            <IconBinary size={15} strokeWidth={1.8} />
            <span>Base64</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'jwt'}
            className={`nav-pill ${activeTab === 'jwt' ? 'active' : ''}`}
            onClick={() => setActiveTab('jwt')}
          >
            <IconKey size={15} strokeWidth={1.8} />
            <span>JWT Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="utils-content">
        {activeTab === 'base64' ? <Base64Util /> : <JwtUtil />}
      </div>
    </StyledWrapper>
  );
};

export default UtilsTab;
