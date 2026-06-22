import React from 'react';

interface ChatPromptsProps {
  onPrompt: (text: string) => void;
}

const prompts = [
  'Why is this threat dangerous?',
  'How can I stop it?',
  'What does this alert mean?',
];

export function ChatPrompts({ onPrompt }: ChatPromptsProps) {
  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Ask Aegis-AI</h3>
      <p className="text-slate-400 text-sm mb-4">Tap a prompt to ask the assistant quick security questions.</p>
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="btn-secondary w-full text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
