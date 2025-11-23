import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Zap } from 'lucide-react';

export const BrownNoise: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleNoise = async () => {
    if (isPlaying) {
      audioContextRef.current?.suspend();
      setIsPlaying(false);
    } else {
      if (!audioContextRef.current) {
        // Initialize Audio Context on first user interaction
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Create Brown Noise Buffer
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Compensate for gain loss
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15; // Initial volume
        gainNodeRef.current = gainNode;

        noiseSource.connect(gainNode);
        gainNode.connect(ctx.destination);
        noiseSource.start(0);
      }
      await audioContextRef.current.resume();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-4 hover:bg-white/10 transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white/10 text-white/50'}`}>
          <Zap size={18} fill={isPlaying ? "currentColor" : "none"} />
        </div>
        <div>
          <h4 className="font-medium text-sm text-white group-hover:text-white/100 transition-colors">Brown Noise</h4>
          <p className="text-xs text-white/50">Generated focus sound</p>
        </div>
      </div>
      <button
        onClick={toggleNoise}
        className={`p-2 rounded-full transition-all ${
          isPlaying ? 'bg-white text-black hover:scale-110' : 'bg-white/5 text-white/60 hover:bg-white/20 hover:text-white'
        }`}
      >
        {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );
};