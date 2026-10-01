import React, { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
  IconCopy,
  IconCheck,
  IconTrash,
  IconClock,
  IconAlertCircle,
  IconShieldCheck,
  IconShieldX,
  IconInfoCircle,
  IconKey
} from '@tabler/icons';
import useCopyToClipboard from 'hooks/useCopyToClipboard';

// UTF-8 safe base64url decode
const decodeBase64Url = (str) => {
  if (!str) return '';
  let sanitized = str.replace(/-/g, '+').replace(/_/g, '/');
  while (sanitized.length % 4 !== 0) {
    sanitized += '=';
  }
  try {
    const binary = atob(sanitized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch (err) {
    throw new Error('Unable to decode segment');
  }
};

const SAMPLE_VALID_JWT
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2Rldl80MiIsIm5hbWUiOiJCcnVubyBFeHBsb3JlciIsInJvbGUiOiJhZG1pbiIsImlzcyI6Imh0dHBzOi8vYXV0aC51c2VicnVuby5jb20iLCJhdWQiOiJodHRwczovL2FwaS51c2VicnVuby5jb20iLCJpYXQiOjE3OTA3MjgyNTMsImV4cCI6MTg5MTMzNjY1M30.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const SAMPLE_EXPIRED_JWT
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2V4cGlyZWRfOTkiLCJuYW1lIjoiT2xkIFNlc3Npb24iLCJyb2xlIjoiZ3Vlc3QiLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MTY3MjYxNzYwMH0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

const JwtUtil = () => {
  const [tokenInput, setTokenInput] = useState(SAMPLE_VALID_JWT);
  const { copied: tokenCopied, copyToClipboard: copyToken } = useCopyToClipboard();
  const { copied: headerCopied, copyToClipboard: copyHeader } = useCopyToClipboard();
  const { copied: payloadCopied, copyToClipboard: copyPayload } = useCopyToClipboard();

  // Parse and decode the token
  const parsedData = useMemo(() => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      return {
        rawParts: null,
        header: null,
        payload: null,
        signature: null,
        formattedHeader: '',
        formattedPayload: '',
        error: null
      };
    }

    const parts = trimmed.split('.');
    if (parts.length < 2 || parts.length > 3) {
      return {
        rawParts: null,
        header: null,
        payload: null,
        signature: null,
        formattedHeader: '',
        formattedPayload: '',
        error: 'Invalid JWT format: A token must have 3 dot-separated segments (header.payload.signature)'
      };
    }

    try {
      const headerStr = decodeBase64Url(parts[0]);
      const headerJson = JSON.parse(headerStr);
      const payloadStr = decodeBase64Url(parts[1]);
      const payloadJson = JSON.parse(payloadStr);
      const signature = parts[2] || '';

      return {
        rawParts: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2] || ''
        },
        header: headerJson,
        payload: payloadJson,
        signature,
        formattedHeader: JSON.stringify(headerJson, null, 2),
        formattedPayload: JSON.stringify(payloadJson, null, 2),
        error: null
      };
    } catch (err) {
      return {
        rawParts: null,
        header: null,
        payload: null,
        signature: null,
        formattedHeader: '',
        formattedPayload: '',
        error: `Decoding error: ${err.message || 'Invalid JSON or Base64 in token'}`
      };
    }
  }, [tokenInput]);

  // Expiration & temporal validity analysis
  const expirationStatus = useMemo(() => {
    if (!parsedData.payload) return null;
    const { exp, nbf, iat } = parsedData.payload;
    const now = Math.floor(Date.now() / 1000);

    let isExpired = false;
    let expFormatted = null;
    let expRelative = null;

    if (typeof exp === 'number') {
      const expMoment = moment.unix(exp);
      expFormatted = expMoment.format('YYYY-MM-DD HH:mm:ss');
      expRelative = expMoment.fromNow();
      isExpired = now > exp;
    }

    let isNotYetValid = false;
    let nbfFormatted = null;
    if (typeof nbf === 'number') {
      const nbfMoment = moment.unix(nbf);
      nbfFormatted = nbfMoment.format('YYYY-MM-DD HH:mm:ss');
      isNotYetValid = now < nbf;
    }

    let iatFormatted = null;
    let iatRelative = null;
    if (typeof iat === 'number') {
      const iatMoment = moment.unix(iat);
      iatFormatted = iatMoment.format('YYYY-MM-DD HH:mm:ss');
      iatRelative = iatMoment.fromNow();
    }

    return {
      hasExp: typeof exp === 'number',
      isExpired,
      expFormatted,
      expRelative,
      hasNbf: typeof nbf === 'number',
      isNotYetValid,
      nbfFormatted,
      hasIat: typeof iat === 'number',
      iatFormatted,
      iatRelative
    };
  }, [parsedData.payload]);

  const handleCopyToken = useCallback(() => {
    if (!tokenInput) return;
    copyToken(tokenInput).then(() => toast.success('Token copied to clipboard!'));
  }, [tokenInput, copyToken]);

  const handleCopyHeader = useCallback(() => {
    if (!parsedData.formattedHeader) return;
    copyHeader(parsedData.formattedHeader).then(() => toast.success('Header JSON copied!'));
  }, [parsedData.formattedHeader, copyHeader]);

  const handleCopyPayload = useCallback(() => {
    if (!parsedData.formattedPayload) return;
    copyPayload(parsedData.formattedPayload).then(() => toast.success('Payload JSON copied!'));
  }, [parsedData.formattedPayload, copyPayload]);

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-700/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Sample Tokens:</span>
          <button
            type="button"
            className="tool-btn"
            onClick={() => setTokenInput(SAMPLE_VALID_JWT)}
            title="Load an active valid JWT sample"
          >
            <IconShieldCheck size={14} className="text-green-400" />
            <span>Active Sample</span>
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => setTokenInput(SAMPLE_EXPIRED_JWT)}
            title="Load an expired JWT sample"
          >
            <IconShieldX size={14} className="text-red-400" />
            <span>Expired Sample</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="tool-btn"
            onClick={handleCopyToken}
            disabled={!tokenInput}
            title="Copy full encoded token"
          >
            {tokenCopied ? <IconCheck size={14} className="text-green-500" /> : <IconCopy size={14} />}
            <span>{tokenCopied ? 'Copied' : 'Copy Token'}</span>
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => setTokenInput('')}
            disabled={!tokenInput}
            title="Clear token input"
          >
            <IconTrash size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Encoded Input & Colored Breakdown (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="panel-card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <IconKey size={14} className="text-muted" />
                <span>Encoded Token</span>
              </div>
              <span className="badge neutral">{tokenInput.length} chars</span>
            </div>
            <div className="card-body flex flex-col gap-3">
              <textarea
                className="code-textarea"
                rows={6}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste JWT here (e.g. eyJhbGciOi...)..."
                spellCheck={false}
              />

              {/* Color-coded segments preview */}
              {parsedData.rawParts && (
                <div>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Color-Coded Breakdown</span>
                    <span className="text-[11px] font-normal normal-case text-muted">
                      Header / Payload / Signature
                    </span>
                  </div>
                  <div className="jwt-token-preview">
                    <span className="jwt-part-header" title="Header">
                      {parsedData.rawParts.header}
                    </span>
                    <span className="jwt-part-dot">.</span>
                    <span className="jwt-part-payload" title="Payload">
                      {parsedData.rawParts.payload}
                    </span>
                    {parsedData.rawParts.signature && (
                      <>
                        <span className="jwt-part-dot">.</span>
                        <span className="jwt-part-signature" title="Signature">
                          {parsedData.rawParts.signature}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Decoded Content (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {parsedData.error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <IconAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{parsedData.error}</div>
                <div className="text-xs text-red-400/80 mt-1">
                  JSON Web Tokens are composed of three parts separated by periods (dots). Please ensure you pasted the full token.
                </div>
              </div>
            </div>
          ) : !tokenInput.trim() ? (
            <div className="panel-card p-8 text-center text-muted flex flex-col items-center justify-center gap-2">
              <IconInfoCircle size={28} className="opacity-50" />
              <div className="text-sm font-medium">No token provided</div>
              <div className="text-xs opacity-75">
                Paste a JWT token on the left or click "Active Sample" to inspect claims and signatures.
              </div>
            </div>
          ) : (
            <>
              {/* Expiration Status Banner */}
              {expirationStatus && (
                <div
                  className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-sm ${
                    !expirationStatus.hasExp
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : expirationStatus.isExpired
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {expirationStatus.hasExp ? (
                      expirationStatus.isExpired ? (
                        <IconShieldX size={20} className="flex-shrink-0" />
                      ) : (
                        <IconShieldCheck size={20} className="flex-shrink-0" />
                      )
                    ) : (
                      <IconInfoCircle size={20} className="flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold">
                        {!expirationStatus.hasExp
                          ? 'No expiration claim (`exp`)'
                          : expirationStatus.isExpired
                            ? `Token expired ${expirationStatus.expRelative}`
                            : `Token is valid (expires ${expirationStatus.expRelative})`}
                      </span>
                      {expirationStatus.hasExp && (
                        <div className="text-xs opacity-80 mt-0.5">
                          Expiration date: {expirationStatus.expFormatted}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      !expirationStatus.hasExp
                        ? 'info'
                        : expirationStatus.isExpired
                          ? 'danger'
                          : 'success'
                    }`}
                  >
                    {!expirationStatus.hasExp
                      ? 'NO EXP'
                      : expirationStatus.isExpired
                        ? 'EXPIRED'
                        : 'ACTIVE'}
                  </span>
                </div>
              )}

              {/* Claims Details Summary Table */}
              {parsedData.payload && (
                <div className="panel-card">
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      <IconClock size={14} className="text-muted" />
                      <span>Standard Claims Summary</span>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <table className="claims-table">
                      <tbody>
                        {parsedData.header?.alg && (
                          <tr>
                            <td className="claim-key">Algorithm</td>
                            <td className="claim-val font-semibold text-red-400">
                              {parsedData.header.alg}
                            </td>
                          </tr>
                        )}
                        {parsedData.payload?.sub && (
                          <tr>
                            <td className="claim-key">Subject (sub)</td>
                            <td className="claim-val font-mono">{String(parsedData.payload.sub)}</td>
                          </tr>
                        )}
                        {parsedData.payload?.iss && (
                          <tr>
                            <td className="claim-key">Issuer (iss)</td>
                            <td className="claim-val font-mono">{String(parsedData.payload.iss)}</td>
                          </tr>
                        )}
                        {parsedData.payload?.aud && (
                          <tr>
                            <td className="claim-key">Audience (aud)</td>
                            <td className="claim-val font-mono">
                              {Array.isArray(parsedData.payload.aud)
                                ? parsedData.payload.aud.join(', ')
                                : String(parsedData.payload.aud)}
                            </td>
                          </tr>
                        )}
                        {expirationStatus?.hasIat && (
                          <tr>
                            <td className="claim-key">Issued At (iat)</td>
                            <td className="claim-val text-xs text-muted">
                              {expirationStatus.iatFormatted} ({expirationStatus.iatRelative})
                            </td>
                          </tr>
                        )}
                        {expirationStatus?.hasExp && (
                          <tr>
                            <td className="claim-key">Expires (exp)</td>
                            <td
                              className={`claim-val text-xs font-semibold ${
                                expirationStatus.isExpired ? 'text-red-400' : 'text-green-400'
                              }`}
                            >
                              {expirationStatus.expFormatted} ({expirationStatus.expRelative})
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Header Box */}
              <div className="panel-card border-red-500/30">
                <div className="card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
                    <span className="text-red-400 font-semibold">Header</span>
                    <span className="text-xs text-muted normal-case font-normal">
                      Algorithm & Token Type
                    </span>
                  </div>
                  <button
                    type="button"
                    className="tool-btn text-xs py-1"
                    onClick={handleCopyHeader}
                    title="Copy Header JSON"
                  >
                    {headerCopied ? <IconCheck size={13} className="text-green-500" /> : <IconCopy size={13} />}
                    <span>{headerCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="card-body p-2">
                  <pre className="code-block text-red-200">
                    {parsedData.formattedHeader}
                  </pre>
                </div>
              </div>

              {/* Payload Box */}
              <div className="panel-card border-purple-500/30">
                <div className="card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
                    <span className="text-purple-400 font-semibold">Payload</span>
                    <span className="text-xs text-muted normal-case font-normal">
                      Data & Custom Claims
                    </span>
                  </div>
                  <button
                    type="button"
                    className="tool-btn text-xs py-1"
                    onClick={handleCopyPayload}
                    title="Copy Payload JSON"
                  >
                    {payloadCopied ? <IconCheck size={13} className="text-green-500" /> : <IconCopy size={13} />}
                    <span>{payloadCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="card-body p-2">
                  <pre className="code-block text-purple-200">
                    {parsedData.formattedPayload}
                  </pre>
                </div>
              </div>

              {/* Signature Box */}
              {parsedData.signature && (
                <div className="panel-card border-cyan-500/30">
                  <div className="card-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                      <span className="text-cyan-400 font-semibold">Signature</span>
                      <span className="text-xs text-muted normal-case font-normal">
                        HMAC / RSA / ECDSA
                      </span>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <pre className="code-block text-cyan-200 text-xs">
                      {parsedData.signature}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JwtUtil;
