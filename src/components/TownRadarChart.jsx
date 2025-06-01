import React, { useEffect, useRef } from 'react';

export default function TownRadarChart({ townData }) {
  const chartRef = useRef(null);
  
  // Define the chart properties
  useEffect(() => {
    if (!townData || !chartRef.current) return;
    
    // Clear any existing content
    chartRef.current.innerHTML = '';
    
    // Get the dimensions
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Define the metrics to display
    const metrics = [
      { key: 'cost_index', label: 'Cost', scale: 0.1, max: 3000, inverse: true },
      { key: 'healthcare_score', label: 'Healthcare', scale: 10, max: 10 },
      { key: 'safety_score', label: 'Safety', scale: 10, max: 10 },
      { key: 'nightlife_rating', label: 'Nightlife', scale: 10, max: 10 },
      { key: 'cultural_rating', label: 'Culture', scale: 10, max: 10 },
      { key: 'walkability', label: 'Walkability', scale: 10, max: 10 }
    ];
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chartRef.current.appendChild(svg);
    
    // Create axes
    const numMetrics = metrics.length;
    const angleStep = (Math.PI * 2) / numMetrics;
    
    // Create polygon points for chart data
    let polygonPoints = '';
    const dataPoints = [];
    
    metrics.forEach((metric, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      
      // Calculate axis endpoint
      const axisX = centerX + radius * Math.cos(angle);
      const axisY = centerY + radius * Math.sin(angle);
      
      // Draw axis line
      const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      axisLine.setAttribute('x1', centerX);
      axisLine.setAttribute('y1', centerY);
      axisLine.setAttribute('x2', axisX);
      axisLine.setAttribute('y2', axisY);
      axisLine.setAttribute('stroke', '#cbd5e1');
      axisLine.setAttribute('stroke-width', '1');
      svg.appendChild(axisLine);
      
      // Add axis label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', centerX + (radius + 20) * Math.cos(angle));
      label.setAttribute('y', centerY + (radius + 20) * Math.sin(angle));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', '#64748b');
      label.setAttribute('font-size', '12px');
      label.textContent = metric.label;
      svg.appendChild(label);
      
      // Calculate data point
      let value = townData[metric.key] || 0;
      
      // Handle inverse metrics (lower is better)
      if (metric.inverse && value > 0) {
        value = metric.max - Math.min(value, metric.max);
      }
      
      // Scale value to [0-1] range
      const normalizedValue = Math.min(value / metric.max, 1);
      
      // Calculate point position
      const pointDistance = normalizedValue * radius;
      const pointX = centerX + pointDistance * Math.cos(angle);
      const pointY = centerY + pointDistance * Math.sin(angle);
      
      dataPoints.push({ x: pointX, y: pointY });
      polygonPoints += `${pointX},${pointY} `;
    });
    
    // Create background circles
    for (let i = 1; i <= 5; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', radius * i / 5);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#e2e8f0');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    }
    
    // Create data polygon
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', polygonPoints);
    polygon.setAttribute('fill', 'rgba(34, 197, 94, 0.2)');
    polygon.setAttribute('stroke', '#16a34a');
    polygon.setAttribute('stroke-width', '2');
    svg.appendChild(polygon);
    
    // Add data points
    dataPoints.forEach((point) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#16a34a');
      svg.appendChild(circle);
    });
    
  }, [townData]);
  
  return (
    <div 
      ref={chartRef} 
      className="w-full h-full min-h-[200px]"
      aria-label="Town metrics radar chart"
    />
  );
}