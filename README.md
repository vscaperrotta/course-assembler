# Officina 8 bit

Atlante interattivo in italiano per studiare i fondamenti dei calcolatori e dell’Assembly partendo da zero.

## Contenuti

- Undici capitoli leggibili liberamente, a partire da una panoramica dell’architettura dei calcolatori e poi bit e byte, indirizzi, passaggio dei dati nell’hardware, registri, ciclo della CPU, operandi, ALU, salti, periferiche e sintassi Assembly.
- Tutorial guidato che accompagna nella scrittura di una calcolatrice con sei istruzioni, una riga alla volta.
- Calcolatore di byte per esplorare pesi dei bit, esadecimale, somma, sottrazione e overflow.
- Atlante degli indirizzi per distinguere una posizione dal dato conservato lì.
- Sette simulazioni guidate e un editor libero per una CPU didattica a 8 bit. Ogni esempio dei capitoli può essere aperto nel simulatore.

Il modello usa una memoria di programma separata da 256 byte di RAM dati. Il PC indica una riga eseguibile, non un indirizzo in byte; una pressione su «Passo» esegue l’istruzione completa. Non vengono simulati codifica macchina, tempi di clock, cache, periferiche o flag di riporto. Queste semplificazioni sono indicate nei capitoli.

## Avvio

Richiede Node.js 20.19+ o 22.12+.

```sh
npm install
npm run dev
```

Per creare la build di distribuzione: `npm run build`.
