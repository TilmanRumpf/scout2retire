import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

export default function SimpleSwipeTest() {
  const [lastSwipe, setLastSwipe] = useState('None');
  const [swipeCount, setSwipeCount] = useState(0);
  const [touchLog, setTouchLog] = useState([]);
  const [testResults, setTestResults] = useState({
    touchSupported: 'ontouchstart' in window,
    swipeableImported: !!useSwipeable,
    userAgent: navigator.userAgent.includes('iPhone') ? 'iPhone' : 
               navigator.userAgent.includes('Android') ? 'Android' : 'Desktop'
  });

  const addTouchLog = (message) => {
    setTouchLog(prev => [...prev.slice(-2), message]);
  };

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      console.log('🔥 SIMPLE TEST: LEFT swipe detected!', eventData);
      setLastSwipe('LEFT ✅');
      setSwipeCount(prev => prev + 1);
      addTouchLog('LEFT SWIPE SUCCESS!');
    },
    onSwipedRight: (eventData) => {
      console.log('🔥 SIMPLE TEST: RIGHT swipe detected!', eventData);
      setLastSwipe('RIGHT ✅');
      setSwipeCount(prev => prev + 1);
      addTouchLog('RIGHT SWIPE SUCCESS!');
    },
    onSwiping: (eventData) => {
      if (Math.abs(eventData.deltaX) > 15) {
        console.log('🔄 SIMPLE TEST: Swiping...', eventData.deltaX);
        addTouchLog(`Swiping: ${eventData.deltaX}`);
      }
    },
    onTouchStartOrOnMouseDown: () => {
      console.log('👆 SIMPLE TEST: Touch started');
      addTouchLog('Touch started');
    },
    delta: 15,
    trackTouch: true,
    trackMouse: false,
    touchEventOptions: { passive: false },
    preventScrollOnSwipe: false,
    swipeDuration: 2000
  });

  return (
    <div
      {...handlers}
      style={{
        position: 'fixed',
        top: '400px',
        right: '10px',
        width: '180px',
        height: '160px',
        background: 'rgba(0, 255, 0, 0.95)',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: '10px',
        zIndex: 9999,
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '3px solid #00ff00',
        touchAction: 'pan-y', // Allow vertical scroll, block horizontal
        padding: '8px',
        fontFamily: 'monospace'
      }}
      onTouchStart={(e) => {
        console.log('🟢 SIMPLE: Native touch start', e.touches.length);
        addTouchLog('Native touch start');
      }}
      onTouchMove={(e) => {
        if (Math.random() < 0.3) { // 30% sampling
          console.log('🔵 SIMPLE: Native touch move', e.touches[0]?.clientX);
        }
      }}
      onTouchEnd={() => {
        console.log('🔴 SIMPLE: Native touch end');
        addTouchLog('Native touch end');
      }}
    >
      <div style={{ fontSize: '12px', color: '#003300' }}>🧪 COMPREHENSIVE TEST</div>
      <div>Last: {lastSwipe}</div>
      <div>Count: {swipeCount}</div>
      
      <div style={{ fontSize: '9px', marginTop: '4px', lineHeight: '1.2' }}>
        Touch: {testResults.touchSupported ? '✅' : '❌'}<br/>
        Swipeable: {testResults.swipeableImported ? '✅' : '❌'}<br/>
        Device: {testResults.userAgent}
      </div>
      
      <div style={{ fontSize: '8px', marginTop: '4px', maxHeight: '30px', overflow: 'hidden' }}>
        {touchLog.map((log, i) => (
          <div key={i} style={{ opacity: 0.8 }}>• {log}</div>
        ))}
      </div>
      
      <div style={{ fontSize: '10px', marginTop: '4px', color: '#006600' }}>
        SWIPE LEFT/RIGHT HERE!
      </div>
    </div>
  );
}