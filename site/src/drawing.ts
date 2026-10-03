import { coordinate, links, messages, neighbors, rgb } from './model.ts';
import type { Run } from './types.ts';
export type Point = [number, number];
export interface Path { a: Point; b: Point; c: Point; color: string }
export interface View { focus: number; zoom: number; round: number; focusOnly: boolean }
// Geometry stays in one coordinate space. Supersample at least 2x for fine arrows.
export const MAP_SIZE = 800;
export const canvasPixels = (width: number, density: number) => Math.max(1, Math.ceil(width * Math.max(2, density)));
export function point(index: number, size: number, selected: number, zoom: number): Point {
  const padding = size * .042, step = (size - 2 * padding) / 15;
  const [x, y] = coordinate(index), [sx, sy] = coordinate(selected);
  return zoom === 1 ? [padding + x * step, padding + y * step] : [size / 2 + (x - sx) * step * zoom, size / 2 + (y - sy) * step * zoom];
}
export function hitTest(px: number, py: number, selected: number, zoom: number): number | null {
  const padding = 800 * .042, step = (800 - 2 * padding) / 15;
  const x = Math.round(zoom === 1 ? (px - padding) / step : (px - 400) / step / zoom + selected % 16);
  const y = Math.round(zoom === 1 ? (py - padding) / step : (py - 400) / step / zoom + Math.floor(selected / 16));
  return x >= 0 && x < 16 && y >= 0 && y < 16 ? y * 16 + x : null;
}
function arrow(ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, width: number, radius: number): Path {
  const dx = to[0] - from[0], dy = to[1] - from[1], length = Math.hypot(dx,dy), ux = dx / length, uy = dy / length;
  const a: Point = [from[0] + ux * (radius+2), from[1] + uy * (radius+2)];
  const b: Point = [to[0] - ux * (radius+2), to[1] - uy * (radius+2)];
  const bend = Math.min(length * .14, 13), c: Point = [(a[0]+b[0])/2 - uy*bend, (a[1]+b[1])/2 + ux*bend];
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo(...c,...b);ctx.stroke();
  const angle=Math.atan2(b[1]-c[1],b[0]-c[0]),head=width>1?5:3;
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(b[0]-head*Math.cos(angle-.42),b[1]-head*Math.sin(angle-.42));ctx.lineTo(b[0]-head*Math.cos(angle+.42),b[1]-head*Math.sin(angle+.42));ctx.closePath();ctx.fill();
  return {a,b,c,color};
}
export function drawNetwork(ctx: CanvasRenderingContext2D, run: Run, { focus, zoom, round, focusOnly }: View): Path[] {
  const size=MAP_SIZE, paths: Path[]=[], edges=links(messages(run,round));
  const at=(i: number)=>point(i,size,focus,zoom),radius=size/800*(zoom===1?5.6:8);
  ctx.clearRect(0,0,size,size);ctx.fillStyle='#090f18';ctx.fillRect(0,0,size,size);
  ctx.strokeStyle='#172637';ctx.lineWidth=.65;
  for(let i=0;i<16;i++){
    ctx.beginPath();ctx.moveTo(...at(i));ctx.lineTo(...at(i+240));ctx.stroke();
    ctx.beginPath();ctx.moveTo(...at(i*16));ctx.lineTo(...at(i*16+15));ctx.stroke();
  }
  for(const edge of edges) if(edge.from!==focus&&edge.to!==focus&&!focusOnly) arrow(ctx,at(edge.from),at(edge.to),'#2d4e60',.55,radius);
  for(const edge of edges) if(edge.from===focus||edge.to===focus) paths.push(arrow(ctx,at(edge.from),at(edge.to),edge.from===focus?'#f3cb77':'#74d5e8',1.65,radius));
  const allowed=new Set(neighbors(focus,run.radius));
  for(let i=0;i<256;i++){
    const [x,y]=at(i);if(x<-20||y<-20||x>size+20||y>size+20)continue;
    if(i===focus){ctx.strokeStyle='#f3cb77';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,radius+5,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=focusOnly&&i!==focus&&!allowed.has(i)?.27:1;
    ctx.fillStyle=rgb(run.colors[i]);ctx.strokeStyle='#a1b3c6';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.globalAlpha=1;
  }
  if(zoom===1){
    ctx.fillStyle='#a2aec2';ctx.font=`${size/800*10}px monospace`;ctx.textAlign='center';
    for(const i of [0,5,10,15]){ctx.fillText(String(i),at(i)[0],size-7);ctx.fillText(String(i),9,at(i*16)[1]+3);}
  }
  return paths;
}
