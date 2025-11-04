
import React from 'react';
import { type VoiceOption } from '../types';
import { MaleIcon, FemaleIcon } from './icons';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoice: string;
  onSelectVoice: (id: string) => void;
  disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoice, onSelectVoice, disabled }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {voices.map((voice) => (
        <div
          key={voice.id}
          onClick={() => !disabled && onSelectVoice(voice.id)}
          className={`
            p-4 rounded-lg text-center cursor-pointer transition-all duration-200
            border-2 
            ${selectedVoice === voice.id
              ? 'bg-cyan-500/20 border-cyan-400 scale-105 shadow-lg'
              : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          {voice.gender === 'male' 
            ? <MaleIcon className="w-10 h-10 mx-auto mb-2 text-cyan-400" /> 
            : <FemaleIcon className="w-10 h-10 mx-auto mb-2 text-pink-400" />
          }
          <p className="font-bold text-white">{voice.name}</p>
          <p className="text-xs text-slate-400">{voice.description}</p>
        </div>
      ))}
    </div>
  );
};
