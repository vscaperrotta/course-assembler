# Officina Assembly

Un corso interattivo in italiano per chi parte da zero e vuole capire come un'istruzione diventa lavoro della macchina, poi scrivere piccoli programmi con calcoli, scelte e cicli.

## Percorso

Le 17 lezioni sono liberamente accessibili in sei parti: primi passi, macchina e codice numerico, programmazione LMC, passaggio a x86-64, piccole funzioni x86-64 e collegamento con il C. Ogni lezione propone spiegazioni, schemi originali, un esempio spiegato, una previsione, una prova, domande e, dove previsto, un esercizio verificato con più casi.

Il laboratorio **LMC** assembla etichette e `DAT` in una memoria condivisa di 100 celle. Mostra i codici a tre cifre, i registri, le fasi fetch/decode/execute e la traccia. Supporta `INP`, `OUT`, `LDA`, `STA`, `ADD`, `SUB`, `BRA`, `BRZ`, `BRP`, `HLT` e `DAT`. L'aritmetica conserva tre cifre modulo 1000; un indicatore separato ricorda un risultato negativo per `BRP`.

Il laboratorio **x86-64** interpreta un sottoinsieme didattico in sintassi Intel/NASM: `MOV`, `ADD`, `SUB`, `CMP`, `INC`, `DEC`, `JMP`, `JE`, `JNE`, `JG`, `JGE`, `JL`, `JLE` e `RET`, con i registri `RAX`, `RBX`, `RCX`, `RDX`, `RDI`, `RSI`. Una funzione riceve due interi in `RDI` e `RSI` e restituisce `RAX`, secondo la convenzione System V AMD64 usata negli esempi. Il simulatore gira nel browser anche su Mac ARM; non esegue byte x86 né sostituisce un assembler o un emulatore completo. La sezione sui byte mostra codifiche verificate di alcune istruzioni introdotte.

I progressi, le risposte e i programmi degli esercizi vengono salvati nel `localStorage` del browser. In **Riferimenti** puoi esportare o importare un JSON validato per continuare su un altro computer. Il file esportato può essere aggiunto manualmente a un fork; l'app non scrive nel repository.

## Avvio e verifica

Richiede Node.js 22.18+ (i test eseguono direttamente file TypeScript).

```sh
npm ci
npm run dev
```

Apri l'indirizzo mostrato da Vite. Per verificare il progetto:

```sh
npm test
npm run build
```

La build statica viene creata in `dist/` e usa percorsi relativi per funzionare anche sotto il percorso di un repository GitHub Pages. La workflow in `.github/workflows/verify.yml` esegue test e build su push e pull request; la pubblicazione non è automatica.

## Fonti e materiali

La struttura didattica prende spunto dall'[introduzione di SerHack](https://serhack.me/it/courses/asm/prima-parte-introduzione-assembly/), dal [tutorial x86-64 di mschwartz](https://github.com/mschwartz/assembly-tutorial), dal [LMC di 101Computing](https://www.101computing.net/lmc/) e da testi universitari consultati localmente. Le tre risorse descrivono macchine e sintassi diverse: il corso le distingue esplicitamente. Testi, esercizi, diagrammi e illustrazioni pubblicati qui sono originali.

La cartella `reference/` contiene PDF di consultazione personale ed è esclusa da Git. Non includere quei file nel repository pubblico.

## Limiti dichiarati

- Il modello LMC ha 100 celle e numeri da 000 a 999; i risultati fuori intervallo seguono le regole specifiche di questa app.
- Il simulatore x86-64 copre solo le istruzioni elencate sopra, registri interi e salti con segno. Non gestisce memoria x86, stack, chiamate al sistema o eseguibili.
- I progressi restano nel browser usato; esporta il JSON per trasferirli o conservarli.
