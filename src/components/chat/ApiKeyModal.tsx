'use client';

import React, { useState } from 'react';
import { Key, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { AiProvider } from '../../types/ai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeProvider: AiProvider;
  geminiKey: string;
  openaiKey: string;
  onSaveKeys: (provider: AiProvider, geminiKey: string, openaiKey: string) => void;
}

export const ApiKeyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeProvider,
  geminiKey,
  openaiKey,
  onSaveKeys,
}) => {
  const [provider, setProvider] = useState<AiProvider>(activeProvider);
  const [gKey, setGKey] = useState(geminiKey);
  const [oKey, setOKey] = useState(openaiKey);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKeys(provider, gKey, oKey);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 460,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
                AI Model & API Key
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
                Per-request security: keys are never saved to disk.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 18,
          fontSize: 12,
          color: '#475569',
        }}>
          <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Keys are transmitted via encrypted per-request headers directly to your chosen AI provider and discarded.
          </span>
        </div>

        {/* Provider Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
            Active Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => setProvider('gemini')}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: provider === 'gemini' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                background: provider === 'gemini' ? '#EFF6FF' : '#FFFFFF',
                color: provider === 'gemini' ? '#1D4ED8' : '#475569',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Google Gemini
            </button>
            <button
              type="button"
              onClick={() => setProvider('openai')}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: provider === 'openai' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                background: provider === 'openai' ? '#EFF6FF' : '#FFFFFF',
                color: provider === 'openai' ? '#1D4ED8' : '#475569',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              OpenAI
            </button>
          </div>
        </div>

        {/* Key Inputs */}
        {provider === 'gemini' ? (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={gKey}
              onChange={e => setGKey(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'block' }}>
              Free tier keys work smoothly with gemini-1.5-flash.
            </span>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              OpenAI API Key
            </label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={oKey}
              onChange={e => setOKey(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'block' }}>
              Uses gpt-4o-mini structured JSON outputs.
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#2563EB',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {savedNotice ? <Check size={16} /> : null}
            {savedNotice ? 'Saved' : 'Apply Key'}
          </button>
        </div>
      </div>
    </div>
  );
};
