import { assemble, createMachine, runMachine } from './cpu.ts'
import { assembleX86, createX86Machine, runX86 } from './x86.ts'
import { translate } from './language.ts'
import type { Language } from './language.ts'
export interface Exercise {
  id: string
  lessonId: string
  title: string
  engine: 'lmc' | 'x86'
  task: string
  starter: string
  hint: string
  cases: { input: number[]; expected: number[] }[]
}
export const exercises: Exercise[] = [
  { id: 'echo', lessonId: 'computer', title: 'Echo', engine: 'lmc', task: 'Read a number and send it out, then stop the machine.', starter: 'INP\n; add OUT and HLT', hint: 'INP loads A; OUT copies it to the output; HLT ends.', cases: [{ input: [7], expected: [7] }, { input: [42], expected: [42] }] },
  { id: 'copy', lessonId: 'address', title: 'Copy and reread', engine: 'lmc', task: 'Copy the contents of DATA to RESULT, reread RESULT and display it.', starter: 'LDA DATA\n; store and read again\nHLT\nDATA DAT 12\nRESULT DAT 0', hint: 'Use STA RESULT, LDA RESULT and OUT before HLT.', cases: [{ input: [], expected: [12] }] },
  { id: 'sum', lessonId: 'sum', title: 'Add two inputs', engine: 'lmc', task: 'Read two numbers and show their sum.', starter: 'INP\nSTA FIRST\nINP\n; finish the calculation\nOUT\nHLT\nFIRST DAT 0', hint: 'ADD FIRST adds the first number, already saved, to the second in A.', cases: [{ input: [4, 9], expected: [13] }, { input: [0, 8], expected: [8] }, { input: [25, 17], expected: [42] }] },
  { id: 'max', lessonId: 'branch', title: 'The larger number', engine: 'lmc', task: 'Read two numbers and show the larger one.', starter: 'INP\nSTA FIRST\nINP\nSTA SECOND\n; compare and choose\nHLT\nFIRST DAT 0\nSECOND DAT 0', hint: 'After SUB FIRST, BRP chooses the second; otherwise load FIRST.', cases: [{ input: [8, 5], expected: [8] }, { input: [5, 8], expected: [8] }, { input: [7, 7], expected: [7] }] },
  { id: 'calculator', lessonId: 'subtract', title: 'Mini calculator', engine: 'lmc', task: 'Read three inputs: operation (0 = addition, 1 = subtraction), first number, and second number. Show only one result. For subtraction, the first number will be at least as large as the second.', starter: 'INP\nSTA OPERATION\nINP\nSTA FIRST\nINP\nSTA SECOND\nLDA OPERATION\n; choose SUM or SUBTRACTION\nHLT\nOPERATION DAT 0\nFIRST DAT 0\nSECOND DAT 0', hint: 'BRZ SUM after LDA OPERATION. In the subtraction branch use LDA FIRST and SUB SECOND; in the sum branch use ADD SECOND. Both arrive at OUT.', cases: [{ input: [0, 4, 9], expected: [13] }, { input: [1, 9, 4], expected: [5] }, { input: [0, 0, 8], expected: [8] }, { input: [1, 7, 7], expected: [0] }] },
  { id: 'countdown', lessonId: 'loops', title: 'Countdown', engine: 'lmc', task: 'Given a number from 1 to 5, show the countdown to 1.', starter: 'INP\nSTA COUNT\nLOOP LDA COUNT\n; output, decrement, store, and repeat\nHLT\nCOUNT DAT 0\nONE DAT 1', hint: 'OUT before SUB ONE; after STA COUNT, BRZ must terminate.', cases: [{ input: [1], expected: [1] }, { input: [3], expected: [3, 2, 1] }, { input: [5], expected: [5, 4, 3, 2, 1] }] },
  { id: 'multiply', lessonId: 'debug', title: 'Multiplication by addition', engine: 'lmc', task: 'Read two small numbers and show their product using repeated sums.', starter: 'INP\nSTA FACTOR\nINP\nSTA TIMES\n; build the loop\nHLT\nFACTOR DAT 0\nTIMES DAT 0\nTOTAL DAT 0\nONE DAT 1', hint: 'If TIMES is zero, terminate. Otherwise decrease it, add FACTOR to TOTAL and return to control.', cases: [{ input: [3, 4], expected: [12] }, { input: [7, 0], expected: [0] }, { input: [2, 5], expected: [10] }] },
  { id: 'x86sum', lessonId: 'real', title: 'Sum in x86-64', engine: 'x86', task: 'Return RDI + RSI to RAX.', starter: 'mov rax, rdi\n; add RSI\nret', hint: 'ADD RAX, RSI updates the result register.', cases: [{ input: [4, 9], expected: [13] }, { input: [-5, 2], expected: [-3] }, { input: [0, 0], expected: [0] }] },
  { id: 'x86diff', lessonId: 'x86syntax', title: 'Difference in x86-64', engine: 'x86', task: 'Return RDI − RSI to RAX.', starter: 'mov rax, rdi\n; subtract RSI\nret', hint: 'SUB RAX, RSI retains the difference in RAX.', cases: [{ input: [9, 4], expected: [5] }, { input: [4, 9], expected: [-5] }] },
  { id: 'x86max', lessonId: 'x86choice', title: 'Maximum in x86-64', engine: 'x86', task: 'Return the greater of RDI or RSI.', starter: 'mov rax, rdi\ncmp rdi, rsi\n; decide whether to branch\nret', hint: 'JG can jump to RET when RDI is greater; in other cases load RSI.', cases: [{ input: [8, 5], expected: [8] }, { input: [5, 8], expected: [8] }, { input: [-4, -2], expected: [-2] }, { input: [7, 7], expected: [7] }] },
  { id: 'x86mul', lessonId: 'x86loop', title: 'Product with a loop', engine: 'x86', task: 'For RSI 0 to 5, return RDI × RSI using repeated ADD.', starter: 'mov rax, 0\nmov rcx, rsi\nloop: cmp rcx, 0\n; complete the loop\nret', hint: 'JE END when RCX is zero; otherwise ADD RAX, RDI, DEC RCX, JMP LOOP.', cases: [{ input: [3, 4], expected: [12] }, { input: [7, 0], expected: [0] }, { input: [-2, 5], expected: [-10] }] },
  { id: 'cminus', lessonId: 'cbridge', title: 'From C: a minus b', engine: 'x86', task: 'Translate `return a - b;` into a function that uses RDI, RSI, and RAX.', starter: 'mov rax, rdi\n; one instruction for the difference\nret', hint: 'SUB RAX, RSI corresponds to subtraction.', cases: [{ input: [10, 3], expected: [7] }, { input: [3, 10], expected: [-7] }] },
]
export interface CheckResult { passed: boolean; message: string }
export function checkExercise(exercise: Exercise, source: string, language: Language = 'en'): CheckResult {
  try {
    if (exercise.engine === 'lmc') {
      const program = assemble(source, language)
      for (const test of exercise.cases) {
        const state = runMachine(createMachine(program, test.input, language))
        if (state.phase !== 'halted') return { passed: false, message: translate(language, "With input {0}: {1}", [test.input.join(', ') || translate(language, "none"), state.message]) }
        if (JSON.stringify(state.output) !== JSON.stringify(test.expected)) return { passed: false, message: translate(language, "With input {0} the output is {1}; expected {2}.", [test.input.join(', ') || translate(language, "none"), state.output.join(', ') || translate(language, "empty"), test.expected.join(', ')]) }
      }
    } else {
      const program = assembleX86(source, language)
      for (const test of exercise.cases) {
        const state = runX86(createX86Machine(program, test.input[0], test.input[1], language))
        if (!state.halted) return { passed: false, message: translate(language, "With arguments {0}: {1}", [test.input.join(', '), state.error]) }
        if (state.registers.RAX !== BigInt(test.expected[0])) return { passed: false, message: translate(language, "With arguments {0} RAX is {1}; expected {2}.", [test.input.join(', '), state.registers.RAX, test.expected[0]]) }
      }
    }
    return { passed: true, message: translate(language, "Correct: passed {0} test cases. Explain why they work before continuing.", [exercise.cases.length]) }
  } catch (error) { return { passed: false, message: error instanceof Error ? error.message : String(error) } }
}
