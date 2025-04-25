// @ts-nocheck
import React, { Component, useState, useEffect } from "react";

export function getTimeDifference(date) {
    let difference =
      moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff( 
        moment(date, "DD/MM/YYYY HH:mm:ss")
      ) / 1000;
  
    if (difference < 60) return `${Math.floor(difference)} seconds`;
    else if (difference < 3600) return `${Math.floor(difference / 60)} minutes`;
    else if (difference < 86400) return `${Math.floor(difference / 3660)} hours`;
    else if (difference < 86400 * 30)
      return `${Math.floor(difference / 86400)} days`;
    else if (difference < 86400 * 30 * 12)
      return `${Math.floor(difference / 86400 / 30)} months`;
    else return `${(difference / 86400 / 30 / 12).toFixed(1)} years`;
  }
  
  export function getUTCNow() {
    return Date.now();
  }
  
  export function getUTCTimestamp(_date) {
    var date = new Date(_date);
    var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
    return date_utc.getTime();
  }
  
  export function getUTCDate(timestamp) {
    const num_time = parseInt(timestamp) * 1000;
    const date = new Date(num_time);
    return moment.utc(date).format("MMMM Do, HH:mm UTC");
  }
  
  export function getDeadlineTimestamp(start_time, duration) {
    const utc_date = new Date(parseInt(start_time));
    const start_utc = Date.UTC(utc_date.getUTCFullYear(), utc_date.getUTCMonth(), utc_date.getUTCDate(), utc_date.getUTCHours(), utc_date.getUTCMinutes(), utc_date.getUTCSeconds());
    if (duration > 3650)
      duration = 3650;
    return start_utc + duration * 24 * 3600 * 1000;
  }


  interface ClockProps {
    deadline: number;
    setEnded: (ended: boolean) => void;
    start: boolean
  }
  
  const Clock: React.FC<ClockProps> = ({ deadline, setEnded, start }) => {
    const [time, setTime] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  
    const leading0 = (num: number) => (num < 10 ? `0${num}` : num);
  
    const getTimeUntil = (deadline: number) => {
      const timeLeft = deadline - getUTCNow();
      if (timeLeft < 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setEnded(true);
      } else {
        const seconds = Math.floor((timeLeft / 1000) % 60);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        setTime({ days, hours, minutes, seconds });
      }
    };
  
    useEffect(() => {
      getTimeUntil(deadline);
      const interval = setInterval(() => getTimeUntil(deadline), 1000);
  
      return () => {
        clearInterval(interval); // Cleanup interval on unmount
      };
    }, [deadline]);
  
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {["Days", "Hours", "Minutes", "Seconds"].map((label, index) => {
          const value = [time.days, time.hours, time.minutes, time.seconds][index];
          return (
            <div
              key={label}
              className="min-w-[78px] px-[10px] py-[10px] flex flex-col justify-center items-center rounded-[.5rem] text-center"
            >
              <p className="text-white text-[13px] md:text-[14px] font-semibold leading-[30px]">{label}</p>
              <h1 className="text-white text-[28px] font-semibold leading-1">{leading0(value)}</h1>
            </div>
          );
        })}
      </div>
    );
  };
  
  export default Clock;