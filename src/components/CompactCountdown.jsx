import { useState, useEffect } from 'react';
import { uiConfig } from '../styles/uiConfig';

export default function CompactCountdown({ targetDate, title = "Until Retirement" }) {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    totalDays: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const target = new Date(targetDate);

      // If date is in the past, show zero
      if (target <= now) {
        setTimeRemaining({ years: 0, months: 0, days: 0, totalDays: 0 });
        return;
      }

      // Calculate total days for display
      const timeDiff = target.getTime() - now.getTime();
      const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      // Calculate years
      let years = target.getFullYear() - now.getFullYear();
      let months = target.getMonth() - now.getMonth();
      let days = target.getDate() - now.getDate();

      // Adjust for negative days
      if (days < 0) {
        months--;
        const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += lastMonth.getDate();
      }

      // Adjust for negative months
      if (months < 0) {
        years--;
        months += 12;
      }

      setTimeRemaining({
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        totalDays: Math.max(0, totalDays)
      });
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every minute for more responsive countdown
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Compact display - show most relevant units
  const getCompactDisplay = () => {
    const { years, months, days, totalDays } = timeRemaining;
    
    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m ${days}d`;
    } else {
      return `${totalDays} days`;
    }
  };

  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 flex items-center justify-between`}>
      <div>
        <p className={`text-sm ${uiConfig.colors.body} mb-1`}>{title}</p>
        <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
          {getCompactDisplay()}
        </p>
      </div>
      <div className={`text-right`}>
        <p className={`text-xs ${uiConfig.colors.hint}`}>
          {timeRemaining.totalDays.toLocaleString()} total days
        </p>
        <p className={`text-xs ${uiConfig.colors.hint} mt-1`}>
          Target: {new Date(targetDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}