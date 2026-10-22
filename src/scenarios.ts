export interface Scenario {
  id: string
  title: string
  question: string
  source: string
  watch: string
  result: string
  address: string
}

export const scenarios: readonly Scenario[] = [
  { id: 'immediate', title: '01 · Un numero nell’istruzione', question: 'Se la RAM è vuota, da dove arriva 42?', source: 'LDA #42\nHLT', watch: 'Osserva IR → A. La RAM dati non viene letta.', result: 'A = $2A, cioè 42. Il valore era scritto nell’istruzione.', address: '20' },
  { id: 'write', title: '02 · Scrivere una cella', question: 'Dopo STA, A perde il suo valore?', source: 'LDA #7\nSTA $20\nHLT', watch: 'Osserva A → RAM e la cella $20.', result: 'A resta $07 e RAM[$20] diventa $07: è una copia.', address: '20' },
  { id: 'read', title: '03 · Leggere una cella', question: 'LDA $20 carica 32 oppure il contenuto di $20?', source: 'LDA #7\nSTA $20\nLDA #0\nLDA $20\nHLT', watch: 'Al quarto passo osserva RAM → A.', result: 'A torna $07: $20 individua la cella, non il dato letto.', address: '20' },
  { id: 'sum', title: '04 · Somma con la RAM', question: 'Che cosa resta in $20 dopo ADD $20?', source: 'LDA #7\nSTA $20\nLDA #5\nADD $20\nSTA $21\nHLT', watch: 'Osserva A, $20 e $21 a ogni passo.', result: 'RAM[$20] resta $07; A e RAM[$21] diventano $0C (12).', address: '20' },
  { id: 'overflow', title: '05 · Overflow a 8 bit', question: 'Dove finisce il 260 di 250 + 10?', source: 'LDA #250\nADD #10\nHLT', watch: 'Confronta $FA con il byte dopo ADD.', result: 'A = $04: vengono conservati solo gli otto bit meno significativi.', address: '20' },
  { id: 'zero', title: '06 · Salto condizionato', question: 'LDA #99 verrà eseguita?', source: 'LDA #9\nSUB #9\nJZ 4\nLDA #99\nHLT', watch: 'Guarda Z e PC dopo SUB e JZ.', result: 'No. SUB produce zero, Z = 1 e JZ porta PC alla riga 4.', address: '20' },
  { id: 'loop', title: '07 · Un ciclo che termina', question: 'Quante volte viene eseguita SUB #1?', source: 'LDA #3\nSUB #1\nJZ 4\nJMP 1\nHLT', watch: 'Segui A: 3 → 2 → 1 → 0. Poi Z diventa 1.', result: 'Tre volte. JZ raggiunge HLT soltanto quando A vale zero.', address: '20' }
]
