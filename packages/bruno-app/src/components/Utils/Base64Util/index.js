import React, { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  IconCopy,
  IconCheck,
  IconArrowsExchange,
  IconTrash,
  IconBraces,
  IconFileCode,
  IconAlertCircle
} from '@tabler/icons';
import useCopyToClipboard from 'hooks/useCopyToClipboard';

// UTF-8 safe encode to Base64
export const encodeBase64 = (input, urlSafe = false) => {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return b64;
};

// UTF-8 safe decode from Base64
export const decodeBase64 = (input, urlSafe = false) => {
  if (!input || !input.trim()) return '';
  let sanitized = input.trim();
  // Support both url-safe and standard
  sanitized = sanitized.replace(/-/g, '+').replace(/_/g, '/');
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
    throw new Error('Invalid Base64 string');
  }
};

const SAMPLE_TEXT = JSON.stringify({
  greeting: 'Hello from Bruno! 🚀',
  status: 'active',
  created_at: new Date().toISOString()
}, null, 2);

const Base64Util = () => {
  const [mode, setMode] = useState('decode'); // 'decode' | 'encode'
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const { output, error, isValidJson } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: null, isValidJson: false };
    }
    try {
      let result = '';
      if (mode === 'decode') {
        result = decodeBase64(input, urlSafe);
      } else {
        result = encodeBase64(input, urlSafe);
      }

      let isJson = false;
      if (mode === 'decode' && result) {
        try {
          const parsed = JSON.parse(result);
          isJson = typeof parsed === 'object' && parsed !== null;
        } catch {
          isJson = false;
        }
      }

      return { output: result, error: null, isValidJson: isJson };
    } catch (err) {
      return { output: '', error: err.message, isValidJson: false };
    }
  }, [input, mode, urlSafe]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    copyToClipboard(output).then(() => {
      toast.success('Copied to clipboard!');
    });
  }, [output, copyToClipboard]);

  const handleSwap = useCallback(() => {
    if (!output) return;
    setInput(output);
    setMode((prev) => (prev === 'decode' ? 'encode' : 'decode'));
  }, [output]);

  const handleFormatJson = useCallback(() => {
    if (!output || !isValidJson) return;
    try {
      const formatted = JSON.stringify(JSON.parse(output), null, 2);
      if (mode === 'decode') {
        // If decoding, we update the input to encode the formatted version or update display
        // Best UX: encode the formatted JSON back or just update output if state allows
        // Here we can re-encode the formatted JSON to make it canonical
        const reEncoded = encodeBase64(formatted, urlSafe);
        setInput(reEncoded);
      } else {
        setInput(formatted);
      }
      toast.success('JSON formatted!');
    } catch {
      toast.error('Unable to format JSON');
    }
  }, [output, isValidJson, mode, urlSafe]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const handleLoadSample = useCallback(() => {
    if (mode === 'decode') {
      const sampleEncoded = encodeBase64(SAMPLE_TEXT, urlSafe);
      setInput(sampleEncoded);
    } else {
      setInput(SAMPLE_TEXT);
    }
  }, [mode, urlSafe]);

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      {/* Controls toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="mode-switch-group">
            <button
              type="button"
              className={`mode-switch-btn ${mode === 'decode' ? 'active' : ''}`}
              onClick={() => setMode('decode')}
            >
              Decode
            </button>
            <button
              type="button"
              className={`mode-switch-btn ${mode === 'encode' ? 'active' : ''}`}
              onClick={() => setMode('encode')}
            >
              Encode
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-muted hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="rounded"
            />
            <span>URL-Safe Base64</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {isValidJson && (
            <button
              type="button"
              className="tool-btn"
              onClick={handleFormatJson}
              title="Prettify JSON with 2-space indentation"
            >
              <IconBraces size={14} />
              <span>Format JSON</span>
            </button>
          )}

          <button
            type="button"
            className="tool-btn"
            onClick={handleSwap}
            disabled={!output}
            title="Swap input and output"
          >
            <IconArrowsExchange size={14} />
            <span>Swap</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={handleLoadSample}
            title="Load an example payload"
          >
            <IconFileCode size={14} />
            <span>Sample</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={handleClear}
            disabled={!input}
            title="Clear all"
          >
            <IconTrash size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Grid of Input and Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="panel-card flex-1">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span>{mode === 'decode' ? 'Encoded Base64 Input' : 'Plain Text Input'}</span>
              <span className="badge neutral">{input.length} chars</span>
            </div>
          </div>
          <div className="card-body">
            <textarea
              className="code-textarea"
              rows={12}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'decode'
                  ? 'Paste or type your Base64 string here (e.g. SGVsbG8gV29ybGQh)...'
                  : 'Type or paste plain text / JSON to encode into Base64...'
              }
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="panel-card flex-1">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span>{mode === 'decode' ? 'Decoded Output' : 'Base64 Encoded Output'}</span>
              {output && <span className="badge neutral">{output.length} chars</span>}
              {isValidJson && <span className="badge success">JSON</span>}
            </div>
            {output && (
              <button
                type="button"
                className="tool-btn"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <IconCheck size={14} className="text-green-500" /> : <IconCopy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <div className="card-body flex flex-col">
            {error ? (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <IconAlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{error}</div>
                  <div className="text-xs text-red-400/80 mt-1">
                    Ensure the input contains valid Base64 characters and proper padding.
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                className="code-textarea"
                rows={12}
                value={output}
                readOnly
                placeholder="The output will appear here automatically..."
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64Util;
