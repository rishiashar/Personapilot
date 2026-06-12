"use client";

import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

import { cn } from "@/lib/utils";

function useEntered(threshold = 0.3) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, entered };
}

const EASE = "cubic-bezier(0.22,1,0.36,1)";

type SceneGroup = { node: SVGGElement; delay: number };

/**
 * The interview, sketched by hand with rough.js: researcher and student
 * across the table. The scripted question gets struck out for a blue one,
 * and the student's answer bubble fills with a living blue voice.
 */
function SketchScene({ entered }: { entered: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupsRef = useRef<SceneGroup[]>([]);
  const drawablesRef = useRef<{ node: SVGGElement; delay: number }[]>([]);
  const barsRef = useRef<SVGGElement[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || groupsRef.current.length) return;
    const rc = rough.svg(svg);
    const ink = {
      stroke: "currentColor",
      strokeWidth: 2.2,
      roughness: 1.6,
      bowing: 1.4,
      seed: 7,
    };

    const add = (
      delay: number,
      nodes: SVGGElement[],
      className?: string,
    ): SVGGElement => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      if (className) g.setAttribute("class", className);
      nodes.forEach((n) => g.appendChild(n));
      svg.appendChild(g);
      g.style.opacity = "0";
      g.style.transform = "translateY(10px)";
      g.style.transition = `opacity 600ms ${EASE} ${delay}ms, transform 600ms ${EASE} ${delay}ms`;
      groupsRef.current.push({ node: g, delay });
      return g;
    };

    // table
    add(0, [
      rc.line(70, 302, 490, 302, ink),
      rc.line(104, 302, 104, 352, ink),
      rc.line(456, 302, 456, 352, ink),
    ]);

    // researcher with script on the table
    add(150, [
      rc.circle(152, 219, 46, ink),
      rc.path("M114 302 C114 248, 190 248, 190 302", ink),
      rc.rectangle(196, 266, 58, 36, {
        ...ink,
        fill: "var(--background)",
        fillStyle: "solid",
      }),
      rc.line(206, 277, 244, 277, { ...ink, strokeWidth: 1.4 }),
      rc.line(206, 286, 236, 286, { ...ink, strokeWidth: 1.4 }),
      rc.line(206, 295, 240, 295, { ...ink, strokeWidth: 1.4 }),
    ]);

    // student
    add(300, [
      rc.circle(408, 219, 46, { ...ink, seed: 11 }),
      rc.path("M370 302 C370 248, 446 248, 446 302", { ...ink, seed: 11 }),
    ]);

    // researcher's question bubble with the scripted line
    add(550, [
      rc.path("M96 86 L252 86 L252 150 L172 150 L152 180 L150 150 L96 150 Z", {
        ...ink,
        seed: 3,
      }),
      rc.line(114, 108, 234, 108, { ...ink, strokeWidth: 1.8 }),
    ]);

    // the strike and the blue rewrite, drawn in
    const strike = add(0, [
      rc.path("M108 113 C 150 103, 200 112, 240 103", {
        ...ink,
        strokeWidth: 2.6,
        seed: 5,
      }),
    ]);
    const rewrite = add(0, [
      rc.line(114, 132, 218, 132, { ...ink, strokeWidth: 3.4, seed: 9 }),
    ]);
    rewrite.setAttribute("class", "text-brand");
    drawablesRef.current = [
      { node: strike, delay: 1100 },
      { node: rewrite, delay: 1500 },
    ];
    drawablesRef.current.forEach(({ node }) => {
      node.style.opacity = "1";
      node.style.transform = "none";
      node.style.transition = "none";
      node.querySelectorAll("path").forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });
    });

    // student's answer bubble where the voice opens up
    add(1900, [
      rc.path(
        "M318 48 L492 48 L492 140 L448 140 L428 180 L426 140 L318 140 Z",
        { ...ink, seed: 13 },
      ),
    ]);
    const bars = [
      { x: 356, h: 18 },
      { x: 376, h: 38 },
      { x: 396, h: 26 },
      { x: 416, h: 44 },
      { x: 436, h: 22 },
      { x: 456, h: 34 },
    ].map((bar, i) => {
      const node = rc.line(bar.x, 94 - bar.h / 2, bar.x, 94 + bar.h / 2, {
        ...ink,
        strokeWidth: 4.5,
        seed: 17 + i,
      });
      node.setAttribute(
        "class",
        "animate-wavebar motion-reduce:animate-none",
      );
      node.style.transformOrigin = `${bar.x}px 94px`;
      node.style.animationDelay = `${2300 + i * 120}ms`;
      node.style.animationPlayState = "paused";
      return node;
    });
    barsRef.current = bars;
    const barsGroup = add(2200, bars);
    barsGroup.setAttribute("class", "text-brand");
  }, []);

  useEffect(() => {
    if (!entered) return;
    groupsRef.current.forEach(({ node }) => {
      node.style.opacity = "1";
      node.style.transform = "translateY(0)";
    });
    barsRef.current.forEach((bar) => {
      bar.style.animationPlayState = "running";
    });
    drawablesRef.current.forEach(({ node, delay }) => {
      node.querySelectorAll("path").forEach((p) => {
        p.style.transition = `stroke-dashoffset 700ms ${EASE} ${delay}ms`;
        p.style.strokeDashoffset = "0";
      });
    });
  }, [entered]);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox="0 0 560 380"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full text-foreground select-none"
    />
  );
}

/** The answer, pulled like a transcript quote with researcher highlights. */
function InsightPull({ entered }: { entered: boolean }) {
  const highlight = (delay: number) =>
    ({
      backgroundImage:
        "linear-gradient(var(--color-wash-blue), var(--color-wash-blue))",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 0",
      backgroundSize: entered ? "100% 100%" : "0% 100%",
      transition: "background-size 700ms ease-out",
      transitionDelay: `${delay}ms`,
    }) as const;

  return (
    <div
      aria-hidden
      className="mt-5 border border-foreground bg-background p-5 shadow-[6px_6px_0_0_var(--foreground)] select-none sm:p-6"
    >
      <p className="caps text-muted-foreground">
        Same participant · After the rewrite
      </p>
      <p className="mt-3 text-[15px] leading-relaxed sm:text-base">
        &ldquo;Honestly?{" "}
        <span className="px-0.5" style={highlight(2600)}>
          During convocation season.
        </span>{" "}
        The rest of the year it feels like{" "}
        <span className="px-0.5" style={highlight(3000)}>
          a place I commute to, not a place I belong to
        </span>
        .&rdquo;
      </p>
    </div>
  );
}

/**
 * The origin story: continuous text beside a hand-sketched interview scene
 * where the scripted question gets struck for a blue one and the answer
 * bubble starts to actually speak.
 */
export function StoryBeats({ className }: { className?: string }) {
  const { ref, entered } = useEntered();

  return (
    <div
      ref={ref}
      className={cn(
        "grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16",
        className,
      )}
    >
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
        <p className="caps text-brand">University of Toronto · Capstone</p>
        <p>
          During my capstone project at the University of Toronto, my team
          was researching why students were not using UofT Mobile, an app
          that put the university&apos;s links and tools in one place. We
          asked the obvious questions. Which links do you open? How often?
          What tasks are you trying to finish?
        </p>
        <p>
          The answers were fine. They were also stuck at the surface. They
          told us how students used the app, but never why they would come
          back to it. So we changed the questions. Instead of asking about
          links, we asked:{" "}
          <span className="font-medium text-foreground">
            what does UofT mean to you? When do you feel connected to it? Do
            you feel like you belong here?
          </span>
        </p>
        <p>
          The whole conversation changed. Tasks became feelings, app usage
          became student identity, and suddenly we were learning things worth
          acting on. Same study, same students. Only the questions were
          different.
        </p>
      </div>
      <div>
        <SketchScene entered={entered} />
        <InsightPull entered={entered} />
      </div>
    </div>
  );
}
