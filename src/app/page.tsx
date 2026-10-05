'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClassroomHeader } from '@/components/ClassroomHeader';
import { BoardView } from '@/components/BoardView';
import { TeacherPresence } from '@/components/TeacherPresence';
import { MultimodalInputDock } from '@/components/MultimodalInputDock';
import { SubjectId, PedagogicalMode, TeacherState, DialogueMessage } from '@/types/classroom';
import { LESSONS } from '@/data/mockLessons';
import confetti from 'canvas-confetti';

export default function VirtualClassroomPage() {
  const [currentSubject, setCurrentSubject] = useState<SubjectId>('calculus');
  const activeLesson = LESSONS[currentSubject];

  const [teacherState, setTeacherState] = useState<TeacherState>('speaking');
  const [pedagogicalMode, setPedagogicalMode] = useState<PedagogicalMode>(activeLesson.initialMode);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isInkMode, setIsInkMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [masteryScore, setMasteryScore] = useState<number>(45);

  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([
    {
      id: 'm1',
      sender: 'teacher',
      text: activeLesson.initialTeacherSpeech,
      timestamp: 'Just now',
      actionTrigger: 'Plot f(x)=x² & Initialize Secant Line'
    }
  ]);

  // Speech Synthesis helper
  const speakText = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setTeacherState('speaking');
    utterance.onend = () => setTeacherState('observing');
    utterance.onerror = () => setTeacherState('observing');

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Trigger speech on initial load or subject change
  useEffect(() => {
    setPedagogicalMode(activeLesson.initialMode);
    setDialogueMessages([
      {
        id: `m_${Date.now()}`,
        sender: 'teacher',
        text: activeLesson.initialTeacherSpeech,
        timestamp: 'Just now',
        actionTrigger: currentSubject === 'calculus' 
          ? 'Plot f(x)=x² & Initialize Secant Line'
          : currentSubject === 'binary_search'
            ? 'Load Array & Index Memory'
            : 'Initialize 3D Vector Space'
      }
    ]);
    speakText(activeLesson.initialTeacherSpeech);
  }, [currentSubject, activeLesson, speakText]);

  // Handle Barge-In / Interruption
  const handleBargeIn = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTeacherState('listening');
    const interruptMsg: DialogueMessage = {
      id: `m_${Date.now()}`,
      sender: 'teacher',
      text: "I stopped speaking. What part is tripping you up? Let's break it down together.",
      timestamp: 'Just now'
    };
    setDialogueMessages(prev => [...prev, interruptMsg]);
  };

  // Process Student Response
  const handleStudentUtterance = (text: string) => {
    const studentMsg: DialogueMessage = {
      id: `s_${Date.now()}`,
      sender: 'student',
      text,
      timestamp: 'Just now'
    };

    setDialogueMessages(prev => [...prev, studentMsg]);
    setTeacherState('evaluating');

    // Pedagogical reasoning response synthesis
    setTimeout(() => {
      let teacherReply = "";
      let newMode: PedagogicalMode = pedagogicalMode;

      if (text.toLowerCase().includes('delta x = 0') || text.toLowerCase().includes("can't we simply set")) {
        teacherReply = "Brilliant question! If you substitute Δx = 0 directly into (f(x+Δx)-f(x))/Δx, you get 0/0, which is undefined. That is why we must take the limit: Δx gets arbitrarily close to 0 without dividing by zero!";
        newMode = 'socratic';
      } else if (text.toLowerCase().includes('visual') || text.toLowerCase().includes('steepen')) {
        teacherReply = "Look at the board right now! Notice how the pink secant line pivots around Point P(1, 1). As Δx shrinks from 1.5 down to 0.01, it snaps directly into the tangent line with slope m = 2.";
        newMode = 'visual';
      } else if (text.toLowerCase().includes('step') || text.toLowerCase().includes('solve') || text.toLowerCase().includes('algebra')) {
        teacherReply = "Let's work through the algebra: (x+Δx)² expands to x² + 2xΔx + (Δx)². When you subtract x², you are left with 2xΔx + (Δx)². Dividing by Δx gives 2x + Δx. As Δx → 0, 2x remains!";
        newMode = 'worked_example';
      } else if (text.toLowerCase().includes('sorted') || text.toLowerCase().includes('binary')) {
        teacherReply = "Because binary search relies on ordering to make decisions! If the middle element is smaller than your target, the sorted invariant guarantees every single element to the left is also smaller. You safely discard half the array in one step!";
        newMode = 'explanation';
      } else if (text.toLowerCase().includes('45') || text.toLowerCase().includes('angle')) {
        teacherReply = "In a vacuum, the range formula is R = (v₀² sin(2θ)) / g. The sine function reaches its maximum value of 1.0 when 2θ = 90°, which means θ = 45° maximizes horizontal distance!";
        newMode = 'demonstration';
      } else {
        teacherReply = `That is an insightful observation on ${activeLesson.title}. Let's test this concept on the interactive board together. Notice how the variables evolve as we push the boundaries!`;
      }

      setPedagogicalMode(newMode);
      setTeacherState('speaking');

      const teacherMsg: DialogueMessage = {
        id: `t_${Date.now()}`,
        sender: 'teacher',
        text: teacherReply,
        timestamp: 'Just now',
        actionTrigger: 'Dynamic Board Update'
      };

      setDialogueMessages(prev => [...prev, teacherMsg]);
      speakText(teacherReply);

      // Increase mastery and celebrate if reaching 80%+
      setMasteryScore(prev => {
        const nextScore = Math.min(100, prev + 15);
        if (nextScore >= 90 && prev < 90) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        return nextScore;
      });
    }, 900);
  };

  // Toggle Voice Input
  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setTeacherState('observing');
    } else {
      setIsRecording(true);
      setTeacherState('listening');
      // Simulate speech detection if no web speech available
      setTimeout(() => {
        setIsRecording(false);
        handleStudentUtterance("Why does the secant slope approach 2 as delta x goes to zero?");
      }, 3000);
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMasteryScore(40);
    setDialogueMessages([
      {
        id: `m_${Date.now()}`,
        sender: 'teacher',
        text: activeLesson.initialTeacherSpeech,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="mentora-app">
      {/* 1. Classroom Top Navigation */}
      <ClassroomHeader
        currentSubject={currentSubject}
        onSelectSubject={setCurrentSubject}
        teacherState={teacherState}
        isMuted={isMuted}
        onToggleMute={() => {
          if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setIsMuted(!isMuted);
        }}
        onResetSession={handleResetSession}
        masteryPercentage={masteryScore}
      />

      {/* 2. Main Stage & Teacher Presence Sidebar */}
      <div className="classroom-body">
        <BoardView
          currentSubject={currentSubject}
          lesson={activeLesson}
          isInkMode={isInkMode}
          onStudentWorkEvaluated={(isCorrect, feedback) => {
            const evalMsg: DialogueMessage = {
              id: `eval_${Date.now()}`,
              sender: 'teacher',
              text: `I inspected your handwritten step on the canvas: ${feedback}`,
              timestamp: 'Just now'
            };
            setDialogueMessages(prev => [...prev, evalMsg]);
            speakText(`I inspected your handwritten step: ${feedback}`);
            setMasteryScore(prev => Math.min(100, prev + 20));
          }}
        />

        <TeacherPresence
          teacherState={teacherState}
          currentMode={pedagogicalMode}
          onChangeMode={setPedagogicalMode}
          concepts={activeLesson.concepts}
          messages={dialogueMessages}
          onTriggerAction={(action) => {
            handleStudentUtterance(`Can you demonstrate action: ${action}?`);
          }}
        />
      </div>

      {/* 3. Bottom Multimodal Input Dock */}
      <MultimodalInputDock
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        isInkMode={isInkMode}
        onToggleInkMode={() => setIsInkMode(!isInkMode)}
        socraticSuggestions={activeLesson.socraticSuggestions}
        onSelectSuggestion={handleStudentUtterance}
        onSubmitText={handleStudentUtterance}
        onBargeIn={handleBargeIn}
        teacherIsSpeaking={teacherState === 'speaking'}
      />
    </div>
  );
}
