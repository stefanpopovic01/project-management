import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Strong reveal animation (titles, sections, CTA)
 */
export function useRevealAnimation(ref, options = {}) {
  const {
    y = 60,
    duration = 0.8,
    delay = 0,
    ease = "power4.out",
    stagger = 0,
    start = "top 85%",
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const targets = ref.current.children?.length
        ? ref.current.children
        : ref.current;

      gsap.fromTo(
        targets,
        {
          y,
          opacity: 0,
          filter: "blur(8px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration,
          delay,
          ease,
          stagger,
          scrollTrigger: {
            trigger: ref.current,
            start,
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [ref, y, duration, delay, ease, stagger, start]);
}

/**
 * Soft reveal animation (cards, images, lists)
 */
export function useSoftReveal(ref, options = {}) {
  const {
    y = 20,
    duration = 0.6,
    delay = 0,
    ease = "power2.out",
    stagger = 0,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      {
        y,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        delay,
        ease,
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [ref, y, duration, delay, ease, stagger]);
}
