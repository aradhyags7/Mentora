'use client';

import React from 'react';
import { GitBranch, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PathwayNode {
  id: string;
  name: string;
  domain: string;
  completed?: boolean;
  active?: boolean;
}

interface Pathway {
  id: string;
  title: string;
  domain: string;
  nodes: PathwayNode[];
}

interface Props {
  onSelectTopic: (topicPrompt: string) => void;
}

export const KnowledgeTopology: React.FC<Props> = ({ onSelectTopic }) => {
  const pathways: Pathway[] = [
    {
      id: 'opt',
      title: 'Continuous Optimization & Machine Learning',
      domain: 'Mathematics & AI',
      nodes: [
        { id: '1', name: 'Rates of Change', domain: 'Calculus', completed: true },
        { id: '2', name: 'Derivatives & Gradients', domain: 'Calculus', active: true },
        { id: '3', name: 'Gradient Descent', domain: 'Deep Learning' },
        { id: '4', name: 'Loss Landscapes', domain: 'Optimization' },
      ],
    },
    {
      id: 'algo',
      title: 'Memory Topologies & Search Complexity',
      domain: 'Computer Systems',
      nodes: [
        { id: '5', name: 'Contiguous Arrays', domain: 'Data Structures', completed: true },
        { id: '6', name: 'Binary Search Invariants', domain: 'Algorithms', active: true },
        { id: '7', name: 'Virtual Memory Paging', domain: 'Operating Systems' },
        { id: '8', name: 'TLB Cache Hierarchy', domain: 'Hardware' },
      ],
    },
  ];

  return (
    <div className="knowledge-topology-container">
      <div className="topology-header">
        <div className="topology-title-group">
          <GitBranch size={15} className="topology-icon" />
          <h2 className="topology-title">Knowledge Topology & Learning Pathways</h2>
        </div>
        <span className="topology-subtitle">
          Interconnected concept dependencies synthesized in real-time
        </span>
      </div>

      <div className="topology-pathways-list">
        {pathways.map(pathway => (
          <div key={pathway.id} className="topology-pathway-card">
            <div className="pathway-card-meta">
              <span className="pathway-domain">{pathway.domain}</span>
              <h4 className="pathway-name">{pathway.title}</h4>
            </div>

            <div className="pathway-nodes-flow">
              {pathway.nodes.map((node, index) => {
                const isLast = index === pathway.nodes.length - 1;
                return (
                  <React.Fragment key={node.id}>
                    <button
                      type="button"
                      className={`topology-node-pill ${node.active ? 'active' : ''} ${node.completed ? 'completed' : ''}`}
                      onClick={() => onSelectTopic(`Explain ${node.name} in ${node.domain} from first principles with an interactive visualization`)}
                      title={`Learn ${node.name}`}
                    >
                      {node.completed && (
                        <CheckCircle2 size={12} className="node-status-icon check" />
                      )}
                      {node.active && !node.completed && (
                        <span className="node-active-pulse" />
                      )}
                      <span className="node-label">{node.name}</span>
                    </button>
                    {!isLast && (
                      <div className="topology-flow-connector">
                        <ArrowRight size={12} className="flow-arrow" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
