import { useState, useEffect } from 'react';

export default function CountdownWidget({ targetDate, title = "Retirement Countdown" }) {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0
  });

  useEffect(() => {
    // Function to calculate time difference
    const calculateTimeRemaining = () => {
      const now = new Date();
      const target = new Date(targetDate);

      // If date is in the past, show zero
      if (target <= now) {
        setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0 });
        return;
      }

      // Calculate years difference
      let yearDiff = target.getFullYear() - now.getFullYear();

      // Calculate months difference
      let monthDiff = target.getMonth() - now.getMonth();
      if (monthDiff < 0) {
        yearDiff--;
        monthDiff += 12;
      }

      // Check if day in current month has already passed
      if (target.getDate() < now.getDate()) {
        if (monthDiff > 0) {
          monthDiff--;
        } else {
          yearDiff--;
          monthDiff = 11;
        }
      }

      // Calculate days
      const timeDiff = target.getTime() - now.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) % 30; // Approximate days in month

      // Calculate hours
      const hourDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setTimeRemaining({
        years: Math.max(0, yearDiff),
        months: Math.max(0, monthDiff),
        days: Math.max(0, dayDiff),
        hours: Math.max(0, hourDiff)
      });
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every hour
    const interval = setInterval(calculateTimeRemaining, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{timeRemaining.years}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Years</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{timeRemaining.months}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Months</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{timeRemaining.days}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Days</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{timeRemaining.hours}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Hours</span>
        </div>
      </div>
    </div>
  );
}