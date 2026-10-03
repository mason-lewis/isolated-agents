import { Fragment, useState } from 'react';
import type { CSSProperties } from 'react';
import { data, houseAliases, modeNames } from './data';
import { coord, rgb } from './model';
import type { Mode, Run } from './types';

export function PixelImage({ run, highlight = -1, choice }: { run: Run; highlight?: number; choice?: {index: number; color: string} }) {
  return <svg className="pixel-image" viewBox="0 0 16 16" role="img" aria-label={`${run.subject}, ${run.alias}, ${run.approach === 'single' ? 'one agent controls the whole image' : modeNames[run.radius]}${choice ? `, your color at ${coord(choice.index)}` : ''}`} shapeRendering="crispEdges">
    {run.colors.map((color, index) => <Fragment key={index}>
      <rect x={index % 16} y={Math.floor(index / 16)} width="1" height="1" fill={rgb(color)} />
      {!color && <path d={`M${index % 16} ${Math.floor(index / 16)}l1 1m0-1l-1 1`} stroke="#0a0f18" strokeWidth=".16" />}
    </Fragment>)}
    {choice && <rect className="user-pixel" x={choice.index % 16} y={Math.floor(choice.index / 16)} width="1" height="1" fill={choice.color} />}
    {highlight >= 0 && <>
      <rect x={highlight % 16 + .06} y={Math.floor(highlight / 16) + .06} width=".88" height=".88" fill="none" stroke="white" strokeWidth=".15" />
      <rect x={highlight % 16 - .08} y={Math.floor(highlight / 16) - .08} width="1.16" height="1.16" fill="none" stroke="#0a0f18" strokeWidth=".1" />
    </>}
  </svg>;
}
function ContactSchema({ radius }: { radius: Mode }) {
  const cells = Array.from({ length: 25 }, (_, i) => ({ x: i % 5, y: Math.floor(i / 5) }));
  const allowed = (x: number, y: number) => Math.max(Math.abs(x - 2), Math.abs(y - 2)) <= radius;
  return <svg className="schema" viewBox="0 0 80 80" role="img" aria-label={`Allowed contact: ${modeNames[radius]}`}>
    {cells.filter(({x,y}) => allowed(x,y) && (x !== 2 || y !== 2)).map(({x,y}) => <line key={`${x}-${y}`} x1="40" y1="40" x2={12+x*14} y2={12+y*14} stroke="#3e7287" strokeWidth="1" />)}
    {cells.map(({x,y}) => <circle key={`${x}-${y}`} cx={12+x*14} cy={12+y*14} r="3.1" fill={x===2 && y===2 ? '#f3cb77' : allowed(x,y) ? '#74d5e8' : '#2b3b50'} />)}
  </svg>;
}
export function ContactCards({ onExplore }: { onExplore: (mode: Mode) => void }) {
  return <div className="contact-cards" id="contact-cards">{houseAliases.map((alias, i) => <article className="contact-card" key={alias}>
    <h3>{modeNames[i]}</h3><p>{i === 0 ? 'Work alone' : '3 discussion rounds'}</p>
    <ContactSchema radius={i as Mode} /><PixelImage run={data.runs[alias]} />
    <div className="card-end"><span>{alias} / 256 PIXELS</span><button onClick={() => onExplore(i as Mode)}>Explore this run <span aria-hidden="true">↗</span></button></div>
  </article>)}</div>;
}
export function Results() {
  const comparisons = [
    { id: 'mario', title: 'Mario', aliases: ['P05', 'P20', 'P21', 'P07'] },
    { id: 'stars', title: 'Exactly five stars', aliases: ['P10', 'P11', 'P16', 'P12'] },
  ];
  return <>{comparisons.map(({id, title, aliases}) => <section className="result-group" key={id} aria-labelledby={`${id}-results-title`}>
    <div className="result-toolbar"><h3 id={`${id}-results-title`}>{title}</h3><span>16 × 16 / MATCHING 3-ROUND NEIGHBOR RUNS</span></div>
    <div id={`${id}-result-cards`} className="result-cards">{aliases.map((alias, i) => <article className={`result-card${i === 3 ? ' control' : ''}`} key={alias}>
      <h4>{i === 3 ? 'One agent' : modeNames[i]}</h4><p>{i === 3 ? 'Whole image / shapes' : i === 0 ? 'One pixel per agent' : '3 discussion rounds'}</p>
      <PixelImage run={data.runs[alias]} /><small>{alias} · 16 × 16 · {data.runs[alias].valid}/256 colors</small>
    </article>)}</div>
    <p className="result-caption">Both neighbor teams have <strong>three discussion rounds</strong>. {id === 'mario'
      ? 'Compare how each team brings the cap, face, and clothing together.'
      : <>Neither shows <strong>five clear, separate stars</strong>. The one-agent reference shows five separate yellow star-like shapes.</>}</p>
  </section>)}</>;
}
export function Exchanges() {
  const scenes = ['HOUSE / 8 NEIGHBORS', 'HOUSE / 24 NEIGHBORS', 'FIVE STARS / 24 NEIGHBORS', 'MARIO / 8 NEIGHBORS'];
  return <div id="exchange-cards" className="exchange-cards">{data.exchanges.map((exchange, index) => <article className="exchange-card" key={exchange.title}>
    <span className="scene-label">0{index + 1} / {scenes[index]}</span><h3>{exchange.title}</h3>
    {[false, true].map(reply => <div key={String(reply)} className={reply ? 'quote-reply' : undefined}>
      <div className="quote-label"><span>{reply ? 'REPLY / ROUND 2' : 'MESSAGE / ROUND 1'}</span><span>({(reply ? exchange.to : exchange.from).join(',')}) → ({(reply ? exchange.from : exchange.to).join(',')})</span></div>
      <blockquote>“{reply ? exchange.reply : exchange.question}”</blockquote>
    </div>)}
  </article>)}</div>;
}
const positions = [136, 39, 226, 98, 156, 23];
const challenges = {
  house: {label: 'House', prompt: 'Draw a house.', alias: 'P14', palette: [['#88cfe7', 'Sky blue'], ['#b43c2d', 'Roof red'], ['#ebcd8a', 'Wall tan'], ['#71401e', 'Door brown'], ['#499c42', 'Grass green']]},
  mario: {label: 'Mario', prompt: 'Draw Mario.', alias: 'P20', palette: [['#e52222', 'Cap red'], ['#1554c0', 'Overalls blue'], ['#f4bc7e', 'Skin peach'], ['#71401e', 'Hair brown'], ['#ffffff', 'White']]},
};
export function PixelChallenge() {
  const [subject, setSubject] = useState<keyof typeof challenges>('house');
  const [position, setPosition] = useState(0);
  const [color, setColor] = useState('#ebcd8a');
  const [revealed, setRevealed] = useState(false);
  const index = positions[position];
  const challenge = challenges[subject], run = data.runs[challenge.alias];
  const actual = run.colors[index];
  const actualHex = actual ? `#${actual.map(channel => channel.toString(16).padStart(2,'0')).join('')}` : 'Unavailable';
  return <div className="pixel-challenge">
    <div className="challenge-heading"><span className="eyebrow">TAKE ONE PIXEL</span><span>TRY THE CONSTRAINT</span></div>
    <div className="segmented challenge-subject" role="group" aria-label="Choose your drawing">
      {(['house','mario'] as const).map(value => <button key={value} aria-pressed={subject === value} onClick={() => {setSubject(value);setRevealed(false);}}>{challenges[value].label}</button>)}
    </div>
    <h3>{challenge.prompt}</h3><p>You control <strong id="challenge-coordinate">pixel {coord(index)}</strong> on a 16 × 16 grid. Choose a color without seeing the rest.</p>
    <div className="challenge-stage" id="challenge-stage">
      {revealed ? <div id="reveal-grid"><PixelImage run={run} highlight={index} choice={{index, color}} /></div>
        : <div id="hidden-grid" className="hidden-grid" aria-hidden="true">{Array.from({ length: 256 }, (_, i) => <span key={i} className={i === index ? 'chosen' : undefined} style={i === index ? {background: color} : undefined} />)}</div>}
    </div>
    {revealed && <div className="color-comparison" aria-label="Compare your pixel with the AI's pixel">
      <div><span className="comparison-swatch" style={{background: color}} aria-hidden="true" /><span>Your color<strong>{color.toUpperCase()}</strong></span></div>
      <div><span className="comparison-swatch" style={{background: rgb(actual)}} aria-hidden="true" /><span>AI’s color<strong>{actualHex.toUpperCase()}</strong></span></div>
    </div>}
    <div className="challenge-palette" role="group" aria-label="Choose a pixel color">
      {challenge.palette.map(([hex, name]) => <button key={hex} style={{'--chip': hex} as CSSProperties} aria-label={name} aria-pressed={color === hex} onClick={() => setColor(hex)} />)}
      <label className="custom-color">Custom<input id="custom-color" type="color" value={color} aria-label="Choose a custom pixel color" onChange={e => setColor(e.target.value)} /></label>
    </div>
    <div className="challenge-actions"><button className="button primary" id="reveal-choice" disabled={revealed} onClick={() => setRevealed(true)}>{revealed ? 'Your pixel in the picture' : <>Reveal the AI’s picture <span aria-hidden="true">↗</span></>}</button>
      <button className="text-link" id="another-pixel" onClick={() => {setPosition(value => (value + 1) % positions.length); setRevealed(false);}}>Try another pixel</button></div>
    <p id="challenge-feedback" className="challenge-feedback" aria-live="polite">{revealed
      ? <>{color.toLowerCase() === actualHex ? <strong>Exact color match. </strong> : null}The <strong>outlined pixel keeps your color</strong>. All other pixels come from the saved {challenge.label} image: 8 neighbors, 3 rounds.</>
      : 'Your choice stays in your browser. There is no single correct color.'}</p>
  </div>;
}
