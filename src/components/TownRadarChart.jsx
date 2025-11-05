import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export default function TownRadarChart({ townData }) {
  // Animation state - start from 0 for each town
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0, 0, 0]);
  const [chartOpacity, setChartOpacity] = useState(0.2); // Start almost invisible
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Convert percentage scores to 1-10 scale
  const convertScore = (percentage) => {
    if (!percentage && percentage !== 0) return 5; // Default middle value
    // Ensure we're working with a number and convert properly
    const score = Number(percentage) / 10; // Convert 0-100 to 0-10
    return Math.max(1, Math.min(10, score)); // Clamp between 1 and 10, keep decimals for accuracy
  };

  // Organic breathing easing - slower at peaks, faster in middle
  const easeBreathing = (t) => {
    // Using sine wave for natural breathing rhythm
    // Sine naturally slows at peaks (0 and 1) and speeds up in middle
    return (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
  };

  // Interpolate between two sets of values with organic easing
  const interpolate = (from, to, progress, useBreathingEase = true) => {
    const easedProgress = useBreathingEase ? easeBreathing(progress) : progress;
    return from.map((fromVal, i) => {
      const toVal = to[i];
      return fromVal + (toVal - fromVal) * easedProgress;
    });
  };

  // Main animation effect - follows container algorithm
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // IDENTICAL CHECK TO CONTAINERS: if categoryScores exists
    if (townData.categoryScores && Object.keys(townData.categoryScores).length > 0) {
      // DATA EXISTS - show immediately, no breathing!
      const finalValues = [
        convertScore(townData.categoryScores.region || 0),
        convertScore(townData.categoryScores.climate || 0),
        convertScore(townData.categoryScores.culture || 0),
        convertScore(townData.categoryScores.hobbies || 0),
        convertScore(townData.categoryScores.admin || townData.categoryScores.administration || 0),
        convertScore(townData.categoryScores.cost || townData.categoryScores.costs || townData.categoryScores.budget || 0)
      ];
      
      console.log(`Spider Chart INSTANT for ${townData.town_name}:`, {
        categoryScores: townData.categoryScores,
        finalValues
      });
      
      // Set values immediately
      setAnimatedValues(finalValues);
      setChartOpacity(1);
      
    } else {
      // NO DATA YET - do breathing animation while waiting
      console.log(`Spider Chart BREATHING for ${townData.town_name} - waiting for data`);
      
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        
        // Breathing cycle timing
        const INHALE_DURATION = 5000;  // 5 seconds inhale
        const EXHALE_DURATION = 5000;  // 5 seconds exhale
        const CYCLE = INHALE_DURATION + EXHALE_DURATION;
        
        // Check if data arrived while animating
        if (townData.categoryScores && Object.keys(townData.categoryScores).length > 0) {
          // Data arrived! Transition to final values
          const finalValues = [
            convertScore(townData.categoryScores.region || 0),
            convertScore(townData.categoryScores.climate || 0),
            convertScore(townData.categoryScores.culture || 0),
            convertScore(townData.categoryScores.hobbies || 0),
            convertScore(townData.categoryScores.admin || townData.categoryScores.administration || 0),
            convertScore(townData.categoryScores.cost || townData.categoryScores.costs || townData.categoryScores.budget || 0)
          ];
          
          // Smooth transition from current position to final values
          const TRANSITION_DURATION = 3600; // 3.6 seconds
          const transitionProgress = Math.min(1, elapsed / TRANSITION_DURATION);
          
          const currentValues = interpolate(
            animatedValues,
            finalValues,
            transitionProgress
          );
          
          setAnimatedValues(currentValues);
          setChartOpacity(interpolate([chartOpacity], [1], transitionProgress)[0]);
          
          if (transitionProgress >= 1) {
            // Animation complete
            return;
          }
        } else {
          // Still no data - continue breathing
          const cyclePosition = (elapsed % CYCLE) / CYCLE;
          
          let breathValue;
          if (cyclePosition < 0.5) {
            // Inhale: 0 to 8
            const inhaleProgress = cyclePosition * 2;
            breathValue = interpolate([0], [8], inhaleProgress)[0];
            setChartOpacity(interpolate([0.2], [0.7], inhaleProgress)[0]);
          } else {
            // Exhale: 8 to 3
            const exhaleProgress = (cyclePosition - 0.5) * 2;
            breathValue = interpolate([8], [3], exhaleProgress)[0];
            setChartOpacity(interpolate([0.7], [1], exhaleProgress)[0]);
          }
          
          setAnimatedValues([breathValue, breathValue, breathValue, breathValue, breathValue, breathValue]);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [townData.categoryScores]); // Re-run when categoryScores changes

  // Prepare data for the radar chart
  const data = [
    {
      category: 'Region',
      value: animatedValues[0],
      fullMark: 10
    },
    {
      category: 'Climate',
      value: animatedValues[1],
      fullMark: 10
    },
    {
      category: 'Culture',
      value: animatedValues[2],
      fullMark: 10
    },
    {
      category: 'Hobbies',
      value: animatedValues[3],
      fullMark: 10
    },
    {
      category: 'Admin',
      value: animatedValues[4],
      fullMark: 10
    },
    {
      category: 'Costs',
      value: animatedValues[5],
      fullMark: 10
    }
  ];

  return (
    <div style={{ opacity: chartOpacity, transition: 'opacity 0.3s ease', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid 
            gridType="polygon" 
            radialLines={true}
            stroke="#e5e7eb"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fontSize: 10 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tickCount={6}
            tick={{ fontSize: 10 }}
            className="text-gray-500 dark:text-gray-500"
          />
          <Radar 
            name={townData.town_name} 
            dataKey="value" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.3}
            strokeWidth={1}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}