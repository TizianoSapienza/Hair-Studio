import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const location = useLocation();

  const reset = () => {
    pulling.current = false;
    setPull(0);
    setRefreshing(false);
  };

  // Reset sicuro su cambio rotta: evita content rimasto "spostato" dopo navigazione
  useEffect(() => {
    reset();
  }, [location.pathname]);

  const onTouchStart = (e) => {
    if (window.scrollY <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };
  const onTouchMove = (e) => {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPull(Math.min(delta * 0.5, 90));
  };
  const onTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull > 55) {
      setRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={reset}
      className="relative"
    >
      {(pull > 0 || refreshing) && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex items-end justify-center pb-2"
          style={{ height: refreshing ? 44 : pull }}
        >
          <Loader2
            className={`h-5 w-5 text-primary ${refreshing ? "animate-spin" : ""}`}
            style={{ opacity: refreshing ? 1 : Math.min(pull / 55, 1) }}
          />
        </div>
      )}
      <div
        style={{
          transform: `translateY(${refreshing ? 44 : pull}px)`,
          transition: pulling.current ? "none" : "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}