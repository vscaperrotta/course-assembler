export const MEMORY_SIZE = 100
export type Phase = 'fetch' | 'decode' | 'execute' | 'waiting' | 'halted' | 'error'
export interface SourceRow { address: number; line: number; text: string; label?: string; word: number; kind: 'code' | 'data' }
export interface Program { memory: number[]; rows: SourceRow[]; source: string }
export interface MachineState {
  program: Program
  memory: number[]
  pc: number
  acc: number
  negative: boolean
  overflow: boolean
  cir: number | null
  mar: number | null
  mdr: number | null
  phase: Phase
  currentAddress: number | null
  input: number[]
  output: number[]
  steps: number
  trace: string[]
  message: string
  changedAddress: number | null
}
const ARG_OPS: Record<string, number> = { ADD: 100, SUB: 200, STA: 300, LDA: 500, BRA: 600, BRZ: 700, BRP: 800 }
const NO_ARG: Record<string, number> = { HLT: 0, INP: 901, OUT: 902 }
const OPS = new Set([...Object.keys(ARG_OPS), ...Object.keys(NO_ARG), 'DAT'])
const dec = (value: number, width = 3) => String(value).padStart(width, '0')
function error(line: number, message: string): never { throw new Error(`Riga ${line}: ${message}`) }
function decimal(token: string, line: number, maximum: number): number {
  if (!/^\d+$/.test(token)) error(line, `«${token}» non è un numero decimale valido.`)
  const value = Number(token)
  if (value > maximum) error(line, `«${token}» supera ${maximum}.`)
  return value
}
export function assemble(source: string): Program {
  const parsed: { line: number; text: string; label?: string; op: string; arg?: string }[] = []
  const labels = new Map<string, number>()
  source.split(/\r?\n/).forEach((raw, index) => {
    const text = raw.split(';')[0].trim()
    if (!text) return
    const tokens = text.toUpperCase().replace(/^([A-Z_][A-Z\d_]*):/, '$1 ').trim().split(/\s+/)
    let label: string | undefined
    if (!OPS.has(tokens[0])) label = tokens.shift()
    const [op, arg, extra] = tokens
    if (!op || !OPS.has(op)) error(index + 1, `istruzione «${op ?? label}» sconosciuta.`)
    if (extra) error(index + 1, 'troppi elementi nella riga.')
    if (label) {
      if (!/^[A-Z_][A-Z\d_]*$/.test(label)) error(index + 1, `etichetta «${label}» non valida.`)
      if (labels.has(label)) error(index + 1, `etichetta «${label}» già definita.`)
      if (OPS.has(label)) error(index + 1, `«${label}» è un'istruzione, non un'etichetta.`)
      labels.set(label, parsed.length)
    }
    parsed.push({ line: index + 1, text, label, op, arg })
    if (parsed.length > MEMORY_SIZE) error(index + 1, 'il programma supera le 100 celle disponibili.')
  })
  if (!parsed.length) throw new Error('Scrivi almeno un’istruzione prima di assemblare.')
  if (!parsed.some(row => row.op === 'HLT')) throw new Error('Manca HLT: aggiungi un’istruzione di arresto.')
  const memory = Array<number>(MEMORY_SIZE).fill(0)
  const rows: SourceRow[] = parsed.map((row, address) => {
    let word: number
    if (row.op === 'DAT') word = row.arg === undefined ? 0 : decimal(row.arg, row.line, 999)
    else if (row.op in NO_ARG) {
      if (row.arg !== undefined) error(row.line, `${row.op} non accetta operandi.`)
      word = NO_ARG[row.op]
    } else {
      if (row.arg === undefined) error(row.line, `${row.op} richiede un indirizzo o un’etichetta.`)
      const target = /^\d+$/.test(row.arg) ? decimal(row.arg, row.line, 99) : labels.get(row.arg)
      if (target === undefined) error(row.line, `etichetta «${row.arg}» non definita.`)
      word = ARG_OPS[row.op] + target
    }
    memory[address] = word
    return { address, line: row.line, text: row.text, label: row.label, word, kind: row.op === 'DAT' ? 'data' : 'code' }
  })
  return { memory, rows, source }
}
export function createMachine(program: Program, input: number[] = []): MachineState {
  return { program, memory: [...program.memory], pc: 0, acc: 0, negative: false, overflow: false, cir: null, mar: null, mdr: null, phase: 'fetch', currentAddress: null, input: [...input], output: [], steps: 0, trace: [], message: 'Programma assemblato. Premi «Fase» per iniziare.', changedAddress: null }
}
export function addInput(machine: MachineState, value: number): MachineState {
  if (!Number.isInteger(value) || value < 0 || value > 999) throw new Error('L’input deve essere un intero tra 0 e 999.')
  return { ...machine, input: [...machine.input, value], phase: machine.phase === 'waiting' ? 'execute' : machine.phase, message: `Input ${dec(value)} pronto per INP.` }
}
function fail(machine: MachineState, message: string): MachineState { return { ...machine, phase: 'error', message, trace: [...machine.trace, message] } }
export function stepMachine(machine: MachineState): MachineState {
  if (machine.phase === 'halted' || machine.phase === 'error' || machine.phase === 'waiting') return machine
  if (machine.phase === 'fetch') {
    if (machine.pc < 0 || machine.pc >= MEMORY_SIZE) return fail(machine, `PC ${machine.pc} fuori dalle 100 celle.`)
    const address = machine.pc, word = machine.memory[address]
    return { ...machine, mar: address, mdr: word, cir: word, currentAddress: address, pc: address + 1, phase: 'decode', changedAddress: null, message: `FETCH · PC indica ${dec(address, 2)}; MAR seleziona la cella, MDR legge ${dec(word)} e CIR la conserva.`, trace: [...machine.trace, `FETCH ${dec(address, 2)} → ${dec(word)}`] }
  }
  if (machine.phase === 'decode') {
    const word = machine.cir!
    const opcode = Math.floor(word / 100), address = word % 100
    let instruction: string
    if (word === 0) instruction = 'HLT'
    else if (word === 901) instruction = 'INP'
    else if (word === 902) instruction = 'OUT'
    else instruction = ({ 1: 'ADD', 2: 'SUB', 3: 'STA', 5: 'LDA', 6: 'BRA', 7: 'BRZ', 8: 'BRP' } as Record<number, string>)[opcode] ?? 'SCONOSCIUTA'
    return { ...machine, phase: 'execute', message: `DECODE · ${dec(word)} significa ${instruction}${instruction === 'SCONOSCIUTA' || ['HLT', 'INP', 'OUT'].includes(instruction) ? '' : ` ${dec(address, 2)}`}.`, trace: [...machine.trace, `DECODE ${dec(word)} → ${instruction}`] }
  }
  const word = machine.cir!, op = Math.floor(word / 100), address = word % 100
  const next = { ...machine, phase: 'fetch' as Phase, steps: machine.steps + 1 }
  const finish = (state: MachineState, message: string): MachineState => ({ ...state, message: `EXECUTE · ${message}`, trace: [...state.trace, `EXECUTE ${message}`] })
  if (word === 0) return finish({ ...next, phase: 'halted' }, 'HLT arresta la macchina.')
  if (word === 901) {
    if (!machine.input.length) return { ...machine, phase: 'waiting', message: 'INP attende un numero tra 0 e 999. Aggiungilo nella casella Input.' }
    const value = machine.input[0]
    return finish({ ...next, acc: value, negative: false, overflow: false, input: machine.input.slice(1) }, `INP carica ${dec(value)} nell’accumulatore.`)
  }
  if (word === 902) return finish({ ...next, output: [...machine.output, machine.acc] }, `OUT invia ${dec(machine.acc)} all’uscita${machine.negative ? ' (valore ottenuto dopo una sottrazione negativa)' : ''}.`)
  if (![1, 2, 3, 5, 6, 7, 8].includes(op)) return fail(machine, `Codice ${dec(word)} sconosciuto alla cella ${dec(machine.currentAddress ?? 0, 2)}.`)
  if (op === 6 || op === 7 || op === 8) {
    const take = op === 6 || (op === 7 && machine.acc === 0 && !machine.negative) || (op === 8 && !machine.negative)
    const name = op === 6 ? 'BRA' : op === 7 ? 'BRZ' : 'BRP'
    return finish({ ...next, pc: take ? address : machine.pc }, `${name} ${take ? `porta PC a ${dec(address, 2)}` : 'non salta'}.`)
  }
  const value = machine.memory[address]
  if (op === 3) {
    const memory = [...machine.memory]; memory[address] = machine.acc
    return finish({ ...next, memory, mar: address, mdr: machine.acc, changedAddress: address }, `STA scrive ${dec(machine.acc)} nella cella ${dec(address, 2)}${machine.program.rows[address]?.kind === 'code' ? ' contenente codice' : ''}.`)
  }
  if (op === 5) return finish({ ...next, acc: value, negative: false, overflow: false, mar: address, mdr: value }, `LDA legge ${dec(value)} dalla cella ${dec(address, 2)}.`)
  const raw = op === 1 ? machine.acc + value : machine.acc - value
  const acc = ((raw % 1000) + 1000) % 1000
  const negative = raw < 0
  return finish({ ...next, acc, negative, overflow: raw > 999 || raw < 0, mar: address, mdr: value }, `${op === 1 ? 'ADD' : 'SUB'} usa ${dec(value)} dalla cella ${dec(address, 2)}: ${raw}${raw !== acc ? ` → ${dec(acc)} modulo 1000` : ''}${negative ? '; risultato negativo per BRP' : ''}.`)
}
export function runMachine(machine: MachineState, limit = 300): MachineState {
  let current = machine, phases = 0
  while (!['halted', 'waiting', 'error'].includes(current.phase) && phases < limit * 3) { current = stepMachine(current); phases++ }
  return phases >= limit * 3 && !['halted', 'waiting', 'error'].includes(current.phase) ? fail(current, `Limite di ${limit} istruzioni raggiunto: controlla i salti.`) : current
}
