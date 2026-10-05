'use client';

import React, { useState } from 'react';
import { ArrowUp, Key, Sparkles, Loader2 } from 'lucide-react';
import { AiProvider } from '../../types/ai';

interface Props {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  activeProvider: AiProvider;
  hasKeyConfigured: boolean;
}

export const InputCapsule: React.FC<Props> = ({
  onSendMessage,
  isLoading,
  onOpenSettings,
  activeProvider,
  hasKeyConfigured,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 820,
      margin: '0 auto',
      padding: '0 16px 20px 16px',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: 24,
          padding: '8px 12px 8px 18px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* Settings / API Key Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title={hasKeyConfigured ? `Using ${activeProvider} key` : 'Configure API Key'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            border: 'none',
            background: hasKeyConfigured ? '#ECFDF5' : '#F1F5F9',
            color: hasKeyConfigured ? '#059669' : '#64748B',
            padding: '5px 10px',
            borderRadius: 16,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Key size={13} />
          <span>{hasKeyConfigured ? activeProvider : 'Add Key'}</span>
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Mentora to explain any concept visually (e.g. Binary Search, Neural Networks, Derivatives)..."
          disabled={isLoading}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 14.5,
            color: '#0F172A',
            background: 'transparent',
          }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: input.trim() && !isLoading ? '#2563EB' : '#E2E8F0',
            color: input.trim() && !isLoading ? '#FFFFFF' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !isLoading ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
          }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowUp size={18} strokeWidth={2.5} />
          )}
        </button>
      </form>
    </div>
  );
};
