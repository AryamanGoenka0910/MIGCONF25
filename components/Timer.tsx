"use client"

import React from 'react';
import { useTimer } from 'react-timer-hook';

function MyTimer({ expiryTimestamp } : any) {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, onExpire: () => console.warn('onExpire called') });


  return (
    <div className="flex w-screen items-center justify-center bg-slate-600 text-bold py-2 space-x-4">
      <h1 className='text-[20px] text-white'>Time Left to Apply: </h1>
      <div className="text-[20px] text-white">
        <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
      </div>
    </div>
  );
}

export default function Timer() {
  const now = new Date(); // Get current time
  const targetDate = new Date(now.getFullYear(), 2, 10, 23, 59, 59); // March 10th at 11:59:59 PM
  const timeDifference = Math.floor((targetDate.getTime() - now.getTime()) / 1000); // Convert ms to seconds

  now.setSeconds(now.getSeconds() + (timeDifference)); // 10 minutes timer
  return (
    <div>
      <MyTimer expiryTimestamp={now} />
    </div>
  );
}