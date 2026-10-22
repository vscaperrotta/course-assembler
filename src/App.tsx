import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import ChipCanvas from './ChipCanvas'
import './assets/coolicons/coolicons.css'
import { lessons } from './course'
import { createInitialMachine, executeStep } from './cpu'
import type { MachineState } from './cpu'
import { scenarios } from './scenarios'

type Section = 'chapters' | 'tutorial' | 'bits' | 'addresses' | 'sim'
interface ExplainedInstruction { instruction: string; explanation: string }
function hex(value: number): string { return value.toString(16).toUpperCase().padStart(2, '0') }
function binary(value: number): string { return value.toString(2).padStart(8, '0') }
function clampByte(value: number): number { return Math.min(255, Math.max(0, Number.isFinite(value) ? Math.trunc(value) : 0)) }
function formatParagraph(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith('`') && part.endsWith('`')
    ? <code key={index}>{part.slice(1, -1)}</code>
    : part)
}
function explainInstruction(sourceLine: string): ExplainedInstruction | null {
  const instruction = sourceLine.split(';')[0].trim().toUpperCase()
  if (!instruction) return null
  const [mnemonic, operand] = instruction.split(/\s+/)
  const value = operand?.startsWith('#') ? operand.slice(1) : null
  const isImmediate = value !== null
  let explanation: string
  switch (mnemonic) {
    case 'LDA': explanation = isImmediate
      ? `LDA significa “Load Accumulator” (carica nell’accumulatore): copia il valore ${value} direttamente dall’istruzione nel registro A. # dice che ${value} è un valore, non un indirizzo.`
      : `LDA significa “Load Accumulator” (carica nell’accumulatore): legge il contenuto della cella RAM ${operand} e lo copia nel registro A.`; break
    case 'STA': explanation = `STA significa “Store Accumulator” (memorizza l’accumulatore): copia il byte di A nella cella RAM ${operand}. A conserva ancora il suo valore.`; break
    case 'ADD': explanation = isImmediate
      ? `ADD significa “Add” (somma): aggiunge il valore ${value} direttamente scritto nell’istruzione al valore in A. Il risultato resta in A.`
      : `ADD significa “Add” (somma): legge il dato della cella RAM ${operand}, lo aggiunge ad A e lascia il risultato in A.`; break
    case 'SUB': explanation = isImmediate
      ? `SUB significa “Subtract” (sottrai): sottrae da A il valore ${value} scritto nell’istruzione. Il risultato resta in A.`
      : `SUB significa “Subtract” (sottrai): legge il dato della cella RAM ${operand} e lo sottrae da A. Il risultato resta in A.`; break
    case 'JMP': explanation = `JMP significa “Jump” (salta): imposta PC alla riga eseguibile ${operand}. Il conteggio parte da 0.`; break
    case 'JZ': explanation = `JZ significa “Jump if Zero” (salta se zero): se il flag Z vale 1, imposta PC alla riga ${operand}; altrimenti prosegue con la riga successiva.`; break
    case 'HLT': explanation = 'HLT significa “Halt” (ferma): la CPU interrompe l’esecuzione e lascia consultabili i valori raggiunti.'; break
    default: explanation = 'Questa riga contiene un’istruzione del programma.'
  }
  return { instruction, explanation }
}
function Button({ children, onClick, secondary = false, disabled = false }: { children: ReactNode; onClick: () => void; secondary?: boolean; disabled?: boolean }) {
  return <button type="button" className={`action${secondary ? ' secondary' : ''}`} onClick={onClick} disabled={disabled}>{children}</button>
}

export default function App() {
  const [section, setSection] = useState<Section>('chapters')
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeScenario, setActiveScenario] = useState<string | null>(scenarios[3].id)
  const [source, setSource] = useState(scenarios[3].source)
  const [machine, setMachine] = useState<MachineState>(createInitialMachine)
  const [memoryAddress, setMemoryAddress] = useState('20')
  const [isRunning, setIsRunning] = useState(false)
  const [labAddress, setLabAddress] = useState(32)
  const [labValue, setLabValue] = useState(7)
  const [labRam, setLabRam] = useState<readonly number[]>(() => Array<number>(256).fill(0))
  const [labMessage, setLabMessage] = useState('Seleziona una posizione, scrivi un byte e poi leggilo.')
  const [firstByte, setFirstByte] = useState(250)
  const [secondByte, setSecondByte] = useState(10)
  const [byteOperation, setByteOperation] = useState<'add' | 'sub'>('add')
  const [tutorialA, setTutorialA] = useState(12)
  const [tutorialB, setTutorialB] = useState(5)
  const [tutorialOperation, setTutorialOperation] = useState<'ADD' | 'SUB'>('ADD')
  const [tutorialLines, setTutorialLines] = useState<string[]>([])
  const [tutorialInput, setTutorialInput] = useState('')
  const [tutorialFeedback, setTutorialFeedback] = useState('Scrivi la prima istruzione e controlla se la sintassi è corretta.')
  const [tutorialError, setTutorialError] = useState(false)
  const runToken = useRef(0)
  const lesson = lessons[selectedLesson]
  const explainedInstructions = lesson.example.split(/\r?\n/).map(explainInstruction).filter((item): item is ExplainedInstruction => item !== null)
  const scenario = scenarios.find(item => item.id === activeScenario)
  const parsedAddress = Number.parseInt(memoryAddress, 16)
  const memoryPage = Number.isFinite(parsedAddress) && parsedAddress >= 0 && parsedAddress <= 255 ? Math.floor(parsedAddress / 16) * 16 : 0
  const labPage = Math.floor(labAddress / 16) * 16
  const mathematicalResult = byteOperation === 'add' ? firstByte + secondByte : firstByte - secondByte
  const storedResult = ((mathematicalResult % 256) + 256) % 256
  const tutorialPlan = [
    { line: `LDA #${tutorialB}`, purpose: `Carica il secondo numero (${tutorialB}) in A per salvarlo in RAM.`, hint: 'Scrivi LDA, uno spazio, # e il numero B. LDA carica un valore; # lo rende immediato.' },
    { line: 'STA $20', purpose: 'Copia il valore di A nella cella RAM con indirizzo $20.', hint: 'STA scrive sempre A in memoria. Usa uno spazio e l’indirizzo esadecimale $20.' },
    { line: `LDA #${tutorialA}`, purpose: `Carica il primo numero (${tutorialA}) in A.`, hint: 'Come prima: LDA, spazio, # e il numero A.' },
    { line: `${tutorialOperation} $20`, purpose: `${tutorialOperation === 'ADD' ? 'Somma' : 'Sottrae'} ad A il valore conservato in RAM[$20].`, hint: `Scrivi ${tutorialOperation}, uno spazio e $20. Senza #, $20 è usato come indirizzo.` },
    { line: 'STA $21', purpose: 'Copia il risultato in RAM[$21], così resta consultabile.', hint: 'Scrivi STA e l’indirizzo $21, diverso dalla cella che conserva il secondo numero.' },
    { line: 'HLT', purpose: 'Ferma la CPU dopo il calcolo.', hint: 'HLT non vuole operandi: scrivi soltanto HLT.' }
  ]
  const tutorialMath = tutorialOperation === 'ADD' ? tutorialA + tutorialB : tutorialA - tutorialB
  const tutorialResult = ((tutorialMath % 256) + 256) % 256
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [section, selectedLesson])

  function resetMachine(): void { runToken.current += 1; setIsRunning(false); setMachine(createInitialMachine()) }
  function loadProgram(program: string, id: string | null, address = '20'): void {
    resetMachine(); setSource(program); setActiveScenario(id); setMemoryAddress(address); setSection('sim')
  }
  function stepOnce(): void { setMachine(current => executeStep(current, source)) }
  async function runProgram(): Promise<void> {
    const token = runToken.current + 1
    runToken.current = token
    setIsRunning(true)
    let current = machine
    for (let i = 0; i < 256 && !current.halted; i++) {
      if (runToken.current !== token) return
      current = executeStep(current, source)
      setMachine(current)
      if (current.statusKind === 'error') break
      await new Promise<void>(resolve => window.setTimeout(resolve, 320))
    }
    if (!current.halted && current.statusKind !== 'error' && runToken.current === token) {
      setMachine({ ...current, statusMessage: 'Limite di 256 passi raggiunto. Controlla i salti del programma.', statusKind: 'error' })
    }
    if (runToken.current === token) setIsRunning(false)
  }
  function chooseLesson(index: number): void { setSelectedLesson(index); setSection('chapters') }
  function writeLab(): void {
    const next = [...labRam]; next[labAddress] = labValue; setLabRam(next)
    setLabMessage(`Scrittura: indirizzo $${hex(labAddress)} selezionato; il byte $${hex(labValue)} è stato copiato in quella posizione.`)
  }
  function readLab(): void { setLabMessage(`Lettura: la posizione $${hex(labAddress)} contiene $${hex(labRam[labAddress])}, cioè ${labRam[labAddress]} in decimale.`) }
  function resetTutorial(): void {
    setTutorialLines([]); setTutorialInput(''); setTutorialFeedback('Scrivi la prima istruzione e controlla se la sintassi è corretta.'); setTutorialError(false)
  }
  function checkTutorialLine(): void {
    const current = tutorialPlan[tutorialLines.length]
    if (!current) return
    const typed = tutorialInput.trim().replace(/\s+/g, ' ').toUpperCase()
    if (typed !== current.line.toUpperCase()) {
      setTutorialFeedback('Questa riga non corrisponde ancora. Controlla il comando, lo spazio e il ruolo dell’operando; apri il suggerimento se serve.')
      setTutorialError(true)
      return
    }
    const next = [...tutorialLines, current.line]
    setTutorialLines(next); setTutorialInput(''); setTutorialError(false)
    setTutorialFeedback(next.length === tutorialPlan.length ? `Programma completo. ${tutorialA} ${tutorialOperation === 'ADD' ? '+' : '−'} ${tutorialB} = ${tutorialMath}; nel byte da 8 bit restano ${tutorialResult} ($${hex(tutorialResult)}), in A e in RAM[$21].` : 'Corretto. La riga è stata aggiunta: ora segui il nuovo passaggio.')
  }

  return <>
    <header className="top"><div className="brand"><span className="brandmark" aria-hidden="true">A8</span> OFFICINA 8 BIT <span className="chip">ATLANTE INTERATTIVO</span></div><div className="top-right">CPU DIDATTICA · OFFLINE</div></header>
    <div className={`layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className="rail" aria-label="Indice dei capitoli"><div className="rail-heading"><p className="rail-label">Indice · scorri e scegli liberamente</p><button className="sidebar-toggle" type="button" aria-label={sidebarCollapsed ? 'Espandi la sidebar dei capitoli' : 'Compatta la sidebar dei capitoli'} aria-expanded={!sidebarCollapsed} aria-controls="chapter-navigation" title={sidebarCollapsed ? 'Espandi la sidebar' : 'Compatta la sidebar'} onClick={() => setSidebarCollapsed(collapsed => !collapsed)}><span className={`iconfont ${sidebarCollapsed ? 'ci-Chevron_Right' : 'ci-Chevron_Left'}`} aria-hidden="true" /><span className="toggle-label" aria-hidden="true">{sidebarCollapsed ? 'Mostra capitoli' : 'Nascondi capitoli'}</span><span className="sr-only">{sidebarCollapsed ? 'Espandi sidebar' : 'Compatta sidebar'}</span></button></div><nav className="lesson-list" id="chapter-navigation">{lessons.map((item, index) => <button key={item.title} className={`lesson-link${selectedLesson === index && section === 'chapters' ? ' active' : ''}`} aria-label={`Capitolo ${index + 1}: ${item.title}`} title={sidebarCollapsed ? item.title : undefined} onClick={() => chooseLesson(index)}><b>{String(index + 1).padStart(2, '0')}</b><span>{item.title}</span></button>)}</nav><div className="rail-note"><strong>COME STUDIARE</strong>Leggi un capitolo, prevedi il risultato e apri il suo esempio nel simulatore. Puoi saltare liberamente fra i capitoli.</div></aside>
      <main className="content">
        <section className="hero"><div><div className="eyebrow">Fondamenti dei calcolatori · da zero</div><h1>Dai bit ai programmi. Un passo alla volta.</h1><p>Capitoli brevi, esempi ragionati e una CPU a 8 bit per vedere come indirizzi, dati e istruzioni diventano operazioni hardware.</p></div></section>
        <nav className="tabs" aria-label="Sezioni"><button className={`tab${section === 'chapters' ? ' active' : ''}`} onClick={() => setSection('chapters')}>Capitoli</button><button className={`tab${section === 'tutorial' ? ' active' : ''}`} onClick={() => setSection('tutorial')}>Tutorial calcolatrice</button><button className={`tab${section === 'bits' ? ' active' : ''}`} onClick={() => setSection('bits')}>Calcolatore di byte</button><button className={`tab${section === 'addresses' ? ' active' : ''}`} onClick={() => setSection('addresses')}>Atlante degli indirizzi</button><button className={`tab${section === 'sim' ? ' active' : ''}`} onClick={() => setSection('sim')}>Simulazioni</button></nav>

        {section === 'chapters' && <article className="lesson"><div className="eyebrow">{lesson.tag} · CAPITOLO {String(selectedLesson + 1).padStart(2, '0')} / {String(lessons.length).padStart(2, '0')}</div><h2>{lesson.title}</h2><p className="lead">{lesson.lead}</p>{lesson.sections.map(block => <section className="chapter-block" key={block.heading}><h3>{block.heading}</h3>{block.paragraphs.map(paragraph => <p key={paragraph}>{formatParagraph(paragraph)}</p>)}{block.terms && <aside className="term-notes" aria-label={`Parole e sigle: ${block.heading}`}><h4>Parole e sigle di questo passaggio</h4><dl>{block.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></aside>}</section>)}<div className="example-heading"><h3>Esempio da seguire</h3><span>Prima prevedi, poi verifica</span></div><pre className="code">{lesson.example}</pre><aside className="instruction-breakdown"><h3>Che cosa significa ogni riga?</h3><p className="breakdown-intro">Le istruzioni si chiamano mnemonici: abbreviazioni leggibili per noi. La CPU esegue l’azione descritta; l’operando dopo il comando le dice quale valore o posizione usare.</p><ol>{explainedInstructions.map(({ instruction, explanation }, index) => <li key={`${index}-${instruction}`}><code>{instruction}</code><span>{explanation}</span></li>)}</ol></aside><p className="observation"><strong>Che cosa osservare.</strong> {lesson.observation}</p><div className="callout"><strong>Da ricordare.</strong> {lesson.note}</div><div className="lesson-actions"><Button secondary disabled={selectedLesson === 0} onClick={() => chooseLesson(selectedLesson - 1)}>← Capitolo precedente</Button><Button onClick={() => loadProgram(lesson.example, null)}>Simula questo esempio →</Button><Button secondary disabled={selectedLesson === lessons.length - 1} onClick={() => chooseLesson(selectedLesson + 1)}>Capitolo successivo →</Button></div></article>}

        {section === 'tutorial' && <section className="reference tutorial"><div className="eyebrow">Esercizio guidato · scrivi un programma</div><h2>Costruiamo una calcolatrice</h2><p className="lead">Scriverai sei istruzioni, una alla volta. La calcolatrice prende due numeri, li somma o sottrae e lascia il risultato nella RAM. Prova a scrivere la riga prima di aprire il suggerimento.</p><div className="tutorial-model"><strong>Prima, la grammatica della nostra CPU</strong><p><code>COMANDO operando ; commento</code></p><p><b>COMANDO</b> è LDA, STA, ADD, SUB o HLT. <b>Spazio</b> separa comando e operando. <b>#numero</b> indica un valore scritto nel programma; <b>$indirizzo</b> indica una cella RAM. <b>;</b> apre un commento, che viene ignorato.</p><p>Assembly cambia da processore a processore. Qui scriviamo la sintassi precisa del nostro simulatore: non supporta etichette e usa numeri di riga nei salti.</p></div><div className="tutorial-inputs"><label>Numero A (0–255)<input type="number" min="0" max="255" value={tutorialA} onChange={event => { setTutorialA(clampByte(Number(event.target.value))); resetTutorial() }} /></label><label>Operazione<select value={tutorialOperation} onChange={event => { setTutorialOperation(event.target.value as 'ADD' | 'SUB'); resetTutorial() }}><option value="ADD">Somma A + B</option><option value="SUB">Sottrai A − B</option></select></label><label>Numero B (0–255)<input type="number" min="0" max="255" value={tutorialB} onChange={event => { setTutorialB(clampByte(Number(event.target.value))); resetTutorial() }} /></label></div><div className="tutorial-layout"><ol className="tutorial-steps">{tutorialPlan.map((item, index) => <li key={item.line} className={`${index < tutorialLines.length ? 'done' : index === tutorialLines.length ? 'current' : ''}`}><span className="step-number">{index < tutorialLines.length ? '✓' : index + 1}</span><div><strong>{item.purpose}</strong><code>{index < tutorialLines.length ? tutorialLines[index] : index === tutorialLines.length ? '…' : 'istruzione da scrivere'}</code></div></li>)}</ol><div className="tutorial-workbench"><div className="workbench-head"><label htmlFor="tutorial-line">{tutorialLines.length < tutorialPlan.length ? `Istruzione ${tutorialLines.length + 1} di ${tutorialPlan.length}` : 'Programma completato'}</label><span>{tutorialLines.length}/{tutorialPlan.length}</span></div>{tutorialLines.length < tutorialPlan.length ? <form onSubmit={event => { event.preventDefault(); checkTutorialLine() }}><label className="sr-only" htmlFor="tutorial-line">Scrivi la prossima istruzione Assembly</label><input className="tutorial-editor" id="tutorial-line" autoComplete="off" spellCheck={false} value={tutorialInput} onChange={event => setTutorialInput(event.target.value)} placeholder="Scrivi qui, per esempio: LDA #5"/><div className="controls"><Button onClick={checkTutorialLine} disabled={!tutorialInput.trim()}>Controlla riga →</Button><Button secondary onClick={resetTutorial}>Ricomincia</Button></div></form> : <div className="tutorial-finish"><strong>Hai scritto la calcolatrice.</strong><p>Il risultato atteso è {tutorialResult} (${hex(tutorialResult)}). Esegui il tuo programma passo per passo e controlla A e RAM[$21].</p><Button onClick={() => loadProgram(tutorialLines.join('\n'), null)}>Prova il programma nella CPU →</Button><Button secondary onClick={resetTutorial}>Scrivilo di nuovo</Button></div>}<p className={`tutorial-feedback${tutorialError ? ' error' : ''}`} role="status" aria-live="polite">{tutorialFeedback}</p>{tutorialLines.length < tutorialPlan.length && <details className="tutorial-hint"><summary>Mostra suggerimento per questa riga</summary><p>{tutorialPlan[tutorialLines.length].hint}</p><code>{tutorialPlan[tutorialLines.length].line}</code></details>}</div></div><div className="callout"><strong>Che cosa stai imparando.</strong> La prima istruzione mette B in A; la seconda la conserva in RAM; la terza carica A; la quarta esegue il calcolo; la quinta salva il risultato; l’ultima ferma la CPU. L’ordine conta perché A può contenere un solo byte alla volta.</div></section>}

        {section === 'bits' && <section className="reference"><div className="eyebrow">Esperimento guidato · rappresentare e calcolare</div><h2>Quanto contiene un byte?</h2><p className="lead">Cambia i due numeri e osserva i loro otto bit. Il calcolatore mostra sia il risultato matematico sia il byte che A può conservare.</p><div className="chapter-block"><h3>Leggere gli otto interruttori</h3><p>Da sinistra a destra i bit pesano 128, 64, 32, 16, 8, 4, 2 e 1. Premi un bit del primo numero per accenderlo o spegnerlo. La somma dei pesi accesi dà il valore decimale; due cifre esadecimali descrivono gli stessi otto bit.</p></div><div className="byte-lab"><div className="byte-inputs"><label>Primo byte · A<input type="number" min="0" max="255" value={firstByte} onChange={event => setFirstByte(clampByte(Number(event.target.value)))} /></label><label>Operazione<select value={byteOperation} onChange={event => setByteOperation(event.target.value as 'add' | 'sub')}><option value="add">Somma +</option><option value="sub">Sottrai −</option></select></label><label>Secondo byte<input type="number" min="0" max="255" value={secondByte} onChange={event => setSecondByte(clampByte(Number(event.target.value)))} /></label></div><div className="bit-rows"><div className="bit-row"><span>A · ${hex(firstByte)}</span><div className="bit-cells">{Array.from({ length: 8 }, (_, index) => { const mask = 1 << (7 - index); return <button key={mask} className={`bit-cell${firstByte & mask ? ' on' : ''}`} aria-label={`Bit di peso ${mask}: ${firstByte & mask ? '1' : '0'}. Premi per cambiarlo`} onClick={() => setFirstByte(firstByte ^ mask)}><small>{mask}</small><strong>{firstByte & mask ? 1 : 0}</strong></button> })}</div></div><div className="bit-row"><span>OPERANDO · ${hex(secondByte)}</span><div className="bit-cells">{binary(secondByte).split('').map((bit, index) => <div className={`bit-cell${bit === '1' ? ' on' : ''}`} key={index}><small>{1 << (7 - index)}</small><strong>{bit}</strong></div>)}</div></div><div className="bit-row result"><span>RISULTATO IN A · ${hex(storedResult)}</span><div className="bit-cells">{binary(storedResult).split('').map((bit, index) => <div className={`bit-cell${bit === '1' ? ' on' : ''}`} key={index}><small>{1 << (7 - index)}</small><strong>{bit}</strong></div>)}</div></div></div><div className="calculation"><strong>{firstByte} {byteOperation === 'add' ? '+' : '−'} {secondByte} = {mathematicalResult}</strong><span>Nel registro da 8 bit rimane <b>{storedResult} = ${hex(storedResult)}</b>.</span><p>{mathematicalResult < 0 || mathematicalResult > 255 ? `Il risultato matematico è fuori dall’intervallo 0–255. Si conserva il resto modulo 256: ${storedResult}.` : 'Il risultato entra in un byte: tutti gli otto bit possono essere conservati.'} {storedResult === 0 ? 'Z diventa 1.' : 'Z resta 0.'}</p></div></div><div className="callout"><strong>Limite del modello.</strong> La sottrazione negativa è mostrata come byte senza segno. Interpretare lo stesso byte come numero negativo richiederebbe una convenzione come il complemento a due.</div><div className="lesson-actions"><Button onClick={() => loadProgram(`LDA #${firstByte}\n${byteOperation === 'add' ? 'ADD' : 'SUB'} #${secondByte}\nHLT`, null)}>Esegui questo calcolo nella CPU →</Button></div></section>}

        {section === 'sim' && <section className="simulator"><div className="sim-head"><div className="eyebrow">Laboratorio · casi da confrontare</div><h2>Prevedi. Esegui. Spiega.</h2><p>Scegli un caso, formula una risposta alla domanda e premi «Passo». Puoi anche modificare il programma.</p></div>
          <div className="scenario-picker" aria-label="Casi di simulazione">{scenarios.map(item => <button key={item.id} className={`scenario-button${activeScenario === item.id ? ' active' : ''}`} onClick={() => loadProgram(item.source, item.id, item.address)}>{item.title}</button>)}</div>
          {scenario && <div className="scenario-guide"><div><span className="mini-label">DOMANDA</span><strong>{scenario.question}</strong></div><div><span className="mini-label">OSSERVA</span><p>{scenario.watch}</p></div><details><summary>Mostra il risultato atteso</summary><p>{scenario.result}</p></details></div>}
          <div className="sim-workspace"><div className="sim-visual"><div className="chip-frame"><ChipCanvas machine={machine} memoryPage={memoryPage} /></div><aside className="chip-notes"><div><div className="eyebrow">Hardware, senza scorciatoie</div><h3>Una freccia indica un trasferimento logico.</h3><p>Per leggere la RAM, la CPU presenta un indirizzo, chiede una lettura e acquisisce il dato restituito. Per scrivere presenta indirizzo e dato, poi attiva la scrittura. I registri sono circuiti interni; la RAM dati è distinta nel disegno.</p><p>Questo schema non mostra tensioni, tempi di clock, cache o la codifica binaria delle istruzioni. Ogni clic rappresenta un’istruzione completa.</p></div><div className="chip-story"><strong>Questo passo</strong><p>{machine.explanation}</p></div><div className="chip-legend"><span><i className="legend-dot" /> percorso usato nel passo</span><span>▪ bit impostato a 1</span><span>PC = riga eseguibile, da 0</span></div></aside></div>
            <div className="sim-controls"><div className="workbench"><div className="workbench-head"><label htmlFor="program">Programma Assembly</label><span>una istruzione per riga</span></div><textarea className="editor" id="program" spellCheck={false} value={source} disabled={isRunning} onChange={event => { setSource(event.target.value); setActiveScenario(null); resetMachine() }} /><div className="controls"><Button onClick={stepOnce} disabled={isRunning}>▶ Passo</Button><Button onClick={() => void runProgram()} disabled={isRunning}>▶▶ Esegui tutto</Button><Button secondary onClick={resetMachine}>↺ Riavvia</Button></div><div className={`status ${machine.statusKind}`} role="status" aria-live="polite">{machine.statusMessage}</div><p className="editor-help"># = valore immediato · $ = numero esadecimale · ; = commento. I salti contano le righe eseguibili da 0.</p></div>
              <div className="workbench"><div className="workbench-head"><span>Stato del processore</span><span>{machine.halted ? 'FERMA' : machine.lines.length === 0 ? 'PRONTA' : 'ATTIVA'}</span></div><div className="cpu-grid"><div className="reg"><span>Accumulatore A</span><strong>{hex(machine.a)}</strong><small>{machine.a} dec · {binary(machine.a)}₂</small></div><div className="reg"><span>Contatore PC</span><strong>{hex(machine.pc)}</strong><small>prossima riga: {machine.pc}</small></div><div className="reg"><span>Zero flag Z</span><strong>{machine.z}</strong><small>{machine.z ? 'A è zero' : 'A non è zero'}</small></div><div className="reg"><span>Esecuzione</span><strong className="run-state">{machine.halted ? 'HALT' : 'READY'}</strong><small>{machine.instruction || 'in attesa'}</small></div><div className="memory-wrap"><div className="memory-top"><span>RAM · PAGINA</span><label htmlFor="address">Vai a $ <input id="address" value={memoryAddress} maxLength={2} aria-label="Indirizzo della pagina RAM in esadecimale" onChange={event => setMemoryAddress(event.target.value.replace(/[^\da-f]/gi, '').slice(0, 2).toUpperCase())} /></label></div><div className="memory">{Array.from({ length: 16 }, (_, index) => { const address = memoryPage + index; return <div key={address} className={`cell${machine.changed.includes(address) ? ' changed' : ''}`}><span>${hex(address)} · indirizzo</span><strong>${hex(machine.ram[address])}</strong></div> })}</div></div></div></div></div></div>
        </section>}

        {section === 'addresses' && <section className="reference"><div className="eyebrow">Esperimento guidato · posizione e contenuto</div><h2>Perché “indirizzo”?</h2><p className="lead">Un indirizzo identifica <em>dove</em> si trova una cella. Il suo contenuto dice <em>che cosa</em> c’è in quella cella adesso. Sono due numeri con ruoli diversi.</p><div className="chapter-block"><h3>Una posizione, un byte</h3><p>La CPU didattica può scegliere 256 posizioni con un indirizzo da 8 bit. La posizione $20 è la numero 32 in decimale; non contiene necessariamente il numero 32. Puoi scriverci 7, 42 o 0, e l’indirizzo resta $20.</p><p>In hardware i bit dell’indirizzo attivano circuiti di selezione. Per una lettura la memoria restituisce il dato sulle linee dati; per una scrittura riceve il nuovo dato. Questa dimostrazione è indipendente dalla RAM della simulazione, così puoi fare esperimenti senza alterare un programma.</p></div><div className="lab"><div className="lab-inputs"><label>Indirizzo in decimale (0–255)<input type="number" min="0" max="255" value={labAddress} onChange={event => setLabAddress(clampByte(Number(event.target.value)))} /></label><label>Dato da scrivere (0–255)<input type="number" min="0" max="255" value={labValue} onChange={event => setLabValue(clampByte(Number(event.target.value)))} /></label><div className="controls"><Button onClick={writeLab}>Scrivi il dato</Button><Button secondary onClick={readLab}>Leggi la cella</Button></div></div><div className="lab-bits"><div><span>INDIRIZZO · DOVE</span><strong>${hex(labAddress)}</strong><code>{binary(labAddress)}₂</code></div><div className="lab-arrow" aria-hidden="true">→</div><div><span>CONTENUTO · CHE COSA</span><strong>${hex(labRam[labAddress])}</strong><code>{binary(labRam[labAddress])}₂</code></div></div><p className="lab-message" role="status">{labMessage}</p><div className="lab-grid">{Array.from({ length: 16 }, (_, index) => { const address = labPage + index; return <button key={address} className={`lab-cell${address === labAddress ? ' active' : ''}`} onClick={() => setLabAddress(address)}><span>${hex(address)} · indirizzo</span><strong>${hex(labRam[address])}</strong></button> })}</div></div><div className="callout"><strong>Confronto utile.</strong> <code>LDA #32</code> carica il numero 32. <code>LDA $20</code> legge la cella con indirizzo $20, cioè 32 in decimale, e carica il suo contenuto. Il # cambia il ruolo dell’operando; il $ indica soltanto la base 16.</div><div className="lesson-actions"><Button onClick={() => loadProgram(scenarios[2].source, scenarios[2].id)}>Osserva una lettura nella CPU →</Button></div></section>}
        <div className="footer">MODELLO DIDATTICO · 8 BIT · LDA · STA · ADD · SUB · JMP · JZ · HLT</div>
      </main>
    </div>
  </>
}
