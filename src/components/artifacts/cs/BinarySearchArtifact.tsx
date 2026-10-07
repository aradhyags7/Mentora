'use client';

import React, { useState } from 'react';
import { InteractiveArtifactProps } from '../../../types/lessonSurface';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export const BinarySearchArtifact: React.FC<InteractiveArtifactProps> = ({
  onInteraction,
}) => {
  const initialArray = [2, 5, 8, 12, 16, 23, 38, 56, 72];
  const target = 23;

  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(initialArray.length - 1);
  const [comparisons, setComparisons] = useState(1);
  const [isFound, setIsFound] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const mid = Math.floor((low + high) / 2);
  const midVal = initialArray[mid];

  const handleChooseLeft = () => {
    // Left half: target < midVal. But target is 23, midVal is 16!
    setLastAction('choose_left');
    setComparisons(prev => prev + 1);
    // Student eliminated right half
    setHigh(mid - 1);

    if (onInteraction) {
      onInteraction({
        type: 'student.interaction',
        artifact: 'cs.binary_search',
        action: 'choose_left',
        value: { target, midVal, correctChoice: false },
      });
    }
  };

  const handleChooseRight = () => {
    // Right half: target > midVal (23 > 16) -> CORRECT!
    setLastAction('choose_right');
    setComparisons(prev => prev + 1);
    const newLow = mid + 1;
    setLow(newLow);

    const newMid = Math.floor((newLow + high) / 2);
    if (initialArray[newMid] === target) {
      setIsFound(true);
    }

    if (onInteraction) {
      onInteraction({
        type: 'student.interaction',
        artifact: 'cs.binary_search',
        action: 'choose_right',
        value: { target, midVal, correctChoice: true },
      });
    }
  };

  const handleReset = () => {
    setLow(0);
    setHigh(initialArray.length - 1);
    setComparisons(1);
    setIsFound(false);
    setLastAction(null);

    if (onInteraction) {
      onInteraction({
        type: 'student.interaction',
        artifact: 'cs.binary_search',
        action: 'reset',
      });
    }
  };

  return (
    <div className="binary-search-artifact-root" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Info */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Target Value: </span>
          <span style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {target}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Comparisons: </span>
            <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{comparisons}</span>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Mid Value: </span>
            <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-amber)' }}>{midVal}</span>
          </div>
        </div>
      </div>

      {/* Array Elements Canvas */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '28px 16px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Array Cells */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {initialArray.map((val, idx) => {
            const isEliminated = idx < low || idx > high;
            const isMid = idx === mid && !isEliminated;
            const isTargetMatch = val === target && (isFound || idx === mid);

            let bg = 'var(--bg-card)';
            let borderColor = 'var(--border-default)';
            let textColor = 'var(--text-primary)';
            let opacity = 1.0;

            if (isEliminated) {
              opacity = 0.25;
              borderColor = 'var(--border-subtle)';
            } else if (isTargetMatch && isFound) {
              bg = 'var(--success-bg)';
              borderColor = 'var(--accent-primary)';
              textColor = 'var(--accent-primary)';
            } else if (isMid) {
              borderColor = 'var(--accent-amber)';
              bg = 'rgba(217, 119, 6, 0.08)';
            }

            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  opacity,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-xs)',
                    background: bg,
                    border: `2px solid ${borderColor}`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 15,
                    fontWeight: isMid || isTargetMatch ? 700 : 500,
                    color: textColor,
                    boxShadow: isMid ? '0 0 10px rgba(217,119,6,0.2)' : 'none',
                  }}
                >
                  {val}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  [{idx}]
                </div>
                {isMid && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-amber)' }}>
                    MID
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status prompt */}
        {isFound ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)', fontWeight: 600, fontSize: 14 }}>
            <CheckCircle2 size={16} />
            <span>Target 23 identified in {comparisons} comparison(s)!</span>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Comparing mid element <strong>{midVal}</strong> with target <strong>{target}</strong>: since <strong>{target} &gt; {midVal}</strong>, which half should we keep?
          </div>
        )}
      </div>

      {/* Decision Buttons (Student performs the algorithm) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-card)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
        }}
      >
        <button
          type="button"
          disabled={isFound || low > high}
          onClick={handleChooseLeft}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 500,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            cursor: isFound ? 'default' : 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          <span>Keep Left Half</span>
        </button>

        <button
          type="button"
          disabled={isFound || low > high}
          onClick={handleChooseRight}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 500,
            background: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            cursor: isFound ? 'default' : 'pointer',
          }}
        >
          <span>Keep Right Half</span>
          <ArrowRight size={14} />
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 500,
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <RotateCcw size={14} />
          <span>Reset Array</span>
        </button>
      </div>
    </div>
  );
};
