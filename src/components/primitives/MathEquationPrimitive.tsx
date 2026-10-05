'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import { MathEquationPrimitive } from '../../types/kinetic';

interface Props {
  entity: MathEquationPrimitive;
}

export const MathEquationPrimitiveRenderer: React.FC<Props> = ({ entity }) => {
  const { latex, explanation } = entity;

  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return latex;
    }
  }, [latex]);

  return (
    <div className="primitive-equation-box">
      <div
        className="equation-rendered"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {explanation && (
        <div className="equation-explanation">{explanation}</div>
      )}
    </div>
  );
};
