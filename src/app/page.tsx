'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TeachingArtifactSpec } from '@/types/artifacts';
import { ArtifactRenderer } from '@/components/artifacts/ArtifactRenderer';
import { 
  Plus, 
  ArrowUp, 
  Mic, 
  MicOff, 
  Headphones, 
  VolumeX, 
  Sparkles,
  RotateCcw,
  Binary,
  Cpu,
  Sigma,
  Compass
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    icon: Binary,
    title: "Binary search & O(log n)",
    desc: "Understand search space halving visually",
    query: "Teach me binary search and explain why it's O(log n)"
  },
  {
    icon: Cpu,
    title: "CPU instruction cycle",
    desc: "Watch how instructions move through RAM and ALU",
    query: "Explain how a CPU executes an instruction"
  },
  {
    icon: Sigma,
    title: "The derivative as a limit",
    desc: "See the secant line transform into the tangent slope",
    query: "Why does the derivative represent the tangent slope?"
  },
  {
    icon: Compass,
    title: "2D projectile trajectory",
    desc: "Observe how launch angle dictates flight distance",
    query: "Show me projectile motion and how angle affects distance"
  }
];

export default function MentoraConversationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')));
    if (naturalVoice) utterance.voice = naturalVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Dynamic Artifact Synthesis
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      let replyText = "";
      let artifactSpec: TeachingArtifactSpec | undefined = undefined;

      if (lower.includes('binary') || lower.includes('log n') || lower.includes('search')) {
        replyText = "Absolutely. Let's understand why binary search is O(log n) instead of memorizing it. Because the array is already sorted, inspecting the middle element guarantees that if the target isn't there, we can discard roughly half of the entire remaining array in a single comparison.";
        artifactSpec = {
          id: `art_bs_${Date.now()}`,
          type: 'interactive_visualization',
          domain: 'computer_science',
          topic: 'binary_search',
          title: 'Binary Search Space Halving',
          component: 'binary_search',
          props: {
            initialArray: [2, 5, 8, 12, 16, 23, 38, 45, 56, 63, 72, 81, 89, 94, 99, 105],
            initialTarget: 72
          }
        };
      } else if (lower.includes('cpu') || lower.includes('instruction') || lower.includes('alu') || lower.includes('ram')) {
        replyText = "Great topic. A CPU doesn't do magic; it performs a steady, mechanical cycle: Fetch from RAM, Decode the opcode, Execute through the ALU, and Write back to registers. Watch the instruction move through each stage in the pipeline below:";
        artifactSpec = {
          id: `art_cpu_${Date.now()}`,
          type: 'simulation',
          domain: 'engineering',
          topic: 'cpu_architecture',
          title: 'Von Neumann Instruction Cycle',
          component: 'cpu_pipeline',
          props: {
            initialInstruction: 'ADD R1, R2'
          }
        };
      } else if (lower.includes('derivative') || lower.includes('tangent') || lower.includes('slope') || lower.includes('calculus')) {
        replyText = "Let's explore why the derivative represents the instantaneous slope. If you choose two points P and Q on f(x) = x², the line connecting them is a secant line with slope Δy / Δx. When you slide Δx down toward zero, point Q moves onto point P, turning the secant line into the exact tangent line.";
        artifactSpec = {
          id: `art_deriv_${Date.now()}`,
          type: 'interactive_visualization',
          domain: 'mathematics',
          topic: 'derivative_limit',
          title: 'Instantaneous Tangent Derivation: f(x) = x²',
          component: 'derivative_graph',
          props: {
            initialDeltaX: 1.2
          }
        };
      } else if (lower.includes('projectile') || lower.includes('angle') || lower.includes('trajectory') || lower.includes('physics')) {
        replyText = "In projectile kinematics, horizontal velocity remains constant in a vacuum, while gravity pulls downward at 9.8 m/s². The total horizontal travel peaks when the product of horizontal and vertical velocities is maximized, which occurs precisely at θ = 45°. Test different launch angles below:";
        artifactSpec = {
          id: `art_proj_${Date.now()}`,
          type: 'simulation',
          domain: 'physics',
          topic: 'projectile_kinematics',
          title: '2D Kinematics Trajectory Simulation',
          component: 'projectile_kinematics',
          props: {
            initialAngle: 45,
            initialVelocity: 24
          }
        };
      } else {
        replyText = `That is an interesting topic. Let's analyze ${promptText} together and construct an intuitive mental model. What part would you like to explore first?`;
      }

      const assistantMessage: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Just now',
        artifact: artifactSpec
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(replyText);
    }, 600);
  };

  const handleNewChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSendPrompt("Teach me binary search and explain why it's O(log n)");
      }, 3000);
    }
  };

  return (
    <div className="mentora-app">
      {/* 1. Left Sidebar (ChatGPT / Claude style) */}
      <aside className="mentora-sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#111827',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={14} />
            </div>
            <span className="sidebar-brand">Mentora</span>
          </div>
        </div>

        <button className="sidebar-new-btn" onClick={handleNewChat}>
          <span>New chat</span>
          <Plus size={15} />
        </button>

        <div className="sidebar-history-list">
          <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
            Recent Sessions
          </div>
          <button 
            className="sidebar-item active"
            onClick={() => handleSendPrompt("Teach me binary search and explain why it's O(log n)")}
          >
            Binary search & O(log n)
          </button>
          <button 
            className="sidebar-item"
            onClick={() => handleSendPrompt("Explain how a CPU executes an instruction")}
          >
            CPU instruction pipeline
          </button>
          <button 
            className="sidebar-item"
            onClick={() => handleSendPrompt("Why does the derivative represent the tangent slope?")}
          >
            Calculus: Tangent limit
          </button>
          <button 
            className="sidebar-item"
            onClick={() => handleSendPrompt("Show me projectile motion and how angle affects distance")}
          >
            Projectile motion kinematics
          </button>
        </div>

        <div className="sidebar-footer">
          <span>Mentora AI</span>
        </div>
      </aside>

      {/* 2. Main Conversational Column */}
      <main className="mentora-chat-main">
        {/* Topbar */}
        <header className="chat-topbar">
          <div className="topbar-brand-title">
            Mentora
          </div>

          <div className="topbar-actions">
            <button 
              className="topbar-action-icon"
              onClick={() => {
                if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Turn on voice" : "Turn off voice"}
              style={{ color: isMuted ? '#9CA3AF' : '#2563EB' }}
            >
              {isMuted ? <VolumeX size={15} /> : <Headphones size={15} />}
            </button>

            <button 
              className="topbar-action-icon"
              onClick={handleNewChat}
              title="Reset conversation"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </header>

        {/* Scrollable Conversation Stream */}
        <div className="chat-scroll-area">
          <div className="chat-inner-container">
            {/* If no messages, render Clean Welcome / Starter Screen */}
            {messages.length === 0 ? (
              <div className="welcome-hero">
                <h1 className="welcome-title">What would you like to understand today?</h1>
                <p className="welcome-subtitle">
                  Mentora doesn't just answer with text. It materializes interactive models, simulations, and visualizations inside the conversation.
                </p>

                <div className="starter-cards-grid">
                  {STARTER_PROMPTS.map((card, idx) => {
                    const IconComp = card.icon;
                    return (
                      <div
                        key={idx}
                        className="starter-card"
                        onClick={() => handleSendPrompt(card.query)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <IconComp size={16} color="#2563EB" />
                          <span className="starter-card-title">{card.title}</span>
                        </div>
                        <span className="starter-card-desc">{card.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message Thread with Embedded Interactive Artifacts */
              messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender === 'user' ? 'user' : 'assistant'}`}>
                  <div className={`message-avatar ${msg.sender === 'user' ? 'user' : 'teacher'}`}>
                    {msg.sender === 'user' ? 'Y' : 'M'}
                  </div>

                  <div className="message-body">
                    <span className="message-sender-name">
                      {msg.sender === 'user' ? 'You' : 'Mentora'}
                    </span>
                    <div className="message-text">
                      {msg.text}
                    </div>

                    {/* DYNAMIC ARTIFACT MATERIALIZES INLINE */}
                    {msg.artifact && (
                      <ArtifactRenderer artifact={msg.artifact} />
                    )}

                    {/* Socratic follow-up observation if artifact is present */}
                    {msg.artifact?.component === 'binary_search' && (
                      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.55, marginTop: '4px' }}>
                        Notice something? Each step removes roughly half the remaining search space. For 16 items, it takes at most 4 comparisons ($\log_2 16 = 4$).
                      </div>
                    )}
                    {msg.artifact?.component === 'cpu_pipeline' && (
                      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.55, marginTop: '4px' }}>
                        Notice how the ALU only computes once the Control Unit decodes the instruction and feeds the operands from the registers.
                      </div>
                    )}
                    {msg.artifact?.component === 'derivative_graph' && (
                      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.55, marginTop: '4px' }}>
                        Notice that as $\Delta x$ reaches 0, the secant line steepens into the exact tangent line at $x=1$, yielding a slope of 2.
                      </div>
                    )}
                    {msg.artifact?.component === 'projectile_kinematics' && (
                      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.55, marginTop: '4px' }}>
                        Notice that $45^\circ$ maximizes horizontal range because it balances flight duration with horizontal speed.
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Bottom Input Capsule (ChatGPT / Claude style) */}
        <div className="input-dock-container">
          <div className="input-dock-inner">
            <div className="floating-input-capsule">
              <input
                type="text"
                placeholder={isRecording ? "Listening to your question..." : "Ask anything... (e.g. 'Teach me binary search', 'Explain CPU pipeline')"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendPrompt(inputText);
                }}
              />

              <div className="input-buttons-group">
                <button
                  className={`capsule-icon-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  title="Voice input"
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <button
                  className="capsule-send-btn"
                  onClick={() => handleSendPrompt(inputText)}
                  disabled={!inputText.trim()}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
