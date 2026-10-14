'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { TutorRuntimeState } from '../../types/kinetic';

export interface UseVoiceBargeInProps {
  enabled: boolean;
  tutorState: TutorRuntimeState;
  onBargeInTriggered: (initialDetectedPhrase: string) => void;
  onDoubtTranscriptChange: (liveTranscript: string) => void;
  onDoubtFinalized: (finalDoubtText: string) => void;
}

const BARGE_IN_TRIGGER_PHRASES = [
  'stop',
  'wait',
  'hold on',
  'one minute',
  'one second',
  'pause',
  'i have a doubt',
  'doubt',
  'excuse me',
  'wait a second',
  'can you explain',
  'why did you',
  'how does',
];

/**
 * Strips common conversational wake/interrupt prefixes from the student's speech
 */
export function stripBargeInPrefix(text: string): string {
  let cleaned = text.trim();
  const prefixes = [
    /^(wait\s*,?\s*i\s*have\s*a\s*doubt\s*,?\s*)/i,
    /^(i\s*have\s*a\s*doubt\s*,?\s*)/i,
    /^(one\s*minute\s*(please)?\s*,?\s*)/i,
    /^(one\s*second\s*(please)?\s*,?\s*)/i,
    /^(wait\s*a\s*second\s*,?\s*)/i,
    /^(wait\s*,?\s*)/i,
    /^(stop\s*,?\s*)/i,
    /^(hold\s*on\s*,?\s*)/i,
    /^(pause\s*,?\s*)/i,
    /^(excuse\s*me\s*,?\s*)/i,
  ];

  for (const regex of prefixes) {
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, '').trim();
      break;
    }
  }

  return cleaned;
}

export function useVoiceBargeIn({
  enabled,
  tutorState,
  onBargeInTriggered,
  onDoubtTranscriptChange,
  onDoubtFinalized,
}: UseVoiceBargeInProps) {
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string>('');
  const hasTriggeredBargeInRef = useRef<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const handleFinalize = useCallback(() => {
    clearSilenceTimer();
    const finalClean = stripBargeInPrefix(currentTranscriptRef.current);
    if (finalClean.trim().length > 0) {
      onDoubtFinalized(finalClean.trim());
      currentTranscriptRef.current = '';
    }
  }, [onDoubtFinalized]);

  useEffect(() => {
    if (!enabled || !isSupported || typeof window === 'undefined') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: any;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      return;
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled and in speaking/listening state
      if (
        enabled &&
        (tutorState === 'SPEAKING_AND_DRAWING' || tutorState === 'LISTENING_VOICE_DOUBT')
      ) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore routine 'no-speech' or 'aborted' events
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('SpeechRecognition error:', event.error);
      }
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      const combinedRaw = (final || interim || '').trim();
      const combinedLower = combinedRaw.toLowerCase();

      // State 1: In normal teaching playback -> Watch for barge-in triggers
      if (tutorState === 'SPEAKING_AND_DRAWING' && !hasTriggeredBargeInRef.current) {
        for (const trigger of BARGE_IN_TRIGGER_PHRASES) {
          if (combinedLower.includes(trigger)) {
            hasTriggeredBargeInRef.current = true;
            onBargeInTriggered(trigger);

            const questionRemainder = stripBargeInPrefix(combinedRaw);
            currentTranscriptRef.current = questionRemainder;
            onDoubtTranscriptChange(questionRemainder);
            break;
          }
        }
      }

      // State 2: While student is speaking their doubt -> capture live transcript and reset silence timer
      if (tutorState === 'LISTENING_VOICE_DOUBT' || hasTriggeredBargeInRef.current) {
        const cleanQuestion = stripBargeInPrefix(combinedRaw);
        if (cleanQuestion) {
          currentTranscriptRef.current = cleanQuestion;
          onDoubtTranscriptChange(cleanQuestion);

          // Reset 1.8-second auto-submit silence timer
          clearSilenceTimer();
          silenceTimerRef.current = setTimeout(() => {
            handleFinalize();
          }, 1800);
        }
      }
    };

    try {
      recognition.start();
    } catch {}

    return () => {
      clearSilenceTimer();
      if (recognition) {
        try {
          recognition.abort();
        } catch {}
      }
    };
  }, [
    enabled,
    isSupported,
    tutorState,
    onBargeInTriggered,
    onDoubtTranscriptChange,
    handleFinalize,
  ]);

  // Reset trigger state when tutor goes back to speaking
  useEffect(() => {
    if (tutorState === 'SPEAKING_AND_DRAWING') {
      hasTriggeredBargeInRef.current = false;
      currentTranscriptRef.current = '';
    }
  }, [tutorState]);

  return {
    isSupported,
    isListening,
  };
}
