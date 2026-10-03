import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { canvasPixels, drawNetwork, MAP_SIZE, point } from './drawing';
import type { View } from './drawing';
import type { Run } from './types';
import { useReducedMotion } from './effects';

/** Draw at high density; suspend motion without losing the user's play setting. */
export function useNetworkDrawing(
  ref: RefObject<HTMLCanvasElement | null>, run: Run, view: View,
  animate: boolean, hovered?: number,
) {
  const [pixels, setPixels] = useState(MAP_SIZE);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const reduced = useReducedMotion();
  const { focus, zoom, round, focusOnly } = view;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const resize = () => setPixels(canvasPixels(canvas.getBoundingClientRect().width, devicePixelRatio));
    const visibility = () => setPageVisible(!document.hidden);
    const sizes = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    // A monitor change or browser zoom can change density without changing CSS width.
    let density: MediaQueryList;
    const watchDensity = () => {
      density?.removeEventListener('change', watchDensity);
      resize();
      density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      density.addEventListener('change', watchDensity);
    };
    sizes.observe(canvas);intersection.observe(canvas);watchDensity();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      sizes.disconnect();intersection.disconnect();density.removeEventListener('change', watchDensity);
      removeEventListener('resize', resize);document.removeEventListener('visibilitychange', visibility);
    };
  }, [ref]);

  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = canvas.height = pixels;
    const layer = document.createElement('canvas');
    layer.width = layer.height = pixels;
    const lc = layer.getContext('2d');
    if (!lc) return;
    const scale = pixels / MAP_SIZE;
    lc.setTransform(scale, 0, 0, scale, 0, 0);
    const paths = drawNetwork(lc, run, { focus, zoom, round, focusOnly });
    if (hovered !== undefined) {
      const [x, y] = point(hovered, MAP_SIZE, focus, zoom);
      // A dark outer stroke keeps the hover ring legible over every pixel color.
      lc.beginPath();lc.arc(x, y, zoom === 1 ? 12 : 16, 0, Math.PI * 2);
      lc.strokeStyle = '#090f18';lc.lineWidth = 5;lc.stroke();
      lc.strokeStyle = '#e5ebf5';lc.lineWidth = 2;lc.stroke();
    }
    let frame = 0;
    const moving = animate && !reduced && visible && pageVisible && paths.length > 0;
    const paint = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pixels, pixels);ctx.drawImage(layer, 0, 0);
      if (!moving) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const t = (time % 2600) / 2600;
      for (const { a, b, c, color } of paths) {
        const x = (1-t)**2*a[0]+2*(1-t)*t*c[0]+t*t*b[0];
        const y = (1-t)**2*a[1]+2*(1-t)*t*c[1]+t*t*b[1];
        ctx.fillStyle = color;ctx.beginPath();ctx.arc(x, y, 3, 0, Math.PI*2);ctx.fill();
      }
      frame = requestAnimationFrame(paint);
    };
    paint(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [ref, run, pixels, focus, zoom, round, focusOnly, animate, hovered, reduced, visible, pageVisible]);
}
