'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, Cpu, Database, HardDrive } from 'lucide-react';

interface CpuArchitectureVisualizerProps {
  initialInstruction?: string;
}

type Stage = 'idle' | 'fetch' | 'decode' | 'execute' | 'writeback';

export const CpuArchitectureVisualizer: React.FC<CpuArchitectureVisualizerProps> = ({
  initialInstruction = 'ADD R1, R2'
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [pc, setPc] = useState<number>(0);
  const [instructionRegister, setInstructionRegister] = useState<string>('---');
  const [r1, setR1] = useState<number>(5);
  const [r2, setR2] = useState<number>(3);
  const [aluResult, setAluResult] = useState<number | null>(null);
  const [logText, setLogText] = useState<string>('Ready to fetch instruction from RAM address 0x00.');

  const ramInstructions = [
    { address: '0x00', code: 'LOAD R1, 5' },
    { address: '0x01', code: 'LOAD R2, 3' },
    { address: '0x02', code: 'ADD R1, R2' },
    { address: '0x03', code: 'STORE R1, [0x10]' }
  ];

  const resetCycle = () => {
    setStage('idle');
    setIsPlaying(false);
    setPc(2);
    setInstructionRegister('---');
    setR1(5);
    setR2(3);
    setAluResult(null);
    setLogText('Instruction cycle reset. Program Counter points to 0x02: ADD R1, R2');
  };

  const stepClock = () => {
    if (stage === 'idle') {
      // Step 1: FETCH
      setStage('fetch');
      setInstructionRegister('ADD R1, R2');
      setLogText('1. FETCH: Instruction "ADD R1, R2" read from RAM into Instruction Register (IR). PC increments.');
    } else if (stage === 'fetch') {
      // Step 2: DECODE
      setStage('decode');
      setLogText('2. DECODE: Control Unit decodes opcode ADD. Reads operand registers R1 (= 5) and R2 (= 3).');
    } else if (stage === 'decode') {
      // Step 3: EXECUTE
      setStage('execute');
      const sum = r1 + r2;
      setAluResult(sum);
      setLogText(`3. EXECUTE: Arithmetic Logic Unit (ALU) computes 5 + 3 = ${sum}.`);
    } else if (stage === 'execute') {
      // Step 4: WRITEBACK
      setStage('writeback');
      if (aluResult !== null) setR1(aluResult);
      setLogText(`4. WRITEBACK: Result ${aluResult} written back into Register R1.`);
    } else {
      // Completed, return to idle
      setStage('idle');
      setLogText('Instruction execution cycle complete! Next clock cycle ready.');
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      stepClock();
      if (stage === 'writeback') setIsPlaying(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [isPlaying, stage, r1, r2, aluResult]);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '14px',
      padding: '20px',
      margin: '14px 0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '10px',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>
            CPU Instruction Execution Pipeline
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 500,
            background: '#EFF6FF',
            color: '#2563EB',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Von Neumann Architecture
          </span>
        </div>

        <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
          Cycle Stage: <strong style={{ color: '#2563EB', textTransform: 'uppercase' }}>{stage}</strong>
        </div>
      </div>

      {/* Block Diagram: RAM -> CPU Bus -> ALU & Registers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr 140px',
        gap: '16px',
        alignItems: 'center',
        background: '#FAFAFA',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #F1F5F9',
        position: 'relative'
      }}>
        {/* RAM Block */}
        <div style={{
          background: '#FFFFFF',
          border: stage === 'fetch' ? '2px solid #2563EB' : '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.25s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            <HardDrive size={14} color="#4B5563" />
            <span>RAM</span>
          </div>
          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ramInstructions.map((inst, i) => (
              <div
                key={inst.address}
                style={{
                  padding: '2px 4px',
                  borderRadius: '3px',
                  background: i === 2 && stage === 'fetch' ? '#EFF6FF' : 'transparent',
                  color: i === 2 && stage === 'fetch' ? '#2563EB' : '#4B5563',
                  fontWeight: i === 2 ? 600 : 400
                }}
              >
                {inst.address}: {inst.code}
              </div>
            ))}
          </div>
        </div>

        {/* Central CPU Core & ALU */}
        <div style={{
          background: '#FFFFFF',
          border: stage === 'decode' || stage === 'execute' ? '2px solid #2563EB' : '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#111827' }}>
            <Cpu size={15} color="#2563EB" />
            <span>CPU Control Unit</span>
          </div>

          <div style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            background: '#F9FAFB',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #E5E7EB',
            width: '100%',
            textAlign: 'center'
          }}>
            Instruction Register: <strong style={{ color: '#2563EB' }}>{instructionRegister}</strong>
          </div>

          {/* ALU Block */}
          <div style={{
            width: '100%',
            background: stage === 'execute' ? '#FEF3C7' : '#F9FAFB',
            border: stage === 'execute' ? '2px solid #D97706' : '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '8px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309' }}>ALU (Arithmetic Logic Unit)</span>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginTop: '2px', color: '#1F2937' }}>
              {stage === 'execute' || stage === 'writeback' ? `5 + 3 = ${aluResult}` : 'idle'}
            </div>
          </div>
        </div>

        {/* Registers Block */}
        <div style={{
          background: '#FFFFFF',
          border: stage === 'writeback' ? '2px solid #16A34A' : '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.25s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            <Database size={14} color="#4B5563" />
            <span>Registers</span>
          </div>
          <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '3px 6px',
              borderRadius: '4px',
              background: stage === 'writeback' ? '#DCFCE7' : '#F9FAFB'
            }}>
              <span>R1:</span>
              <strong style={{ color: stage === 'writeback' ? '#16A34A' : '#111827' }}>{r1}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderRadius: '4px', background: '#F9FAFB' }}>
              <span>R2:</span>
              <strong>{r2}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderRadius: '4px', background: '#F9FAFB' }}>
              <span>PC:</span>
              <strong>0x02</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Explanation */}
      <div style={{
        marginTop: '14px',
        padding: '10px 14px',
        background: '#F9FAFB',
        borderRadius: '8px',
        fontSize: '0.78rem',
        color: '#374151',
        lineHeight: 1.5
      }}>
        {logText}
      </div>

      {/* Execution Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '14px',
        paddingTop: '10px',
        borderTop: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#1F2937',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Auto Clock'}</span>
          </button>

          <button
            onClick={stepClock}
            disabled={isPlaying}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>Step Clock</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={resetCycle}
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

        <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
          Next: {stage === 'writeback' ? 'Cycle done' : stage === 'execute' ? 'Writeback to R1' : stage === 'decode' ? 'ALU execution' : 'Fetch instruction'}
        </div>
      </div>
    </div>
  );
};
