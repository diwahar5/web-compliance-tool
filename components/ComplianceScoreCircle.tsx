import React, { useState, useEffect } from 'react';

const getScoreColor = (score: number): string => {
  if (score > 75) return '#22C55E'; // green-500
  if (score > 40) return '#F59E0B'; // amber-500
  return '#EF4444'; // red-500
};

interface ComplianceScoreCircleProps {
    score: number;
}

const ComplianceScoreCircle: React.FC<ComplianceScoreCircleProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const size = 160;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = getScoreColor(displayScore);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 1500; // Animation duration in ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentScore = Math.round(progress * score);
      setDisplayScore(currentScore);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          stroke="#334155" // slate-700
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={center}
          cy={center}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.35s, stroke 0.35s' }}
        />
      </svg>
      <div
        className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center"
        style={{ color }}
      >
        <span className="text-5xl font-bold tracking-tight">{displayScore}</span>
      </div>
    </div>
  );
};

export default ComplianceScoreCircle;
