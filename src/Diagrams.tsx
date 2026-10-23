import type { ReactNode } from 'react'
import { translate } from './language'
import type { Language } from './language'

type DiagramKind = 'machine' | 'bits' | 'memory' | 'cycle' | 'encoding' | 'flow' | 'architectures' | 'branches' | 'pipeline'

function Box({ x, y, w, title, detail, accent = false }: { x: number; y: number; w: number; title: string; detail: string; accent?: boolean }) {
  return <g><rect x={x} y={y} width={w} height="74" rx="10" className={accent ? 'diagram-box accent' : 'diagram-box'} /><text x={x + 16} y={y + 29} className="diagram-title">{title}</text><text x={x + 16} y={y + 53} className="diagram-detail">{detail}</text></g>
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className="diagram-arrow" markerEnd="url(#arrowhead)" />
}

export default function Diagram({ kind, caption, language = 'en' }: { kind: DiagramKind | string; caption?: ReactNode; language?: Language }) {
  const t = (key: string, values: readonly unknown[] = []) => translate(language, key, values)
  const labels: Record<string, string> = {
    machine: t("Data flowing between input, CPU, memory, and output"),
    bits: t("Eight bits grouped into one byte"),
    memory: t("Memory cells with distinct addresses and contents"),
    cycle: t("Fetch, decode, and execute cycle"),
    encoding: t("An LMC mnemonic converted into machine code"),
    flow: t("The path of data through an LMC program"),
    architectures: t("Comparison of LMC, x86-64, and ARM"),
    branches: t("A comparison followed by a conditional branch"),
    pipeline: t("From a C program to machine instructions and bytes"),
  }
  const label = labels[kind] ?? t("Teaching diagram")
  let content: ReactNode

  if (kind === 'machine' || kind === 'flow') content = <><Box x={30} y={82} w={150} title={t("INPUT")} detail={t("incoming number")} /><Box x={275} y={82} w={190} title="CPU" detail={t("register + calculation")} accent /><Box x={610} y={25} w={190} title="RAM" detail={t("numbered cells")} /><Box x={610} y={139} w={190} title={t("OUTPUT")} detail={t("result")} /><Arrow x1={182} y1={119} x2={267} y2={119} /><Arrow x1={467} y1={102} x2={602} y2={65} /><Arrow x1={603} y1={86} x2={468} y2={125} /><Arrow x1={467} y1={142} x2={602} y2={176} /><text x="30" y="224" className="diagram-note">{t("CPU reads and writes to RAM; the output receives the result from CPU.")}</text></>
  else if (kind === 'bits') content = <><text x="36" y="55" className="diagram-note">{t("One byte: eight positions with different weights")}</text>{[128, 64, 32, 16, 8, 4, 2, 1].map((weight, index) => <g key={weight}><rect x={35 + index * 100} y="80" width="84" height="75" rx="8" className={index === 5 || index === 7 ? 'diagram-box accent' : 'diagram-box'} /><text x={59 + index * 100} y="109" className="diagram-detail">{weight}</text><text x={65 + index * 100} y="142" className="diagram-title">{index === 5 || index === 7 ? '1' : '0'}</text></g>)}<text x="36" y="210" className="diagram-note">{t("00000101₂ = 4 + 1 = 5. LMC instead shows three-digit decimal cells.")}</text></>
  else if (kind === 'memory') content = <><Box x={50} y={80} w={185} title={t("ADDRESS 04")} detail={t("where to read")} accent /><Arrow x1={239} y1={117} x2={314} y2={117} /><Box x={325} y={80} w={180} title={t("CELL 04")} detail={t("contains 012")} /><Arrow x1={509} y1={117} x2={584} y2={117} /><Box x={595} y={80} w={210} title={t("ACCUMULATOR")} detail={t("receives 012")} /><text x="50" y="211" className="diagram-note">{t("04 identifies the position; 012 is the value that can change.")}</text></>
  else if (kind === 'cycle') content = <><Box x={45} y={82} w={215} title={t("1 · FETCH")} detail="PC → MAR → MDR → CIR" accent /><Arrow x1={265} y1={119} x2={316} y2={119} /><Box x={325} y={82} w={215} title={t("2 · DECODE")} detail={t("identifies the instruction")} /><Arrow x1={545} y1={119} x2={596} y2={119} /><Box x={605} y={82} w={215} title={t("3 · EXECUTE")} detail={t("updates the state")} /><text x="46" y="211" className="diagram-note">{t("Fetch increments PC; a branch can then assign it another address.")}</text></>
  else if (kind === 'encoding') content = <><Box x={55} y={80} w={220} title="LDA NUM" detail={t("assembler source")} /><Arrow x1={280} y1={117} x2={356} y2={117} /><Box x={365} y={80} w={220} title="NUM = 03" detail={t("resolve the label")} /><Arrow x1={590} y1={117} x2={666} y2={117} /><Box x={675} y={80} w={150} title="503" detail="5 + 03" accent /><text x="55" y="211" className="diagram-note">{t("The CPU reads 503 from memory: 5 identifies LDA and 03 identifies the data cell.")}</text></>
  else if (kind === 'architectures') content = <><Box x={40} y={82} w={245} title="LMC" detail={t("100 cells · 3 digits")} /><Box x={310} y={82} w={245} title="x86-64" detail={t("registers · variable bytes")} accent /><Box x={580} y={82} w={245} title="ARM" detail={t("other ISA · other codes")} /><text x="40" y="212" className="diagram-note">{t("Same purpose: execute instructions. Syntax and machine codes change with ISA.")}</text></>
  else if (kind === 'branches') content = <><Box x={40} y={82} w={215} title={t("COMPARE")} detail="SUB in LMC · CMP in x86" /><Arrow x1={260} y1={119} x2={321} y2={119} /><Box x={330} y={82} w={200} title={t("RESULT")} detail={t("zero or negative?")} accent /><Arrow x1={535} y1={119} x2={596} y2={119} /><Box x={605} y={82} w={210} title={t("BRANCH")} detail="BRP or JG" /><text x="40" y="211" className="diagram-note">{t("A branch changes the next instruction only when its condition is true.")}</text></>
  else content = <><Box x={40} y={82} w={175} title="C" detail={t("return a + b")} /><Arrow x1={220} y1={119} x2={272} y2={119} /><Box x={280} y={82} w={175} title="ASSEMBLY" detail="mov · add · ret" /><Arrow x1={460} y1={119} x2={512} y2={119} /><Box x={520} y={82} w={145} title="BYTE" detail="48 89 F8…" accent /><Arrow x1={670} y1={119} x2={722} y2={119} /><Box x={730} y={82} w={110} title="CPU" detail={t("executes")} /><text x="40" y="211" className="diagram-note">{t("The compiler can choose multiple correct translations of the same C function.")}</text></>

  return <figure className="diagram-figure" tabIndex={0}><svg viewBox="0 0 860 245" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet"><defs><marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#9af0cf" /></marker></defs>{content}</svg><figcaption>{caption ?? label}<span className="diagram-swipe-hint">{t("Scroll the diagram to the right to see all the parts →")}</span></figcaption></figure>
}
