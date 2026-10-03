import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, KeyboardEvent } from 'react';
import { data, modeNames } from './data';
import { coord, coordinate, stats } from './model';
import { hitTest, MAP_SIZE } from './drawing';
import { useNetworkDrawing } from './useNetworkDrawing';
import type { Run } from './types';
import { useReducedMotion } from './effects';

export function HeroArt() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState(136);
  const [hovered, setHovered] = useState<number>();
  const [animate, setAnimate] = useState(true);
  const reduced = useReducedMotion();
  useNetworkDrawing(ref, data.runs.P17, {focus:selected, zoom:1, round:-1, focusOnly:false}, animate, hovered);
  const locate = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return hitTest((event.clientX-rect.left)/rect.width*MAP_SIZE, (event.clientY-rect.top)/rect.height*MAP_SIZE, selected, 1);
  };
  return <figure className="hero-art">
    <div className="art-caption"><span>ONE AGENT = ONE DOT</span><button className="hero-motion" disabled={reduced} aria-pressed={animate && !reduced} aria-label={animate && !reduced ? 'Pause opening map animation' : 'Play opening map animation'} onClick={() => setAnimate(value => !value)}>{animate && !reduced ? 'Ⅱ Pause' : '▷ Play'}</button></div>
    <canvas ref={ref} id="hero-map" width="800" height="800" tabIndex={0} role="img" aria-describedby="hero-map-help"
      aria-label={`The saved 24-neighbor house network. Selected agent ${coord(selected)}. Hover to circle an agent; tap or use arrow keys to select.`}
      onPointerMove={event => {if (event.pointerType === 'mouse') setHovered(locate(event) ?? undefined);}}
      onPointerLeave={() => setHovered(undefined)}
      onPointerDown={event => {const index = locate(event);if (index !== null) {setSelected(index);setHovered(index);}}}
      onKeyDown={event => {
        let [x,y] = coordinate(selected);
        if(event.key==='ArrowLeft')x--;else if(event.key==='ArrowRight')x++;else if(event.key==='ArrowUp')y--;else if(event.key==='ArrowDown')y++;else return;
        event.preventDefault();setHovered(undefined);setSelected(Math.max(0,Math.min(15,y))*16+Math.max(0,Math.min(15,x)));
      }} />
    <div className="hero-map-hint" id="hero-map-help"><span>Hover or tap a node</span><span>Agent {coord(hovered ?? selected)}</span></div>
    <figcaption><span className="mini-line" /> A house, built from 256 separate decisions.<small>Final colors · Actual links · Motion shows direction</small></figcaption>
  </figure>;
}
interface Props {run:Run;selected:number;round:number;zoom:number;focusOnly:boolean;animate:boolean;onSelect:(index:number)=>void}
export default function NetworkCanvas({run,selected,round,zoom,focusOnly,animate,onSelect}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{index:number;x:number;y:number}|null>(null);
  const hovered = hover?.index;
  const hoverStats = useMemo(() => hovered === undefined ? null : stats(run,hovered,round), [run, hovered, round]);
  useEffect(() => {setHover(null);}, [run, selected, round, zoom]);
  useNetworkDrawing(ref, run, {focus:selected,round,zoom,focusOnly}, animate, hovered);
  const indexAt = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect=event.currentTarget.getBoundingClientRect();
    return hitTest((event.clientX-rect.left)/rect.width*800,(event.clientY-rect.top)/rect.height*800,selected,zoom);
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType !== 'mouse') return;
    const index=indexAt(event), rect=event.currentTarget.getBoundingClientRect();
    setHover(index===null?null:{index,x:Math.max(8,Math.min(event.clientX-rect.left+16,rect.width-196)),y:Math.max(8,Math.min(event.clientY-rect.top+16,rect.height-112))});
  };
  const key = (event:KeyboardEvent<HTMLCanvasElement>) => {
    let [x,y]=coordinate(selected);
    if(event.key==='ArrowLeft')x--;else if(event.key==='ArrowRight')x++;else if(event.key==='ArrowUp')y--;else if(event.key==='ArrowDown')y++;else return;
    event.preventDefault();onSelect(Math.max(0,Math.min(15,y))*16+Math.max(0,Math.min(15,x)));
  };
  const counts = useMemo(() => stats(run,selected,round),[run,selected,round]);
  return <div className="map-stage">
    <canvas ref={ref} id="network-map" width="800" height="800" tabIndex={0} role="img" aria-describedby="map-help"
      aria-label={`${modeNames[run.radius]} house network. Selected agent ${coord(selected)}. ${counts.sent.length} messages sent, ${counts.received.length} received. Arrow keys move selection.`}
      onPointerMove={move} onPointerLeave={() => setHover(null)} onClick={event => {
        const rect=event.currentTarget.getBoundingClientRect();
        const index=hitTest((event.clientX-rect.left)/rect.width*800,(event.clientY-rect.top)/rect.height*800,selected,zoom);
        if(index!==null)onSelect(index);
      }} onKeyDown={key} />
    {hover && hoverStats && <div className="map-tooltip" aria-hidden="true" style={{left:hover.x,top:hover.y}}><strong>Agent {coord(hover.index)}</strong>{hoverStats.sent.length} sent · {hoverStats.received.length} received<small>{round<0?'ALL ROUNDS':`ROUND ${round+1}`} · CLICK TO INSPECT</small></div>}
  </div>;
}
