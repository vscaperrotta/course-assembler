import test from 'node:test'
import assert from 'node:assert/strict'
import { assemble, createMachine, runMachine, stepMachine, addInput } from '../src/cpu.ts'
import { assembleX86, createX86Machine, runX86, stepX86 } from '../src/x86.ts'
import { exercises, checkExercise } from '../src/exercises.ts'
import { lessons } from '../src/course.ts'
import { scenarios, x86Scenarios } from '../src/scenarios.ts'
import { emptyProgress, parseProgress, progressJson } from '../src/progress.ts'

test('LMC assembles labels, DAT and comments into shared memory', () => {
  const program = assemble('; start\nLDA VALUE\nOUT\nHLT\nVALUE DAT 12')
  assert.deepEqual(program.memory.slice(0, 4), [503, 902, 0, 12])
  const machine = runMachine(createMachine(program))
  assert.equal(machine.phase, 'halted')
  assert.deepEqual(machine.output, [12])
})
test('LMC exposes fetch, decode, execute and waits for input', () => {
  let machine = createMachine(assemble('INP\nOUT\nHLT'))
  machine = stepMachine(machine)
  assert.equal(machine.phase, 'decode'); assert.equal(machine.pc, 1); assert.equal(machine.cir, 901)
  machine = stepMachine(machine); assert.equal(machine.phase, 'execute')
  machine = stepMachine(machine); assert.equal(machine.phase, 'waiting')
  machine = addInput(machine, 7); assert.equal(machine.phase, 'execute')
  machine = runMachine(machine); assert.deepEqual(machine.output, [7])
})
test('LMC reports syntax, missing HLT, and infinite loops', () => {
  assert.throws(() => assemble('LDA MISSING\nHLT'), /Line 1.*undefined label/)
  assert.throws(() => assemble('OUT'), /Missing HLT/)
  const machine = runMachine(createMachine(assemble('LOOP BRA LOOP\nHLT')), 8)
  assert.equal(machine.phase, 'error'); assert.match(machine.message, /Limit of 8/)
})
test('LMC uses latest shared-memory content as executable code', () => {
  const program = assemble('LDA STOP\nSTA TARGET\nBRA TARGET\nTARGET OUT\nSTOP DAT 0\nHLT')
  const machine = runMachine(createMachine(program))
  assert.equal(machine.memory[3], 0)
  assert.equal(machine.phase, 'halted')
  assert.deepEqual(machine.output, [])
})
test('LMC negative result controls BRP and modulo display', () => {
  const scenario = scenarios.find(item => item.id === 'max')
  const machine = runMachine(createMachine(assemble(scenario.source), [8, 5]))
  assert.deepEqual(machine.output, [8]); assert.equal(machine.phase, 'halted')
  const negative = runMachine(createMachine(assemble('LDA THREE\nSUB FIVE\nHLT\nTHREE DAT 3\nFIVE DAT 5')))
  assert.equal(negative.acc, 998); assert.equal(negative.negative, true)
})
test('all LMC scenarios finish with documented results', () => {
  const expected = { echo: [7], store: [], sum: [13], max: [8], calculator: [13], countdown: [3, 2, 1], multiply: [12] }
  for (const scenario of scenarios) {
    const state = runMachine(createMachine(assemble(scenario.source), scenario.input))
    assert.equal(state.phase, 'halted', scenario.id + ': ' + state.message)
    assert.deepEqual(state.output, expected[scenario.id], scenario.id)
  }
})
test('x86 supports arithmetic, signed conditional branches, and RET', () => {
  const max = x86Scenarios.find(item => item.id === 'max')
  const program = assembleX86(max.source)
  for (const [a, b, result] of [[8, 5, 8], [5, 8, 8], [-4, -2, -2], [7, 7, 7]]) {
    const state = runX86(createX86Machine(program, a, b))
    assert.equal(state.halted, true)
    assert.equal(state.registers.RAX, BigInt(result))
  }
  assert.throws(() => assembleX86('mul rax, rsi\nret'), /Line 1.*not supported/)
  assert.throws(() => assembleX86('jmp missing\nret'), /Line 1.*undefined label/)
})
test('all x86 scenarios and supported instruction variants run', () => {
  const expected = { add: 13n, sub: 5n, max: 8n, mul: 12n }
  for (const scenario of x86Scenarios) {
    const state = runX86(createX86Machine(assembleX86(scenario.source), scenario.first, scenario.second))
    assert.equal(state.halted, true, scenario.id + ': ' + state.error)
    assert.equal(state.registers.RAX, expected[scenario.id], scenario.id)
  }
  for (const op of ['JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JMP']) {
    const source = `mov rax, 0\ncmp rdi, rsi\n${op} yes\nret\nyes: inc rax\nret`
    const state = runX86(createX86Machine(assembleX86(source), 3, 3))
    assert.equal(state.halted, true, op)
  }
  const limit = runX86(createX86Machine(assembleX86('loop: jmp loop\nret')), 8)
  assert.match(limit.error, /Limit/)
})
test('all lesson examples assemble and finish in the matching laboratory', () => {
  const inputs = { computer: [7], cycle: [7], sum: [4, 9], branch: [8, 5], loops: [3] }
  for (const lesson of lessons) {
    if (!lesson.example) continue
    if (lesson.bridge) {
      const state = runX86(createX86Machine(assembleX86(lesson.example), 4, 9))
      assert.equal(state.halted, true, lesson.id + ': ' + state.error)
    } else {
      const state = runMachine(createMachine(assemble(lesson.example), inputs[lesson.id] ?? []))
      assert.equal(state.phase, 'halted', lesson.id + ': ' + state.message)
    }
  }
})
test('exercise checker tries all cases and rejects wrong programs', () => {
  const solved = { echo: 'INP\nOUT\nHLT', copy: 'LDA DATO\nSTA RISULTATO\nLDA RISULTATO\nOUT\nHLT\nDATO DAT 12\nRISULTATO DAT 0', sum: scenarios.find(s => s.id === 'sum').source, max: scenarios.find(s => s.id === 'max').source, calculator: scenarios.find(s => s.id === 'calculator').source, countdown: scenarios.find(s => s.id === 'countdown').source, multiply: scenarios.find(s => s.id === 'multiply').source, x86sum: x86Scenarios.find(s => s.id === 'add').source, x86diff: x86Scenarios.find(s => s.id === 'sub').source, x86max: x86Scenarios.find(s => s.id === 'max').source, x86mul: x86Scenarios.find(s => s.id === 'mul').source, cminus: x86Scenarios.find(s => s.id === 'sub').source }
  for (const exercise of exercises) assert.equal(checkExercise(exercise, solved[exercise.id]).passed, true, exercise.id)
  assert.equal(checkExercise(exercises.find(item => item.id === 'sum'), 'INP\nOUT\nHLT').passed, false)
})
test('progress JSON round trips and rejects invalid imports', () => {
  const progress = { ...emptyProgress(), completed: ['computer'], answers: { computer: '7' } }
  assert.deepEqual(parseProgress(progressJson(progress)), progress)
  assert.throws(() => parseProgress('{bad'), /valid JSON/)
  assert.throws(() => parseProgress('{"version":2}'), /Unsupported progress version/)
  assert.throws(() => parseProgress(progressJson({ ...progress, completed: ['inventata'] })), /unknown lessons/)
  assert.throws(() => parseProgress(progressJson({ ...progress, passed: ['inventato'] })), /unknown exercises/)
})
