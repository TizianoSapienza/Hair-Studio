import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { usePublicStaff } from "@/hooks/useServices";
import { Image } from "@/components/ui/image";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, animate } from "framer-motion";
import Reveal from "./Reveal";

const SWIPE_THRESHOLD = 60;

function Slide({ member }) {
  return (
    <div className="grid w-full shrink-0 items-center gap-10 px-10 lg:grid-cols-2 lg:gap-24">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl lg:mx-0 lg:max-w-none">
        <Image
          src={member.photoUrl}
          alt={member.name}
          fittingType="fill"
          className="h-full w-full select-none object-cover object-top"
          draggable={false}
        />
      </div>

      <div className="flex flex-col items-start">
        <h3 className="font-heading text-3xl font-semibold tracking-tight">{member.name}</h3>
        <span className="mt-2 block h-1 w-10 rounded-full bg-primary" />
        {member.specialization && (
          <p className="mt-3 text-base text-muted-foreground">{member.specialization}</p>
        )}
      </div>
    </div>
  );
}

export default function EmployeesSection() {
  const { data: team = [], isLoading: loading } = usePublicStaff();
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const [locked, setLocked] = useState(false);
  const [transit, setTransit] = useState(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!transit) x.set(-width);
  }, [width, index, transit, x]);

  const commit = (delta) => {
    if (locked || !width) return;
    setLocked(true);
    animate(x, -width - delta * width, {
      duration: shouldReduceMotion ? 0 : 0.8,
      ease: [0.4, 1, 0.6, 1],
      onComplete: () => {
        setIndex((i) => (i + delta + team.length) % team.length);
        setLocked(false);
      },
    });
  };

  const jumpTo = (target) => {
    if (locked || !width || target === index) return;
    const steps = Math.abs(target - index);
    if (steps === 1) { commit(target > index ? 1 : -1); return; }
    const delta = target > index ? 1 : -1;
    const lo = Math.min(index, target);
    const slides = team.slice(lo, lo + steps + 1);
    setLocked(true);
    setTransit({ slides, target, delta });
  };

  useLayoutEffect(() => {
    if (!transit || !width) return;
    const span = (transit.slides.length - 1) * width;
    const from = transit.delta === 1 ? 0 : -span;
    const to = transit.delta === 1 ? -span : 0;
    x.set(from);
    const controls = animate(x, to, {
      duration: shouldReduceMotion ? 0 : Math.min(0.9, 0.4 + 0.9 * (transit.slides.length - 2)),
      ease: [0.65, 1, 0.85, 1],
      onComplete: () => {
        setIndex(transit.target);
        setTransit(null);
        setLocked(false);
      },
    });
    return () => controls.stop();
  }, [transit]);

  const settle = () => animate(x, -width, { duration: 0.3, ease: "easeOut" });

  const handleDragEnd = (_e, info) => {
    if (locked) return;
    if (info.offset.x <= -SWIPE_THRESHOLD) commit(1);
    else if (info.offset.x >= SWIPE_THRESHOLD) commit(-1);
    else settle();
  };

  // The theme wipe covers the whole screen with a static snapshot while the
  // real page keeps running underneath — pause autoplay so it doesn't
  // silently advance out of view and "jump" once the wipe reveals it.
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  useEffect(() => {
    const start = () => setThemeTransitioning(true);
    const end = () => setThemeTransitioning(false);
    window.addEventListener("hs:theme-transition-start", start);
    window.addEventListener("hs:theme-transition-end", end);
    return () => {
      window.removeEventListener("hs:theme-transition-start", start);
      window.removeEventListener("hs:theme-transition-end", end);
    };
  }, []);

  useEffect(() => {
    if (team.length <= 1 || !width || themeTransitioning) return;
    const id = setInterval(() => commit(1), 5000);
    return () => clearInterval(id);
  }, [index, team.length, width, themeTransitioning]);

  if (!loading && team.length === 0) return null;

  const prevMember = team[(index - 1 + team.length) % team.length];
  const nextMember = team[(index + 1) % team.length];

  return (
    <section id="team" className="bg-secondary py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-4xl">
              I nostri professionisti al tuo servizio
            </h2>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <Reveal delay={0.1}>
            <div
              className="relative mt-8 overflow-hidden"
              role="group"
              aria-roledescription="carosello"
              aria-label={`Operatore ${index + 1} di ${team.length}`}
            >
              <motion.div
                ref={trackRef}
                className="flex cursor-grab active:cursor-grabbing"
                style={{ x }}
                drag={!locked && !transit && team.length > 1 ? "x" : false}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
              >
                {transit
                  ? transit.slides.map((m, i) => <Slide key={`${m.id}-${i}`} member={m} />)
                  : (
                    <>
                      <Slide member={prevMember} />
                      <Slide member={team[index]} />
                      <Slide member={nextMember} />
                    </>
                  )}
              </motion.div>

              {team.length > 1 && (
                <>
                  <button
                    onClick={() => commit(-1)}
                    disabled={locked}
                    aria-label="Operatore precedente"
                    className="absolute inset-y-0 left-0 flex items-center px-1 text-foreground/50 transition-colors hover:text-primary disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => commit(1)}
                    disabled={locked}
                    aria-label="Operatore successivo"
                    className="absolute inset-y-0 right-0 flex items-center px-1 text-foreground/50 transition-colors hover:text-primary disabled:pointer-events-none"
                  >
                    <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>

            {team.length > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {team.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => jumpTo(i)}
                    disabled={locked}
                    aria-label={`Vai a ${m.name}`}
                    aria-current={i === index}
                    className={`h-2 rounded-full transition-all disabled:pointer-events-none ${i === index ? "w-6 bg-primary" : "w-2 bg-primary/30"}`}
                  />
                ))}
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
