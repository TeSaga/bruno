import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UtilsTab from './index';
import { encodeBase64, decodeBase64 } from './Base64Util';
import { ThemeProvider } from 'styled-components';

const mockTheme = {
  bg: '#18181b',
  text: '#f4f4f5',
  colors: {
    text: {
      muted: '#a1a1aa'
    }
  },
  tabs: {
    secondary: {
      bg: '#27272a',
      active: {
        bg: '#3f3f46'
      }
    }
  },
  border: {
    BORDER0: '#27272a',
    BORDER1: '#3f3f46'
  },
  input: {
    bg: '#27272a',
    border: '#3f3f46',
    focusBorder: '#EA5A47'
  },
  brand: '#EA5A47'
};

const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Developer Utilities', () => {
  describe('Base64 utility algorithms', () => {
    it('encodes plain ascii correctly', () => {
      expect(encodeBase64('Hello World')).toBe('SGVsbG8gV29ybGQ=');
    });

    it('decodes standard base64 correctly', () => {
      expect(decodeBase64('SGVsbG8gV29ybGQ=')).toBe('Hello World');
    });

    it('handles unicode, emojis, and international characters in utf-8', () => {
      const text = 'Bruno 🚀 — café con música & Español (日本語)';
      const encoded = encodeBase64(text);
      expect(decodeBase64(encoded)).toBe(text);
    });

    it('supports URL-safe Base64 without + and / and padding', () => {
      const text = 'subjects?param=value&test=true';
      const encoded = encodeBase64(text, true);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
      expect(decodeBase64(encoded, true)).toBe(text);
    });

    it('throws friendly error on invalid base64 input', () => {
      expect(() => decodeBase64('!!!NOT_BASE64###')).toThrow('Invalid Base64 string');
    });
  });

  describe('UtilsTab UI Component', () => {
    it('renders the header and navigation pills', () => {
      renderWithTheme(<UtilsTab />);
      expect(screen.getByText('Developer Utilities')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Base64/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /JWT Inspector/i })).toBeInTheDocument();
    });

    it('switches between Base64 and JWT Inspector tabs', () => {
      renderWithTheme(<UtilsTab />);

      // Initially on Base64
      expect(screen.getByText('Encoded Base64 Input')).toBeInTheDocument();

      // Switch to JWT Inspector
      const jwtTab = screen.getByRole('tab', { name: /JWT Inspector/i });
      fireEvent.click(jwtTab);

      // Now on JWT Inspector
      expect(screen.getByText('Encoded Token')).toBeInTheDocument();
      expect(screen.getByText('Active Sample')).toBeInTheDocument();
      expect(screen.getByText('Expired Sample')).toBeInTheDocument();
    });
  });
});
