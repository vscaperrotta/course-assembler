# Officina Assembly

An interactive course for complete beginners. Learn how an instruction becomes work inside a computer, then write small programs with calculations, decisions, and loops.

## Course outline

The 17 lessons are freely accessible in six parts: first steps, the machine and numeric code, LMC programming, the move to x86-64, small x86-64 functions, and the connection to C. Each lesson includes explanations, original diagrams, a worked example, a prediction, hands-on practice, questions, and, where applicable, an exercise checked against multiple cases.

The **LMC** lab assembles labels and `DAT` into a shared memory of 100 cells. It shows three-digit machine codes, registers, the fetch/decode/execute phases, and an execution trace. It supports `INP`, `OUT`, `LDA`, `STA`, `ADD`, `SUB`, `BRA`, `BRZ`, `BRP`, `HLT`, and `DAT`. Arithmetic keeps three digits modulo 1000; a separate indicator records a negative result for `BRP`.

The **x86-64** lab interprets an educational subset of Intel/NASM syntax: `MOV`, `ADD`, `SUB`, `CMP`, `INC`, `DEC`, `JMP`, `JE`, `JNE`, `JG`, `JGE`, `JL`, `JLE`, and `RET`, using the `RAX`, `RBX`, `RCX`, `RDX`, `RDI`, and `RSI` registers. A function receives two integers in `RDI` and `RSI` and returns its result in `RAX`, following the System V AMD64 convention used in the examples. The simulator runs in the browser, including on ARM Macs. It does not execute x86 machine code or replace a full assembler or emulator. The section about bytes shows verified encodings for some of the instructions introduced.

Progress, answers, exercise programs, and your preferred language are saved in the browser's `localStorage`. Under **References**, you can export or import validated JSON to continue on another computer. The exported `officina-assembly-progress.json` file is excluded from Git.

## Run and verify

Requires Node.js 22.18+ (the tests execute TypeScript files directly).

```sh
npm ci
npm run dev
```

Open the address shown by Vite. To verify the project:

```sh
npm test
npm run build
```

The static build is created in `dist/` and uses relative paths so it also works under a GitHub Pages repository path. The workflow in `.github/workflows/verify.yml` runs tests and builds on pushes and pull requests; publishing is not automatic.

## Adding a language

Copy `src/translations/en.json` to a new language file and translate its values without changing the keys or `{0}` placeholders. Import the dictionary in `src/language.ts`; the language selector and progress validation read the supported language codes from that registry. Add the translated lessons, exercises, and scenarios alongside the existing locale data, then register them in `src/locales.ts`.

## Sources and materials

The teaching structure draws on [SerHack's introduction](https://serhack.me/it/courses/asm/prima-parte-introduzione-assembly/), [mschwartz's x86-64 tutorial](https://github.com/mschwartz/assembly-tutorial), [101Computing's LMC guide](https://www.101computing.net/lmc/), and university texts consulted locally. These resources describe different machines and syntaxes; the course distinguishes them explicitly. The text, exercises, diagrams, and illustrations published here are original.

The `reference/` directory contains PDFs for personal reference and is excluded from Git. Do not include these files in the public repository.

## Scope and limits

- The LMC model has 100 cells and values from 000 to 999. Out-of-range results follow this app's specific rules.
- The x86-64 simulator covers only the instructions listed above, integer registers, and signed branches. It does not handle x86 memory, the stack, system calls, or executables.
- Progress stays in the browser where it was created. Export the JSON to transfer or preserve it.
