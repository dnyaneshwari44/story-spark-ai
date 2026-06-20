import React from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface AudioPlayerProps {
  text: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  return (
    <div style={{ margin: '10px 0' }}>
      {!isSpeaking ? (
        <button onClick={() => speak(text)}>▶️ Play Story Audio</button>
      ) : (
        <button onClick={stop}>⏹️ Stop Audio</button>
      )}
    </div>
  );
};