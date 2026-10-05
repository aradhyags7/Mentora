'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle2, Search } from 'lucide-react';

interface BinarySearchVisualizerProps {
  initialArray?: number[];
  initialTarget?: number;
}

const DEFAULT_ARRAY = [2, 5, 8, 12, 16, 23, 38, 45, 56, 63, 72, 81, 89, 94, 99, 105];

export const BinarySearchVisualizer: React.FC<BinarySearchVisualizerProps> = ({
  initialArray = DEFAULT_ARRAY,
  initialTarget = 72
}) => {
  const [target, setTarget] = useState<number>(initialTarget);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(initialArray.length - 1);
  const [mid, setMid] = useState<number>(Math.floor((0 + initialArray.length - 1) / 2));
  const [stepCount, setStepCount] = useState<number>(0);
  const [status, setStatus] = useState<'searching' | 'found' | 'not_found'>('searching');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [historyNotes, setHistoryNotes] = useState<string[]>([]);

  const resetSearch = (newTarget = target) => {
    setLeft(0);
    const r = initialArray.length - 1;
    setRight(r);
    setMid(Math.floor((0 + r) / 2));
    setStepCount(0);
    setStatus('searching');
    setIsPlaying(false);
    setHistoryNotes([`Initial search space: ${initialArray.length} elements. Target: ${newTarget}`]);
  };

  const stepForward = () => {
    if (status !== 'searching') return;

    const currentMid = Math.floor((left + right) / 2);
    setMid(currentMid);
    const currentVal = initialArray[currentMid];
    const nextStep = stepCount + 1;
    setStepCount(nextStep);

    if (currentVal === target) {
      setStatus('found');
      setIsPlaying(false);
      setHistoryNotes(prev => [
        ...prev,
        `Step ${nextStep}: Inspected index [${currentMid}] = ${currentVal}. Match found in ${nextStep} comparisons!`
      ]);
      return;
    }

    if (left >= right) {
      setStatus('not_found');
      setIsPlaying(false);
      setHistoryNotes(prev => [
        ...prev,
        `Step ${nextStep}: Target ${target} not present in array.`
      ]);
      return;
    }

    if (currentVal < target) {
      const newLeft = currentMid + 1;
      setLeft(newLeft);
      setMid(Math.floor((newLeft + right) / 2));
      const remaining = right - newLeft + 1;
      setHistoryNotes(prev => [
        ...prev,
        `Step ${nextStep}: ${currentVal} < ${target}. Discarded left half [${left}..${currentMid}]. Remaining: ${remaining} elements.`
      ]);
    } else {
      const newRight = currentMid - 1;
      setRight(newRight);
      setMid(Math.floor((left + newRight) / 2));
      const remaining = newRight - left + 1;
      setHistoryNotes(prev => [
        ...prev,
        `Step ${nextStep}: ${currentVal} > ${target}. Discarded right half [${currentMid}..${right}]. Remaining: ${remaining} elements.`
      ]);
    }
  };

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying || status !== 'searching') return;
    const timer = setTimeout(() => {
      stepForward();
    }, 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, left, right, status, target]);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '14px',
      padding: '20px',
      margin: '14px 0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Top Header of Artifact */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>
            Binary Search Visualization
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 500,
            background: '#EFF6FF',
            color: '#2563EB',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            O(log n)
          </span>
        </div>

        {/* Target Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>Target:</span>
          <select
            value={target}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTarget(val);
              resetSearch(val);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            {initialArray.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 16 Element Visual Array Blocks */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '5px',
          overflowX: 'auto',
          paddingBottom: '8px',
          justifyContent: 'center'
        }}>
          {initialArray.map((val, idx) => {
            const isMid = idx === mid && status === 'searching';
            const isFound = idx === mid && status === 'found';
            const isEliminated = idx < left || idx > right;
            const isInWindow = idx >= left && idx <= right;

            return (
              <div
                key={idx}
                style={{
                  width: '42px',
                  height: '52px',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isFound 
                    ? '#DCFCE7' 
                    : isMid 
                      ? '#EFF6FF' 
                      : isEliminated 
                        ? '#F9FAFB' 
                        : '#FFFFFF',
                  border: isFound 
                    ? '2px solid #16A34A' 
                    : isMid 
                      ? '2px solid #2563EB' 
                      : isInWindow 
                        ? '1px solid #CBD5E1' 
                        : '1px solid #E5E7EB',
                  opacity: isEliminated ? 0.35 : 1,
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.62rem', color: isMid ? '#2563EB' : '#9CA3AF' }}>
                  {idx}
                </span>
                <span style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isFound ? '#15803D' : isMid ? '#1D4ED8' : '#1F2937'
                }}>
                  {val}
                </span>

                {/* Pointer indicator */}
                {isMid && status === 'searching' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-16px',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: '#2563EB'
                  }}>
                    ↑ mid
                  </div>
                )}
                {isFound && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-16px',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: '#16A34A'
                  }}>
                    ✓ found
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Bar & Complexity Note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        paddingTop: '12px',
        borderTop: '1px solid #F3F4F6'
      }}>
        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={status !== 'searching'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#1F2937',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: status === 'searching' ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: status === 'searching' ? 1 : 0.5
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={stepForward}
            disabled={status !== 'searching' || isPlaying}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: status === 'searching' && !isPlaying ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>Step Forward</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={() => resetSearch(target)}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              background: '#FFFFFF',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              cursor: 'pointer'
            }}
            title="Reset"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Live Mathematical Complexity Readout */}
        <div style={{ fontSize: '0.76rem', color: '#4B5563' }}>
          Steps taken: <strong style={{ color: '#111827' }}>{stepCount}</strong> | 
          Max steps: <strong style={{ color: '#2563EB' }}>4</strong> (log₂ 16)
        </div>
      </div>

      {/* Step Log Summary */}
      {historyNotes.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#4B5563',
          lineHeight: 1.45
        }}>
          {historyNotes[historyNotes.length - 1]}
        </div>
      )}
    </div>
  );
};
