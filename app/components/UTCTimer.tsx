"use client"
import { useState, useEffect } from "react";

export function UTCTimer() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000); // update every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-sm text-white/50">
            {time.toUTCString()}
        </div>
    );
}
