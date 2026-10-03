import { useState } from 'react';
import { ContactCards, Exchanges, PixelChallenge, Results } from './Content';
import { HeroArt } from './NetworkCanvas';
import Network from './Network';
import { ReadingProgress, usePageEffects } from './effects';
import type { Mode } from './types';

export default function App() {
  const [mode, setMode] = useState<Mode>(1);
  const [revision, setRevision] = useState(0);
  const { scrolled, active } = usePageEffects();
  const explore = (next: Mode) => {
    setMode(next);
    setRevision(value => value + 1);
    document.getElementById('network')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  return <>

<ReadingProgress />
<a className="skip" href="#main">Skip to content</a>
<header className={`topbar${scrolled ? " is-scrolled" : ""}`}>
  <a className="brand" href="#top" aria-label="Isolated Agents, Local Communication, back to top">
    <svg viewBox="0 0 36 36" aria-hidden="true"><path d="M7 26 18 7l11 19H7"/><circle cx="7" cy="26" r="4"/><circle cx="29" cy="26" r="4"/><circle cx="18" cy="7" r="4"/></svg>
    <span>ISOLATED AGENTS<span>LOCAL COMMUNICATION</span></span>
  </a>
  <nav aria-label="Main navigation"><a href="#setup" aria-current={active === "setup" ? "location" : undefined}>The setup</a><a href="#network" aria-current={active === "network" ? "location" : undefined}>The network</a><a href="#results" aria-current={active === "results" ? "location" : undefined}>The results</a></nav>
  <a className="mobile-explore" href="#network">Explore <span aria-hidden="true">↓</span></a>
</header>
<main id="main">
  <section id="top" className="hero wrap">
    <div className="hero-copy">
      <p className="eyebrow"><span className="status-dot"></span> AN EXPERIMENT IN COORDINATION</p>
      <h1>256 agents.<br />One picture.<br /><em>No shared view.</em></h1>
      <p className="hero-deck">Each AI agent controls <strong>one pixel</strong>. It knows what to draw and where its pixel belongs. It <strong>cannot see the canvas</strong>.</p>
      <p className="hero-question">What happens when they can talk to their neighbors?</p>
      <div className="hero-actions"><a className="button primary" href="#network">Explore the network <span aria-hidden="true">↓</span></a><a className="text-link" href="#your-turn">Try one pixel <span aria-hidden="true">↗</span></a></div>
      <div className="byline"><span className="avatar" aria-hidden="true">ML</span><div><strong>Mason Lewis</strong><span>A visual exploration</span></div></div>
    </div>
    <HeroArt />
  </section>
  <div className="chapter-divider wrap"><span>FROM ISOLATION TO COORDINATION</span><span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></div>

  <section id="setup" className="chapter wrap">
    <div className="section-heading"><div><p className="eyebrow">01 / THE SETUP</p><h2>One task. One pixel.<br /><em>A limited view.</em></h2></div><p>All 256 agents use the <strong>same AI model</strong>, each in a <strong>private conversation</strong>. No drawing plan, palette, or team leader is supplied.</p></div>
    <div className="rules">
      <article><span className="rule-number">01</span><h3>What each agent gets</h3><p>The subject, the <strong>16 × 16 grid size</strong>, and <strong>its own coordinate</strong>. For example: draw a house; color pixel (8, 8).</p></article>
      <article><span className="rule-number">02</span><h3>What stays hidden</h3><p>The <strong>whole canvas</strong> and other pixels’ actual colors. An agent can receive color suggestions in messages, but it cannot inspect another pixel.</p></article>
      <article><span className="rule-number">03</span><h3>What can travel</h3><p>Short messages to <strong>chosen neighbors</strong>, delivered <strong>next round</strong>. Agents can ask, propose, disagree, reply, or relay a plan.</p></article>
    </div>
    <div className="subheading"><h3>Three ways to work on the same house</h3><span>ACTUAL SAVED RESULTS</span></div>
    <ContactCards onExplore={explore} />
    <p className="small-note">Contact can be horizontal, vertical, or diagonal. Edge agents have fewer neighbors. Both neighbor teams allow three discussion rounds, then a final color choice.</p>
    <aside className="takeaway"><p className="eyebrow">THE COORDINATION CHALLENGE</p><p>Could <strong>256 people</strong> build <strong>one picture together</strong>?</p><span>Imagine agreeing on what to create with <strong>no shared view</strong>. Each person has zero, eight, or 24 nearby contacts.</span></aside>
  </section>

  <section id="network" className="chapter network-section">
    <div className="wrap">
      <div className="section-heading"><div><p className="eyebrow">02 / FOLLOW THE CONVERSATION</p><h2>Small conversations.<br /><em>A connected team.</em></h2></div><p>These are <strong>actual message links</strong> from the house runs. Select an agent to see who it contacted and read its messages.</p></div>
      <Network key={`${mode}-${revision}`} mode={mode} onModeChange={setMode} />
      <p className="small-note">Each message counts once per recipient. A message sent to eight neighbors counts as eight sends. Wider contact changes the network; these examples do not establish that it always improves the result.</p>
    </div>
  </section>

  <section id="results" className="chapter wrap">
    <div className="section-heading"><div><p className="eyebrow">03 / THE WHOLE PICTURE</p><h2>Contact does not<br /><em>guarantee success.</em></h2></div><p>Sharing a plan is one challenge. Making all the pieces fit is another. The final image shows the difference.</p></div>
    <Results />
    <p className="small-note">The one-agent reference controls the whole canvas and draws with shapes. It has a different drawing interface. Crosses mark pixels with no accepted color.</p>
  </section>

  <section id="conversations" className="chapter wrap">
    <div className="section-heading"><div><p className="eyebrow">04 / IN THEIR OWN WORDS</p><h2>They ask. They agree.<br /><em>They correct each other.</em></h2></div><p>Four real exchanges, copied from the saved messages. In each pair, the recipient received the first message before sending its reply.</p></div>
    <Exchanges />
    <p className="small-note">House and star exchanges come from the runs shown here. The Mario exchange comes from an earlier two-round run; the Mario images above use the updated three-round runs.</p>
  </section>

  <section id="your-turn" className="chapter human-section">
    <div className="wrap human-grid">
      <div><p className="eyebrow">05 / YOUR TURN</p><h2>Now imagine<br /><em>256 people.</em></h2><p className="human-deck">No one sees the whole picture. Every person controls one small part. How do they <strong>agree on a plan</strong> and make their decisions <strong>fit together</strong>?</p><p>The interesting part is the <strong>coordination</strong>: local conversations shaping one shared result.</p></div>
      <PixelChallenge />
    </div>
  </section>
</main>
<footer className="wrap footer"><div><strong>Mason Lewis</strong></div><p>ISOLATED AGENTS, LOCAL COMMUNICATION</p><a href="#top">Back to top <span aria-hidden="true">↑</span></a></footer>

  </>;
}
