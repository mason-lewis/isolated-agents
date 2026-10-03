import { useEffect, useMemo, useRef, useState } from 'react';
import { data, houseAliases, modeNames } from './data';
import { coord, fmt, groups, rgb, stats } from './model';
import NetworkCanvas from './NetworkCanvas';
import { PixelImage } from './Content';
import { useReducedMotion } from './effects';
import type { Direction, Mode } from './types';

export default function Network({mode,onModeChange}: {mode:Mode;onModeChange:(mode:Mode)=>void}) {
  const [selected,setSelected]=useState(136);
  const [round,setRound]=useState(-1);
  const [direction,setDirection]=useState<Direction>('sent');
  const [zoom,setZoom]=useState(1);
  const [focusOnly,setFocusOnly]=useState(false);
  const [animate,setAnimate]=useState(true);
  const [column,setColumn]=useState('8'),[row,setRow]=useState('8');
  const list=useRef<HTMLDivElement>(null);
  const run=data.runs[houseAliases[mode]];
  const stat=useMemo(()=>stats(run,selected,round),[run,selected,round]);
  const grouped=useMemo(()=>groups(stat[direction]),[stat,direction]);
  const reduced=useReducedMotion();
  const canAnimate=!reduced && stat.sent.length+stat.received.length>0;
  useEffect(()=>{setColumn(String(selected%16));setRow(String(Math.floor(selected/16)));},[selected]);
  useEffect(()=>{if(list.current)list.current.scrollTop=0;},[selected,round,direction,mode]);
  const playing = animate && canAnimate;
  return <>
    <div className="explorer">
      <div className="explorer-toolbar"><div className="segmented" role="group" aria-label="Network contact limit">
        {(['No contact','8 neighbors','24 neighbors'] as const).map((label,i)=><button key={i} data-mode={i} aria-pressed={mode===i} onClick={()=>onModeChange(i as Mode)}>{label}</button>)}
      </div><span className="saved-label"><span className="status-dot" /> SAVED RUN / <span id="run-label">{run.alias}</span></span></div>
      <div className="explorer-grid">
        <div className="map-column">
          <div className="map-heading"><span id="map-title">{modeNames[mode].toUpperCase()}</span><span>256 agents</span></div>
          <NetworkCanvas run={run} selected={selected} round={round} zoom={zoom} focusOnly={focusOnly} animate={playing} onSelect={setSelected} />
          <div className="map-tools"><label className="toggle"><input id="focus-only" type="checkbox" checked={focusOnly} onChange={e=>setFocusOnly(e.target.checked)} /> Selected links only</label>
            <div><button id="zoom-out" aria-label="Zoom out" disabled={zoom===1} onClick={()=>setZoom(value=>value-1)}>−</button><output id="zoom-label">{zoom}×</output><button id="zoom-in" aria-label="Zoom in" disabled={zoom===3} onClick={()=>setZoom(value=>value+1)}>+</button><button id="zoom-reset" onClick={()=>setZoom(1)}>Fit</button></div><button id="animate" disabled={!canAnimate} aria-pressed={playing} onClick={()=>setAnimate(value=>!value)}><span aria-hidden="true">{playing?'Ⅱ':'▷'}</span> {playing?'Pause animation':'Animate links'}</button></div>
          <div className="legend"><span><i className="gold-arrow">→</i> Sent by selected agent</span><span><i className="cyan-arrow">→</i> Received by selected agent</span></div>
          <p className="map-help" id="map-help">Tap or click a dot, or use arrow keys when the map is focused. Dots show <strong>final colors</strong>, not colors during a round. Repeat messages share one arrow.</p>
        </div>
        <aside className="inspector" aria-label="Selected agent">
          <div className="inspector-title"><div><p className="eyebrow">INSIDE ONE AGENT</p><h3 id="agent-title">Agent {coord(selected)}</h3></div><span className="swatch" id="agent-swatch" style={{background:rgb(run.colors[selected])}} role="img" aria-label={`Final pixel color: ${run.colors[selected]?.join(', ') ?? 'No accepted color'}`} /></div>
          <form id="coordinate-form" className="coordinate-form" onSubmit={e=>{
            e.preventDefault();const x=Number(column),y=Number(row);
            if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<16&&y>=0&&y<16)setSelected(y*16+x);
          }}><label>Column<input id="agent-col" type="number" min="0" max="15" step="1" value={column} required onChange={e=>setColumn(e.target.value)} /></label>
            <label>Row<input id="agent-row" type="number" min="0" max="15" step="1" value={row} required onChange={e=>setRow(e.target.value)} /></label><button type="submit">Inspect <span aria-hidden="true">↗</span></button></form>
          <div className="agent-stats"><div><strong id="sent-count">{fmt(stat.sent.length)}</strong><span>messages sent</span></div><div><strong id="received-count">{fmt(stat.received.length)}</strong><span>received</span></div><div><strong id="contact-count">{stat.outgoing}</strong><span>neighbors contacted</span></div></div>
          <p className="inbox-context" id="inbox-context" aria-live="polite">{round<0?'All discussion rounds':`Round ${round+1}`} · {stat.allowed} possible neighbors at this position. Received from {stat.incoming} different neighbors.</p>
          <div className="message-tabs" role="group" aria-label="Message direction">{(['sent','received'] as const).map(value=><button key={value} data-direction={value} aria-pressed={direction===value} onClick={()=>setDirection(value)}>{value==='sent'?'Sent':'Received'} <span aria-hidden="true">{value==='sent'?'↗':'↙'}</span></button>)}</div>
          <div ref={list} className="message-list" id="message-list" tabIndex={0} role="region" aria-label="Messages for the selected agent">
            {grouped.length ? grouped.map(group=><article className={`message ${direction}`} key={`${group.round}:${group.from}:${group.text}`}>
              <header><span>ROUND {group.round+1}</span><span>{direction==='sent'?`TO ${group.to.length} NEIGHBOR${group.to.length===1?'':'S'}`:`FROM ${coord(group.from)}`}</span></header>
              <p>{data.texts[group.text]}</p><small>{direction==='sent'?group.to.map(coord).join(' · '):`To ${coord(selected)}`}</small>
            </article>) : <div className="empty-inbox"><strong>{mode===0?'One pixel. No contact.':'No messages in this view.'}</strong><p>{mode===0?'This agent works from the task and its own coordinate. It cannot send or receive messages.':'Try another round, direction, or agent to follow the conversation.'}</p></div>}
          </div>
          <figure className="run-image-preview" aria-label="Final house image for the selected run">
            <PixelImage run={run} highlight={selected} />
            <figcaption>
              <p className="eyebrow">ACTUAL RESULT · {run.alias}</p>
              <h4>Final house image</h4>
              <p>The outline marks <strong>agent {coord(selected)}</strong>.</p>
              <small>Agents could not see this view.</small>
            </figcaption>
          </figure>
        </aside>
      </div>
      <div className="round-toolbar"><div><label htmlFor="round-select">Messages sent during</label><select id="round-select" disabled={mode===0} value={round} onChange={e=>setRound(Number(e.target.value))}><option value="-1">All discussion rounds</option>{[0,1,2].map(value=><option key={value} value={value}>Round {value+1}</option>)}</select></div>
        <p>{reduced?'Motion is off to match your device setting.':<>Animation shows direction,<br />not real delivery timing.</>}</p></div>
    </div>
    <div className="network-stats" aria-live="polite"><div><strong id="total-messages">{fmt(stat.total)}</strong><span>addressed messages <small id="scope-label">{mode===0?'no communication':round<0?'across all rounds':`sent in round ${round+1}`}</small></span></div><div><strong id="total-links">{fmt(stat.links)}</strong><span>different directed links</span></div><div><strong id="run-seconds">{run.seconds.toFixed(1)}<span>s</span></strong><span>recorded run time</span></div></div>
  </>;
}
