import { useEffect, useRef, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}
export function ReadingProgress() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    draw();
    return () => {cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('scroll', schedule); removeEventListener('resize', schedule);};
  }, []);
  return <div className="reading-progress" aria-hidden="true"><span ref={ref} /></div>;
}
export function usePageEffects() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const reduced = useReducedMotion();
  useEffect(() => {
    let frame = 0;
    const sections = [...document.querySelectorAll<HTMLElement>('main > section')];
    const draw = () => {
      frame = 0; setScrolled(scrollY > 20);
      setActive(sections.filter(section => section.getBoundingClientRect().top <= innerHeight * .4).at(-1)?.id ?? '');
    };
    const schedule = () => {if (!frame) frame = requestAnimationFrame(draw);};
    addEventListener('scroll', schedule, {passive: true});addEventListener('resize', schedule);draw();
    return () => {cancelAnimationFrame(frame);removeEventListener('scroll', schedule);removeEventListener('resize', schedule);};
  }, []);
  useEffect(() => {
    if (reduced || !('IntersectionObserver' in window)) return;
    const targets = [...document.querySelectorAll<HTMLElement>('.section-heading, .rules, .contact-cards, .takeaway, .explorer, .network-stats, .result-toolbar, .exchange-card, .human-grid')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');observer.unobserve(entry.target);
      }
    }, {threshold: .04, rootMargin: '0px 0px 20px 0px'});
    for (const target of targets) {
      target.classList.add('scroll-reveal');
      if (target.getBoundingClientRect().top > innerHeight) {target.classList.add('reveal-pending');observer.observe(target);}
    }
    return () => {observer.disconnect();for (const target of targets) target.classList.remove('scroll-reveal', 'reveal-pending');};
  }, [reduced]);
  return {scrolled, active};
}
