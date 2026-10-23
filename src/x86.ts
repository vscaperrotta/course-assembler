import { translate } from './language.ts'
import type { Language } from './language.ts'

export const REGISTERS = ['RAX', 'RBX', 'RCX', 'RDX', 'RDI', 'RSI'] as const
export type Register = typeof REGISTERS[number]
export type X86Op = 'MOV' | 'ADD' | 'SUB' | 'CMP' | 'INC' | 'DEC' | 'JMP' | 'JE' | 'JNE' | 'JG' | 'JGE' | 'JL' | 'JLE' | 'RET'
export interface X86Instruction { line: number; text: string; op: X86Op; args: string[]; label?: string }
export interface X86Program { source: string; instructions: X86Instruction[]; labels: Record<string, number> }
export interface X86State { program: X86Program; language: Language; registers: Record<Register, bigint>; ip: number; zero: boolean; sign: boolean; overflow: boolean; halted: boolean; error: string; message: string; trace: string[]; steps: number }
const ops = new Set<X86Op>(['MOV', 'ADD', 'SUB', 'CMP', 'INC', 'DEC', 'JMP', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'RET'])
const branch = new Set<X86Op>(['JMP', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE'])
const MASK = (1n << 64n) - 1n
const SIGN = 1n << 63n
function wrap(value: bigint): bigint { const u = value & MASK; return u >= SIGN ? u - (1n << 64n) : u }
function parseValue(token: string): bigint | null { try { return /^-?(?:\d+|0X[\dA-F]+)$/.test(token) ? BigInt(token) : null } catch { return null } }
function isRegister(token: string): token is Register { return (REGISTERS as readonly string[]).includes(token) }
function bad(line: number, message: string, language: Language): never { throw new Error(`${translate(language, "Line")} ${line}: ${message}`) }
export function assembleX86(source: string, language: Language = 'en'): X86Program {
  const instructions: X86Instruction[] = [], labels: Record<string, number> = {}
  source.split(/\r?\n/).forEach((raw, index) => {
    let text = raw.split(';')[0].trim().toUpperCase()
    if (!text || /^SECTION\s+\.TEXT$/.test(text) || /^GLOBAL\s+[A-Z_][\w]*$/.test(text)) return
    let label: string | undefined
    const labelMatch = text.match(/^([A-Z_][A-Z\d_]*):\s*(.*)$/)
    if (labelMatch) {
      label = labelMatch[1]; text = labelMatch[2]
      if (labels[label] !== undefined) bad(index + 1, translate(language, "label {0} is already defined.", [label]), language)
      labels[label] = instructions.length
      if (!text) return
    }
    const match = text.match(/^([A-Z]+)(?:\s+(.+))?$/)
    if (!match || !ops.has(match[1] as X86Op)) bad(index + 1, translate(language, "instruction “{0}” is not supported by the simulator.", [match?.[1] ?? text]), language)
    const op = match[1] as X86Op
    const args = match[2] ? match[2].split(',').map(item => item.trim()) : []
    const expected = op === 'RET' ? 0 : branch.has(op) || op === 'INC' || op === 'DEC' ? 1 : 2
    if (args.length !== expected || args.some(arg => !arg)) bad(index + 1, translate(language, "{0} requires {1} operands.", [op, expected]), language)
    if (branch.has(op)) { if (!/^[A-Z_][A-Z\d_]*$/.test(args[0])) bad(index + 1, translate(language, "a branch requires a label."), language) }
    else if (op === 'INC' || op === 'DEC') { if (!isRegister(args[0])) bad(index + 1, translate(language, "use a supported register: RAX, RBX, RCX, RDX, RDI, RSI."), language) }
    else if (op !== 'RET') {
      if (!isRegister(args[0])) bad(index + 1, translate(language, "the destination must be a supported register."), language)
      if (!isRegister(args[1]) && parseValue(args[1]) === null) bad(index + 1, translate(language, "invalid operand “{0}”.", [args[1]]), language)
      if (parseValue(args[1]) !== null && (parseValue(args[1])! < -(1n << 31n) || parseValue(args[1])! > (1n << 31n) - 1n)) bad(index + 1, translate(language, "use a constant from −2147483648 to 2147483647."), language)
    }
    instructions.push({ line: index + 1, text, op, args, label })
    if (instructions.length > 256) bad(index + 1, translate(language, "the program exceeds the 256-instruction teaching limit."), language)
  })
  if (!instructions.length) throw new Error(translate(language, "Write at least one x86-64 instruction."))
  if (!instructions.some(item => item.op === 'RET')) throw new Error(translate(language, "Missing RET: this function must return a result in RAX."))
  for (const item of instructions) if (branch.has(item.op) && labels[item.args[0]] === undefined) bad(item.line, translate(language, "undefined label “{0}”.", [item.args[0]]), language)
  return { source, instructions, labels }
}
export function createX86Machine(program: X86Program, first = 0, second = 0, language: Language = 'en'): X86State {
  if (![first, second].every(value => Number.isSafeInteger(value))) throw new Error(translate(language, "Arguments must be safe integers."))
  return { program, language, registers: { RAX: 0n, RBX: 0n, RCX: 0n, RDX: 0n, RDI: BigInt(first), RSI: BigInt(second) }, ip: 0, zero: false, sign: false, overflow: false, halted: false, error: '', message: translate(language, "Function ready. RDI and RSI contain the arguments; RET will return RAX."), trace: [], steps: 0 }
}
export function stepX86(state: X86State): X86State {
  if (state.halted || state.error) return state
  const instruction = state.program.instructions[state.ip]
  if (!instruction) return { ...state, error: translate(state.language, "IP {0}: the function ended without RET.", [state.ip]), message: translate(state.language, "Execution stopped.") }
  const { op, args } = instruction
  const registers = { ...state.registers }
  const value = (token: string) => isRegister(token) ? registers[token] : parseValue(token)!
  let ip = state.ip + 1, zero = state.zero, sign = state.sign, overflow = state.overflow, halted = false, detail = ''
  if (op === 'MOV') { registers[args[0] as Register] = wrap(value(args[1])); detail = translate(state.language, "{0} receives {1}.", [args[0], registers[args[0] as Register]]) }
  else if (['ADD', 'SUB', 'CMP', 'INC', 'DEC'].includes(op)) {
    const left = registers[args[0] as Register], right = op === 'INC' || op === 'DEC' ? 1n : value(args[1])
    const raw = op === 'ADD' || op === 'INC' ? left + right : left - right
    const result = wrap(raw)
    zero = result === 0n; sign = result < 0n
    overflow = op === 'ADD' || op === 'INC' ? ((left >= 0n && right >= 0n && result < 0n) || (left < 0n && right < 0n && result >= 0n)) : ((left >= 0n && right < 0n && result < 0n) || (left < 0n && right >= 0n && result >= 0n))
    if (op !== 'CMP') registers[args[0] as Register] = result
    detail = op === 'CMP' ? translate(state.language, "Compare {0} − {1}; ZF={2}, SF={3}, OF={4}. The registers do not change.", [left, right, Number(zero), Number(sign), Number(overflow)]) : translate(state.language, "{0} becomes {1}; ZF={2}.", [args[0], result, Number(zero)])
  } else if (branch.has(op)) {
    const take = op === 'JMP' || (op === 'JE' && zero) || (op === 'JNE' && !zero) || (op === 'JG' && !zero && sign === overflow) || (op === 'JGE' && sign === overflow) || (op === 'JL' && sign !== overflow) || (op === 'JLE' && (zero || sign !== overflow))
    if (take) ip = state.program.labels[args[0]]
    const branchAction = take ? translate(state.language, 'branches to {0}', [args[0]]) : translate(state.language, 'does not branch')
    const branchCondition = op === 'JMP' ? translate(state.language, 'unconditional branch') : `ZF=${Number(zero)}, SF=${Number(sign)}, OF=${Number(overflow)}`
    detail = translate(state.language, '{0} {1}: {2}.', [op, branchAction, branchCondition])
  } else { halted = true; detail = translate(state.language, "RET returns RAX = {0}.", [registers.RAX]) }
  const entry = `${translate(state.language, "Line")} ${instruction.line}: ${instruction.text} — ${detail}`
  return { ...state, registers, ip, zero, sign, overflow, halted, steps: state.steps + 1, message: entry, trace: [...state.trace, entry] }
}
export function runX86(state: X86State, limit = 300): X86State {
  let current = state
  while (!current.halted && !current.error && current.steps - state.steps < limit) current = stepX86(current)
  return !current.halted && !current.error ? { ...current, error: translate(current.language, "Limit of {0} instructions reached: check the branches.", [limit]), message: translate(current.language, "Execution stopped.") } : current
}
export const encodingExamples = [
  { source: 'mov rax, rdi', bytes: '48 89 F8', meaning: 'REX.W, register-to-register MOV: RDI → RAX.' },
  { source: 'add rax, rsi', bytes: '48 01 F0', meaning: 'REX.W, ADD: adds RSI to RAX.' },
  { source: 'ret', bytes: 'C3', meaning: 'Returns to the caller.' },
] as const
