'use client';

import React from 'react';
import { KineticTimeline } from '../../types/kinetic';
import { KineticPlayer } from '../player/KineticPlayer';
import { Sparkles, User, AlertCircle } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timeline?: KineticTimeline;
  error?: string;
}

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatContainer: React.FC<Props> = ({ messages, isLoading }) => {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 920,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            {/* Header info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 600,
              color: '#64748B',
            }}>
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <User size={13} color="#475569" />
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={13} color="#2563EB" />
                  </div>
                  <span style={{ color: '#1E293B' }}>Mentora</span>
                </>
              )}
            </div>

            {/* Bubble Content */}
            {msg.role === 'user' ? (
              <div style={{
                background: '#F1F5F9',
                color: '#0F172A',
                padding: '10px 16px',
                borderRadius: '16px 16px 4px 16px',
                fontSize: 14.5,
                lineHeight: 1.5,
                maxWidth: '75%',
              }}>
                {msg.content}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                width: '100%',
              }}>
                {msg.content && (
                  <div style={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: '#1E293B',
                  }}>
                    {msg.content}
                  </div>
                )}

                {/* Error Banner */}
                {msg.error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#DC2626',
                  }}>
                    <AlertCircle size={16} />
                    <span>{msg.error}</span>
                  </div>
                )}

                {/* Inline Kinetic Player */}
                {msg.timeline && (
                  <div style={{ width: '100%', marginTop: 4 }}>
                    <KineticPlayer timeline={msg.timeline} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#64748B',
            fontSize: 13.5,
          }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={13} color="#2563EB" />
            </div>
            <span>Synthesizing visual scene graph and compiling cues...</span>
          </div>
        )}
      </div>
    </div>
  );
};
