import { translate } from './language.ts'
import type { Language } from './language.ts'

export const MEMORY_SIZE = 100
export type Phase = 'fetch' | 'decode' | 'execute' | 'waiting' | 'halted' | 'error'
export interface SourceRow { address: number; line: number; text: string; label?: string; word: number; kind: 'code' | 'data' }
export interface Program { memory: number[]; rows: SourceRow[]; source: string }
export interface MachineState {
  program: Program
  language: Language
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
function error(line: number, message: string, language: Language): never { throw new Error(`${translate(language, "Line")} ${line}: ${message}`) }
function decimal(token: string, line: number, maximum: number, language: Language): number {
  if (!/^\d+$/.test(token)) error(line, translate(language, "“{0}” is not a valid decimal number.", [token]), language)
  const value = Number(token)
  if (value > maximum) error(line, translate(language, "“{0}” exceeds {1}.", [token, maximum]), language)
  return value
}
export function assemble(source: string, language: Language = 'en'): Program {
  const parsed: { line: number; text: string; label?: string; op: string; arg?: string }[] = []
  const labels = new Map<string, number>()
  source.split(/\r?\n/).forEach((raw, index) => {
    const text = raw.split(';')[0].trim()
    if (!text) return
    const tokens = text.toUpperCase().replace(/^([A-Z_][A-Z\d_]*):/, '$1 ').trim().split(/\s+/)
    let label: string | undefined
    if (!OPS.has(tokens[0])) label = tokens.shift()
    const [op, arg, extra] = tokens
    if (!op || !OPS.has(op)) error(index + 1, translate(language, "unknown instruction “{0}”.", [op ?? label]), language)
    if (extra) error(index + 1, translate(language, "too many tokens on this line."), language)
    if (label) {
      if (!/^[A-Z_][A-Z\d_]*$/.test(label)) error(index + 1, translate(language, "invalid label “{0}”.", [label]), language)
      if (labels.has(label)) error(index + 1, translate(language, "label “{0}” is already defined.", [label]), language)
      if (OPS.has(label)) error(index + 1, translate(language, "“{0}” is an instruction, not a label.", [label]), language)
      labels.set(label, parsed.length)
    }
    parsed.push({ line: index + 1, text, label, op, arg })
    if (parsed.length > MEMORY_SIZE) error(index + 1, translate(language, "the program exceeds the 100 available cells."), language)
  })
  if (!parsed.length) throw new Error(translate(language, "Write at least one instruction before assembling."))
  if (!parsed.some(row => row.op === 'HLT')) throw new Error(translate(language, "Missing HLT: add a halt instruction."))
  const memory = Array<number>(MEMORY_SIZE).fill(0)
  const rows: SourceRow[] = parsed.map((row, address) => {
    let word: number
    if (row.op === 'DAT') word = row.arg === undefined ? 0 : decimal(row.arg, row.line, 999, language)
    else if (row.op in NO_ARG) {
      if (row.arg !== undefined) error(row.line, translate(language, "{0} does not accept operands.", [row.op]), language)
      word = NO_ARG[row.op]
    } else {
      if (row.arg === undefined) error(row.line, translate(language, "{0} requires an address or label.", [row.op]), language)
      const target = /^\d+$/.test(row.arg) ? decimal(row.arg, row.line, 99, language) : labels.get(row.arg)
      if (target === undefined) error(row.line, translate(language, "undefined label “{0}”.", [row.arg]), language)
      word = ARG_OPS[row.op] + target
    }
    memory[address] = word
    return { address, line: row.line, text: row.text, label: row.label, word, kind: row.op === 'DAT' ? 'data' : 'code' }
  })
  return { memory, rows, source }
}
export function createMachine(program: Program, input: number[] = [], language: Language = 'en'): MachineState {
  return { program, language, memory: [...program.memory], pc: 0, acc: 0, negative: false, overflow: false, cir: null, mar: null, mdr: null, phase: 'fetch', currentAddress: null, input: [...input], output: [], steps: 0, trace: [], message: translate(language, "Program assembled. Press “Phase / step” to begin."), changedAddress: null }
}
export function addInput(machine: MachineState, value: number): MachineState {
  if (!Number.isInteger(value) || value < 0 || value > 999) throw new Error(translate(machine.language, "Input must be an integer from 0 to 999."))
  return { ...machine, input: [...machine.input, value], phase: machine.phase === 'waiting' ? 'execute' : machine.phase, message: translate(machine.language, "Input {0} is ready for INP.", [dec(value)]) }
}
function fail(machine: MachineState, message: string): MachineState { return { ...machine, phase: 'error', message, trace: [...machine.trace, message] } }
export function stepMachine(machine: MachineState): MachineState {
  if (machine.phase === 'halted' || machine.phase === 'error' || machine.phase === 'waiting') return machine
  if (machine.phase === 'fetch') {
    if (machine.pc < 0 || machine.pc >= MEMORY_SIZE) return fail(machine, translate(machine.language, "PC {0} is outside the 100 cells.", [machine.pc]))
    const address = machine.pc, word = machine.memory[address]
    return { ...machine, mar: address, mdr: word, cir: word, currentAddress: address, pc: address + 1, phase: 'decode', changedAddress: null, message: translate(machine.language, "FETCH · PC points to {0}; MAR selects the cell, MDR reads {1}, and CIR holds it.", [dec(address, 2), dec(word)]), trace: [...machine.trace, `FETCH ${dec(address, 2)} → ${dec(word)}`] }
  }
  if (machine.phase === 'decode') {
    const word = machine.cir!
    const opcode = Math.floor(word / 100), address = word % 100
    const unknown = translate(machine.language, 'UNKNOWN')
    let instruction: string
    if (word === 0) instruction = 'HLT'
    else if (word === 901) instruction = 'INP'
    else if (word === 902) instruction = 'OUT'
    else instruction = ({ 1: 'ADD', 2: 'SUB', 3: 'STA', 5: 'LDA', 6: 'BRA', 7: 'BRZ', 8: 'BRP' } as Record<number, string>)[opcode] ?? unknown
    return { ...machine, phase: 'execute', message: translate(machine.language, "DECODE · {0} means {1}{2}.", [dec(word), instruction, instruction === unknown || ['HLT', 'INP', 'OUT'].includes(instruction) ? '' : ` ${dec(address, 2)}`]), trace: [...machine.trace, `DECODE ${dec(word)} → ${instruction}`] }
  }
  const word = machine.cir!, op = Math.floor(word / 100), address = word % 100
  const next = { ...machine, phase: 'fetch' as Phase, steps: machine.steps + 1 }
  const finish = (state: MachineState, message: string): MachineState => ({ ...state, message: `EXECUTE · ${message}`, trace: [...state.trace, `EXECUTE ${message}`] })
  if (word === 0) return finish({ ...next, phase: 'halted' }, translate(machine.language, "HLT stops the machine."))
  if (word === 901) {
    if (!machine.input.length) return { ...machine, phase: 'waiting', message: translate(machine.language, "INP is waiting for a number from 0 to 999. Add it in the Input field.") }
    const value = machine.input[0]
    return finish({ ...next, acc: value, negative: false, overflow: false, input: machine.input.slice(1) }, translate(machine.language, "INP loads {0} into the accumulator.", [dec(value)]))
  }
  if (word === 902) {
    const negativeNote = machine.negative ? translate(machine.language, ' (value from a negative subtraction)') : ''
    return finish({ ...next, output: [...machine.output, machine.acc] }, translate(machine.language, 'OUT sends {0} to the output{1}.', [dec(machine.acc), negativeNote]))
  }
  if (![1, 2, 3, 5, 6, 7, 8].includes(op)) return fail(machine, translate(machine.language, "Unknown code {0} in cell {1}.", [dec(word), dec(machine.currentAddress ?? 0, 2)]))
  if (op === 6 || op === 7 || op === 8) {
    const take = op === 6 || (op === 7 && machine.acc === 0 && !machine.negative) || (op === 8 && !machine.negative)
    const name = op === 6 ? 'BRA' : op === 7 ? 'BRZ' : 'BRP'
    const branchAction = take ? translate(machine.language, 'sets PC to {0}', [dec(address, 2)]) : translate(machine.language, 'does not branch')
    return finish({ ...next, pc: take ? address : machine.pc }, translate(machine.language, '{0} {1}.', [name, branchAction]))
  }
  const value = machine.memory[address]
  if (op === 3) {
    const memory = [...machine.memory]; memory[address] = machine.acc
    const codeNote = machine.program.rows[address]?.kind === 'code' ? translate(machine.language, ' containing code') : ''
    return finish({ ...next, memory, mar: address, mdr: machine.acc, changedAddress: address }, translate(machine.language, 'STA writes {0} to cell {1}{2}.', [dec(machine.acc), dec(address, 2), codeNote]))
  }
  if (op === 5) return finish({ ...next, acc: value, negative: false, overflow: false, mar: address, mdr: value }, translate(machine.language, "LDA reads {0} from cell {1}.", [dec(value), dec(address, 2)]))
  const raw = op === 1 ? machine.acc + value : machine.acc - value
  const acc = ((raw % 1000) + 1000) % 1000
  const negative = raw < 0
  const operation = op === 1 ? 'ADD' : 'SUB'
  const wrapNote = raw !== acc ? translate(machine.language, ' → {0} modulo 1000', [dec(acc)]) : ''
  const negativeNote = negative ? translate(machine.language, '; negative result for BRP') : ''
  const detail = translate(machine.language, '{0} uses {1} from cell {2}: {3}{4}{5}.', [operation, dec(value), dec(address, 2), raw, wrapNote, negativeNote])
  return finish({ ...next, acc, negative, overflow: raw > 999 || raw < 0, mar: address, mdr: value }, detail)
}
export function runMachine(machine: MachineState, limit = 300): MachineState {
  let current = machine, phases = 0
  while (!['halted', 'waiting', 'error'].includes(current.phase) && phases < limit * 3) { current = stepMachine(current); phases++ }
  return phases >= limit * 3 && !['halted', 'waiting', 'error'].includes(current.phase) ? fail(current, translate(current.language, "Limit of {0} instructions reached: check the branches.", [limit])) : current
}
