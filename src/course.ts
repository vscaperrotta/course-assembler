export interface Lesson {
  title: string; tag: string; lead: string;
  sections: readonly { heading: string; paragraphs: readonly string[]; terms?: ReadonlyArray<readonly [string, string]> }[];
  example: string; observation: string; note: string;
}

export const lessons: readonly Lesson[] = [
  {
    title: 'Panoramica dell’architettura dei calcolatori', tag: '01 · La mappa generale',
    lead: 'Prima di studiare bit e istruzioni, orientiamoci: quali parti compongono un computer, che ruolo hanno e come collaborano quando chiedi di fare un calcolo?',
    sections: [
      { heading: 'I componenti principali', paragraphs: [
        'Un computer è un sistema di componenti collegati. Il processore (CPU) interpreta ed esegue istruzioni. Al suo interno, i registri tengono pochi valori vicini al calcolo e l’unità aritmetico-logica (ALU) esegue operazioni come somme e confronti. La memoria RAM conserva temporaneamente istruzioni e dati mentre i programmi sono in esecuzione.',
        'I dispositivi di ingresso, come tastiera e mouse, forniscono informazioni; quelli di uscita, come schermo e altoparlanti, restituiscono risultati. Un controller coordina lo scambio con una periferica. SSD e altri dispositivi di archiviazione conservano file anche a computer spento. Scheda madre e collegamenti permettono ai componenti di comunicare.'
      ], terms: [['CPU o processore', 'Esegue le istruzioni di un programma e coordina le operazioni.'], ['Registro', 'Piccola memoria interna alla CPU, usata durante un calcolo.'], ['ALU', 'Circuito della CPU che esegue operazioni aritmetiche e logiche.'], ['RAM', 'Memoria di lavoro, temporanea e modificabile; perde il contenuto quando manca alimentazione.'], ['Periferica', 'Dispositivo che invia dati al computer o riceve dati dal computer.'], ['Archiviazione', 'Memoria non volatile, per esempio un SSD, che conserva file nel tempo.']] },
      { heading: 'Il percorso di un dato', paragraphs: [
        'Immagina di premere un tasto e voler sommare il numero digitato a un altro. La tastiera rileva il tasto; il suo controller rende disponibile un codice. Il sistema operativo e il programma lo interpretano, e il valore viene portato in RAM. La CPU legge l’istruzione del programma, carica il dato in un registro, lo combina con l’altro dato nell’ALU e conserva il risultato in un registro o in RAM. Il programma può poi inviare il risultato allo schermo.',
        'Per una lettura di RAM, la CPU indica una posizione, segnala che vuole leggere e riceve il dato. Per una scrittura, indica una posizione e invia il dato da conservare. Un gruppo di collegamenti e regole per questi scambi si chiama bus. Nei computer reali il percorso può passare attraverso cache e controller e non corrisponde sempre a un unico bus fisico.'
      ], terms: [['Controller', 'Circuito che gestisce la comunicazione tra il computer e una periferica.'], ['Bus', 'Percorso logico condiviso o organizzato per trasferire indirizzi, dati e segnali di controllo.'], ['Cache', 'Memoria veloce vicina alla CPU, che conserva copie temporanee di dati usati di recente.']] },
      { heading: 'La CPU lavora a passi coordinati', paragraphs: [
        'La CPU non comprende da sola l’obiettivo umano “fai una somma”: esegue comandi elementari scritti dal programma. Un contatore interno indica quale istruzione viene dopo; la CPU legge quell’istruzione, la interpreta ed esegue l’azione. Un segnale periodico chiamato clock coordina quando i circuiti acquisiscono nuovi valori. Una singola operazione può richiedere più cicli di clock.',
        'Un file di programma può essere conservato sull’SSD, ma per essere eseguito il sistema carica istruzioni e dati necessari in memoria. Nel modello didattico separiamo la memoria del programma dalla RAM dati per rendere i percorsi visibili; molti computer usano invece uno spazio di memoria condiviso per istruzioni e dati.'
      ], terms: [['Clock', 'Segnale periodico che coordina i cambiamenti di stato dei circuiti.'], ['Ciclo di istruzione', 'Fasi con cui la CPU seleziona, interpreta ed esegue un’istruzione.'], ['Architettura di von Neumann', 'Modello in cui istruzioni e dati condividono la stessa memoria indirizzabile.'], ['Architettura Harvard', 'Modello che usa memorie o percorsi distinti per istruzioni e dati.']] }
    ],
    example: '; Un semplice viaggio del dato: istruzione → CPU → RAM → CPU\nLDA #4\nSTA $20\nLDA $20\nHLT',
    observation: 'Il valore 4 entra nel registro A, viene copiato nella cella RAM $20 e poi riletto dalla stessa cella. Il dato letto torna alla CPU; l’indirizzo $20 resta la posizione.',
    note: 'Questa è una mappa semplificata: non mostra sistema operativo, cache, controller o clock nel simulatore. I capitoli successivi isolano e spiegano ogni componente.'
  },
  {
    title: 'Che cosa fa un calcolatore?', tag: '02 · Il modello',
    lead: 'Un calcolatore riceve informazioni, le conserva, le trasforma secondo istruzioni e produce risultati. Partiamo dagli stati fisici, prima ancora dell’Assembly.',
    sections: [
      { heading: 'Dall’idea al circuito', paragraphs: [
        'Nei circuiti digitali due intervalli di tensione vengono interpretati come 0 e 1. Un bit è una scelta fra due stati distinguibili: non è un minuscolo numero che viaggia da solo. Molti bit insieme possono rappresentare numeri, lettere o istruzioni secondo una convenzione.',
        'La CPU legge istruzioni e coordina registri, unità aritmetico-logica (ALU) e memoria. I registri trattengono pochi valori temporanei; la memoria offre molte posizioni. Un programma è una sequenza di istruzioni codificate che determina come cambia lo stato della macchina.'
      ], terms: [['Bit', 'La più piccola unità d’informazione del modello: uno stato 0 oppure 1.'], ['CPU', 'Il processore: legge le istruzioni e coordina i circuiti che elaborano e conservano i dati.'], ['Programma', 'Una sequenza di istruzioni che descrive quali operazioni eseguire.']] },
      { heading: 'La macchina di studio', paragraphs: [
        'Useremo una CPU inventata con un accumulatore A da 8 bit, un contatore PC, un indicatore Z, una memoria di programma e 256 celle di RAM dati. Ogni clic su “Passo” esegue un’istruzione intera. I processori reali hanno più registri, cache e istruzioni codificate in byte.',
        'Per capire un programma osserva sempre quattro domande: quale istruzione è stata scelta, da dove arriva il dato, dove viene copiato il risultato e quale istruzione sarà la prossima.'
      ], terms: [['Registro', 'Piccolo gruppo di circuiti dentro la CPU, usato per conservare temporaneamente un valore.'], ['Stato della macchina', 'L’insieme dei valori correnti di registri, flag e memoria.'], ['Accumulatore A', 'Il registro di lavoro da 8 bit usato per caricare e calcolare valori.']] }
    ],
    example: '; Due numeri dentro le istruzioni\nLDA #7\nADD #5\nHLT',
    observation: 'A passa da 0 a 7 e poi a 12. HLT ferma la macchina.',
    note: '“8 bit” qui descrive A e le celle dati. È una scelta del modello, non una proprietà di tutti i calcolatori.'
  },
  {
    title: 'Bit, byte e basi numeriche', tag: '03 · Le rappresentazioni',
    lead: 'I bit hanno un significato solo quando scegliamo come interpretarli. La stessa sequenza può indicare un numero, una lettera o parte di un’istruzione.',
    sections: [
      { heading: 'Da otto bit a 256 possibilità', paragraphs: [
        'Ogni bit vale 0 oppure 1. Otto bit producono 2⁸ = 256 combinazioni. Se li leggiamo come interi senza segno, vanno da 00000000₂ = 0 a 11111111₂ = 255. I pesi delle posizioni, da destra, sono 1, 2, 4, 8, 16, 32, 64 e 128: 00000111₂ vale 4 + 2 + 1 = 7.',
        'Una cifra esadecimale descrive quattro bit. $20 significa 2×16 + 0 = 32 decimale, mentre $FA significa 15×16 + 10 = 250. In questa sintassi $ introduce la base 16: da solo non vuol dire “indirizzo”.'
      ], terms: [['Byte', 'Gruppo di otto bit; qui è la quantità che entra in A o in una cella RAM.'], ['Binario', 'Scrittura in base 2: ciascuna cifra è un bit con il proprio peso.'], ['Esadecimale', 'Scrittura in base 16; ogni cifra riassume quattro bit.']] },
      { heading: 'Quando il risultato è troppo grande', paragraphs: [
        'A conserva soltanto otto bit. 250 + 10 = 260, ma 260 = 256 + 4: rimane 4. Si dice che il risultato è preso modulo 256. La sottrazione segue la stessa regola: 3 − 5 produce 254 come byte.',
        'I numeri negativi richiedono una convenzione aggiuntiva, per esempio il complemento a due. Il nostro simulatore mostra sempre A come byte senza segno da 0 a 255 e non modella un flag di riporto.'
      ], terms: [['Overflow', 'Il risultato matematico supera il valore che il registro può conservare.'], ['Modulo 256', 'Si conserva il resto dopo aver diviso per 256: 260 diventa 4.'], ['Complemento a due', 'Una convenzione comune per interpretare i bit come numeri con segno.']] }
    ],
    example: 'LDA #250\nADD #10\nHLT',
    observation: 'A passa da $FA (250) a $04 (4): 260 non entra in otto bit senza segno.',
    note: 'Il significato dei bit dipende dalla rappresentazione scelta, non dai bit stessi.'
  },
  {
    title: 'Perché si chiamano indirizzi?', tag: '04 · La memoria',
    lead: '“Indirizzo” viene dall’idea di localizzare un posto. Come un indirizzo stradale individua un edificio, un indirizzo di memoria seleziona una posizione; il contenuto è un’altra cosa.',
    sections: [
      { heading: 'Posizione e contenuto', paragraphs: [
        'Immagina 256 posizioni numerate da 0 a 255. Ciascuna conserva un byte. Se la posizione $20 contiene $07, $20 è l’indirizzo (32 decimale) e $07 è il dato (7 decimale). Puoi sostituire il dato senza cambiare l’indirizzo. Due posizioni possono conservare lo stesso dato.',
        'Gli indirizzi sono numeri interpretati da circuiti di selezione. La metafora delle caselle è utile, ma la RAM non è fatta di piccoli cassetti: i bit sono stati elettrici in celle organizzate fisicamente.'
      ], terms: [['Indirizzo', 'Numero che seleziona una posizione precisa della memoria.'], ['Dato o contenuto', 'Il valore conservato in quella posizione; può cambiare senza cambiare l’indirizzo.'], ['RAM', 'Memoria di lavoro leggibile e modificabile durante l’esecuzione.']] },
      { heading: 'Quante posizioni?', paragraphs: [
        'Otto bit di indirizzo danno 2⁸ = 256 combinazioni, da $00 a $FF. Se ogni posizione individua un byte, la capacità indirizzabile è 256 byte. Larghezza dell’indirizzo e larghezza del dato sono concetti diversi: una macchina può avere molti più indirizzi e trasferire più byte per operazione.',
        '“Leggi $20” significa seleziona la posizione $20 e ricevi il suo contenuto attuale. Nella sezione Indirizzi puoi cambiare posizione e dato per vedere la differenza.'
      ], terms: [['Larghezza dell’indirizzo', 'Numero di bit usato per selezionare le posizioni: 8 bit permettono 256 combinazioni.'], ['Capacità indirizzabile', 'Quantità di dati raggiungibile con gli indirizzi disponibili; in questo modello 256 byte.']] }
    ],
    example: 'LDA #7\nSTA $20\nLDA #0\nLDA $20\nHLT',
    observation: 'STA deposita 7 in RAM[$20]. Dopo aver azzerato A, LDA $20 ritrova 7.',
    note: 'Il simbolo $ indica l’esadecimale. È l’assenza di # in LDA che richiede una lettura dalla RAM.'
  },
  {
    title: 'Come i dati attraversano l’hardware', tag: '05 · Fili e segnali',
    lead: 'Una lettura dalla RAM richiede un indirizzo, una richiesta di lettura e un percorso di ritorno per il dato.',
    sections: [
      { heading: 'Leggere e scrivere', paragraphs: [
        'In un modello a bus la CPU presenta i bit dell’indirizzo sulle linee di indirizzo e attiva un segnale di lettura. La memoria decodifica l’indirizzo, seleziona la posizione e presenta il suo byte sulle linee dati. La CPU acquisisce quel byte in un registro. Per scrivere, la CPU presenta indirizzo e dato, poi attiva il segnale di scrittura.',
        'Un bus è un insieme di collegamenti e regole d’uso. Le implementazioni reali possono usare cache, controller e percorsi separati: non esiste necessariamente un unico fascio di fili condiviso da tutto.'
      ], terms: [['Bus', 'Insieme di collegamenti e regole usato per trasferire indirizzi, dati o segnali.'], ['Linee di indirizzo', 'Portano il numero della posizione da selezionare.'], ['Linee dati', 'Portano il byte letto o il byte da scrivere.'], ['Segnale di controllo', 'Specifica quale operazione di memoria deve avvenire, per esempio lettura o scrittura.']] },
      { heading: 'Perché serve il tempo', paragraphs: [
        'Indirizzo e dato devono stabilizzarsi prima che un registro acquisisca i nuovi bit. Nei sistemi sincroni il clock coordina questi momenti. I registri CPU sono circuiti bistabili; la cache usa spesso SRAM; la RAM principale tipica usa DRAM e richiede refresh delle celle.',
        'Il disegno del simulatore condensa le fasi in una freccia illuminata. Un clic esegue l’istruzione completa: non mostra tensioni, ritardi, cache o cicli di clock misurati.'
      ], terms: [['Clock', 'Segnale periodico che coordina quando i registri acquisiscono nuovi valori.'], ['Flip-flop', 'Circuito bistabile che conserva un bit finché è alimentato.'], ['DRAM e SRAM', 'Due tecnologie di memoria: la DRAM è usata tipicamente nella RAM principale; la SRAM spesso nelle cache.']] }
    ],
    example: 'LDA #23\nSTA $20\nLDA #0\nLDA $20\nHLT',
    observation: 'Per STA $20 A fornisce 23; per LDA $20 la RAM restituisce 23 ad A.',
    note: 'Le frecce indicano dipendenze logiche, non la disposizione fisica dei fili.'
  },
  {
    title: 'Registri e ciclo della CPU', tag: '06 · Fetch, decode, execute',
    lead: 'La CPU deve scegliere un’istruzione, conservarla mentre la interpreta e tenere temporaneamente i dati su cui lavora.',
    sections: [
      { heading: 'PC, IR, A e Z', paragraphs: [
        'PC contiene l’indice della prossima istruzione: la prima è la riga 0. IR rappresenta l’istruzione appena letta. A è l’accumulatore da 8 bit. Z vale 1 quando l’ultima istruzione che modifica A ha prodotto zero. PC, IR e A sono registri interni; RAM[$20] è una cella esterna al nucleo CPU. Un flip-flop è un circuito bistabile capace di mantenere un bit finché è alimentato: più flip-flop formano un registro.',
        'La CPU usa PC per scegliere una riga, la porta in IR (fetch), riconosce comando e operando (decode), poi produce l’effetto (execute). Senza salto PC avanza. HLT impedisce nuovi passi.'
      ], terms: [['PC', 'Program Counter: registro che indica la prossima istruzione; qui contiene un numero di riga.'], ['IR', 'Instruction Register: registro che conserva l’istruzione corrente.'], ['Flag Z', 'Bit di stato che vale 1 quando il risultato in A è zero.'], ['Flip-flop', 'Circuito elementare che mantiene un singolo bit.']] },
      { heading: 'La semplificazione del programma', paragraphs: [
        'Nei processori reali PC contiene un indirizzo di memoria, spesso relativo a byte; le istruzioni hanno una codifica binaria e possono occupare più byte. Qui PC conta righe eseguibili, saltando commenti e righe vuote. La memoria programma è separata dalla RAM dati.',
        'Questa scelta aiuta a studiare prima il flusso dei dati. Non bisogna però scambiare il numero di riga con un indirizzo RAM: JMP 3 e LDA $03 selezionano cose diverse.'
      ], terms: [['Fetch', 'Prelievo dell’istruzione selezionata dal PC.'], ['Decode', 'Interpretazione del comando e dei suoi operandi.'], ['Execute', 'Esecuzione dell’operazione richiesta dall’istruzione.']] }
    ],
    example: 'LDA #7\nADD #5\nHLT',
    observation: 'Dopo LDA: PC = 1, A = 7. Dopo ADD: PC = 2, A = 12.',
    note: 'Nel simulatore fetch, decode ed execute avvengono in un solo clic, anche se sono spiegati come fasi distinte.'
  },
  {
    title: 'Valore immediato o cella RAM?', tag: '07 · Gli operandi',
    lead: 'L’istruzione dice che cosa fare. Il modo in cui scrivi l’operando dice da dove prendere il numero.',
    sections: [
      { heading: 'La differenza decisiva', paragraphs: [
        'LDA #32 copia in A il numero 32 scritto nell’istruzione: la RAM dati non viene letta. LDA $20 interpreta $20 come indirizzo e copia in A il contenuto di RAM[$20]. $20 vale 32 in decimale, ma se in quella cella c’è 7, il secondo comando carica 7.',
        'Il # significa “valore immediato” nella sintassi di questa CPU. Il $ significa “numero scritto in esadecimale”. Quando LDA, ADD o SUB ricevono un operando senza #, quel numero viene usato come indirizzo RAM.'
      ], terms: [['Operando immediato', 'Valore scritto direttamente nel programma, indicato qui con #.'], ['Indirizzamento diretto', 'Modo in cui l’istruzione usa l’indirizzo scritto per leggere un dato dalla RAM.']] },
      { heading: 'Copiare non svuota la sorgente', paragraphs: [
        'LDA $20 copia il byte della cella in A e lascia invariata la cella. STA $21 copia A in RAM[$21] e lascia invariato A. Una nuova scrittura sulla stessa cella sostituisce il suo vecchio contenuto.',
        'STA richiede sempre un indirizzo: STA #21 non ha significato in questo insieme di istruzioni. Puoi scrivere gli indirizzi anche in decimale, ma negli esempi usiamo $ per renderli più riconoscibili.'
      ], terms: [['Lettura (LDA)', 'Copia il dato dalla RAM ad A; la cella di memoria resta invariata.'], ['Scrittura (STA)', 'Copia A nella RAM; A resta invariato.'], ['Copia', 'Il valore arriva alla destinazione e rimane anche nella sorgente.']] }
    ],
    example: 'LDA #7\nSTA $20\nLDA #32\nLDA $20\nHLT',
    observation: 'A vale 7, poi 7, poi 32, poi 7. La cella $20 conserva 7.',
    note: 'Prima di premere Passo, chiediti sempre se l’operando è un valore o una posizione.'
  },
  {
    title: 'ALU, overflow e flag', tag: '08 · Calcolare',
    lead: 'L’ALU combina A con un secondo operando. Il risultato torna in A e può modificare Z.',
    sections: [
      { heading: 'Da dove viene il secondo numero?', paragraphs: [
        'ADD #5 somma 5 ad A. ADD $20 prima legge RAM[$20], poi somma quel byte ad A. SUB usa le stesse due modalità ma sottrae. L’ALU è una rete di circuiti: i bit in ingresso determinano i bit del risultato, che vengono poi acquisiti da A.',
        'Il risultato resta un byte. Se supera 255, i bit oltre l’ottavo vengono scartati. Se una sottrazione è negativa, il byte visualizzato è il risultato modulo 256. Il nostro modello non mostra un flag di riporto né un’interpretazione automatica con segno.'
      ], terms: [['ALU', 'Unità aritmetico-logica: circuiti che calcolano somme, sottrazioni e altre operazioni.'], ['Aritmetica a 8 bit', 'I risultati vengono ridotti ai valori rappresentabili in otto bit, da 0 a 255.'], ['Riporto', 'Bit aggiuntivo che segnala che una somma ha superato il valore massimo; questa CPU non lo conserva.']] },
      { heading: 'Che cosa dice Z?', paragraphs: [
        'Dopo LDA, ADD o SUB, Z vale 1 se il nuovo A è zero, altrimenti 0. STA non modifica Z, perché copia A senza produrre un nuovo valore. JZ legge Z per scegliere la prossima istruzione.',
        'Zero può derivare da LDA #0, da SUB fra uguali o da un’addizione il cui risultato è 256. Z descrive il byte conservato in A, non la storia completa del calcolo.'
      ], terms: [['Flag', 'Bit di stato che riassume una proprietà del risultato appena calcolato.'], ['Z (zero)', 'Flag impostato quando il byte in A vale 0.']] }
    ],
    example: 'LDA #9\nSUB #9\nJZ 4\nLDA #99\nHLT',
    observation: 'Dopo SUB: A = 0 e Z = 1. JZ evita LDA #99 e raggiunge HLT.',
    note: 'Z è un bit di stato della CPU, non una cella della RAM.'
  },
  {
    title: 'Salti, cicli e programma completo', tag: '09 · Controllo',
    lead: 'Un salto cambia quale istruzione sarà letta al passo successivo. Questo permette di scegliere e ripetere.',
    sections: [
      { heading: 'Righe eseguibili e salti', paragraphs: [
        'JMP 2 imposta PC a 2 senza condizioni: la prossima è la terza riga eseguibile. JZ 2 lo fa solo se Z = 1; altrimenti PC prosegue. Il numero dopo JMP o JZ è un indice di istruzione, non un indirizzo della RAM dati.',
        'Un ciclo nasce quando un salto torna indietro. Deve esserci una condizione che possa cambiare, altrimenti può proseguire indefinitamente. “Esegui tutto” si arresta dopo 256 passi. HLT ferma esplicitamente il programma, lasciando consultabili registri e RAM.'
      ], terms: [['JMP', 'Salto incondizionato: cambia sempre la prossima riga del programma.'], ['JZ', 'Salto condizionato: cambia riga solo quando il flag Z vale 1.'], ['Indice di riga', 'Numero che identifica un’istruzione nel programma didattico, contando da 0.']] },
      { heading: 'Un programma raccontato dall’inizio alla fine', paragraphs: [
        'LDA #7 mette 7 in A. STA $20 lo copia in RAM[$20]. LDA #5 sostituisce A con 5, ma la cella $20 rimane 7. ADD $20 legge 7 dalla RAM e calcola 5 + 7 = 12. STA $21 copia 12 in una seconda cella. HLT conclude.',
        'Alla fine A = 12, RAM[$20] = 7 e RAM[$21] = 12. Il programma non ha “spostato” 7: lo ha copiato. In una macchina reale il trasferimento può attraversare cache e controller, ma restano le domande fondamentali: sorgente, destinazione, significato dei bit e momento in cui il dato viene acquisito.'
      ], terms: [['Ciclo', 'Sequenza di istruzioni ripetuta tornando a una riga precedente.'], ['Terminazione', 'Condizione o istruzione che fa finire il programma; qui HLT lo ferma esplicitamente.']] }
    ],
    example: 'LDA #7\nSTA $20\nLDA #5\nADD $20\nSTA $21\nHLT',
    observation: 'Alla fine RAM[$20] = $07 e RAM[$21] = $0C (12 decimale).',
    note: 'Le istruzioni qui non sono codificate in byte: il programma è una lista di righe leggibili. È una semplificazione dichiarata del modello.'
  },
  {
    title: 'Dal mondo esterno al risultato', tag: '10 · Oltre il modello',
    lead: 'Un calcolatore utile riceve dati da fuori, li elabora e restituisce un effetto. La nostra CPU mostra il nucleo del ragionamento, ma non simula periferiche.',
    sections: [
      { heading: 'Ingresso, memoria, CPU, uscita', paragraphs: [
        'Quando premi un tasto, un dispositivo rileva l’evento e un controller lo rende disponibile al sistema. Il software può copiare un codice in RAM; la CPU lo legge, lo interpreta e aggiorna altri dati. Per mostrare una lettera, il programma invia informazioni a un dispositivo di uscita, spesso tramite registri o aree di memoria del controller. Il pixel sullo schermo richiede poi ulteriore lavoro della grafica.',
        'La CPU non “vede” il significato umano del tasto: riceve configurazioni di bit. Il significato deriva da convenzioni e software. Alcune periferiche si controllano attraverso indirizzi nello spazio di memoria (memory-mapped I/O); altri sistemi usano istruzioni o spazi di indirizzamento dedicati.'
      ], terms: [['Controller', 'Circuito che fa da intermediario fra la CPU e un dispositivo, per esempio tastiera o schermo.'], ['Periferica', 'Dispositivo esterno al nucleo CPU che fornisce dati o riceve comandi.'], ['Memory-mapped I/O', 'Metodo in cui alcuni indirizzi selezionano registri di un dispositivo invece di celle RAM.']] },
      { heading: 'Dove stanno programma e dati nella realtà?', paragraphs: [
        'Un file su SSD conserva dati anche senza alimentazione. Per eseguirlo, il sistema carica il programma e i dati necessari in memoria utilizzabile dal processore. Fra CPU e RAM possono esserci più livelli di cache: copie più piccole e veloci che riducono le letture alla RAM. Il principio sorgente → trasferimento → destinazione resta, ma il percorso fisico dipende dall’architettura.',
        'Nel nostro simulatore programma e RAM dati sono separati per chiarezza. In molte macchine di uso comune istruzioni e dati condividono uno spazio di memoria indirizzabile, mentre altre architetture mantengono percorsi separati. Il PC reale indica un indirizzo di istruzione, non il semplice numero di riga che usiamo qui.'
      ], terms: [['SSD', 'Unità di memoria non volatile: conserva i dati anche quando il computer è spento.'], ['Cache', 'Memoria veloce vicino alla CPU che conserva copie dei dati usati di recente.'], ['Architettura', 'Organizzazione e regole con cui processore, memorie e dispositivi lavorano insieme.']] }
    ],
    example: '; Il valore 42 simula un dato già arrivato al programma\nLDA #42\nSTA $20\nLDA $20\nHLT',
    observation: 'Il simulatore mostra solo il tratto interno: istruzione → A → RAM[$20] → A. Non mostra il dispositivo che avrebbe fornito il dato né uno schermo su cui inviarlo.',
    note: 'Periferiche, SSD, cache e caricamento dei programmi sono qui spiegati come contesto teorico; non sono componenti simulati.'
  },
  {
    title: 'Come si legge e si scrive Assembly?', tag: '11 · Sintassi e metodo',
    lead: 'Assembly è una notazione testuale per descrivere istruzioni della CPU. Si scrive una riga per istruzione; il processore, però, lavora con codici numerici. Un traduttore chiamato assembler converte il testo in codice macchina.',
    sections: [
      { heading: 'La forma di una riga', paragraphs: [
        'In molti linguaggi Assembly una riga può contenere un’etichetta, un comando (mnemonico), un operando e un commento. Qui usiamo un sottoinsieme più semplice: comando, eventuale operando e commento dopo il punto e virgola. Per esempio: `LDA #12 ; carica dodici`. Il comando dice l’azione; l’operando specifica un valore, una posizione o una riga di salto.',
        'Scriviamo un’istruzione per riga. Il simulatore ignora maiuscole e minuscole, elimina spazi prima e dopo e ignora il testo dopo `;`. Le righe vuote e i commenti non contano come istruzioni. Ogni comando richiede il numero di operandi previsto: `HLT` non ne vuole, `LDA` ne vuole uno.'
      ], terms: [['Mnemonico', 'Parola breve, come LDA o ADD, che rende riconoscibile un’istruzione alle persone.'], ['Operando', 'Valore, indirizzo o destinazione su cui l’istruzione deve agire.'], ['Commento', 'Nota dopo ;, utile a chi legge e ignorata dal simulatore.']] },
      { heading: 'Immediato, indirizzo e numeri', paragraphs: [
        '`#12` significa il valore dodici; `$20` significa il numero esadecimale 20, cioè 32 decimale. In `LDA #12` si carica il numero. In `LDA $20` si legge la cella RAM all’indirizzo $20. Il simbolo `$` sceglie la base 16; il simbolo `#` sceglie il modo immediato. Questa punteggiatura è una convenzione di questa CPU didattica, non una regola identica in ogni Assembly.',
        'Sono ammessi numeri decimali come `42` e numeri esadecimali come `$2A` o `0x2A`. Per un valore immediato puoi scrivere `LDA #42` oppure `LDA #$2A`: entrambi caricano 42. I dati immediati devono stare tra 0 e 255. Gli indirizzi RAM vanno da $00 a $FF.'
      ], terms: [['Valore immediato', 'Numero che compare direttamente nell’istruzione dopo #.'], ['Base numerica', 'Regola che associa cifre e pesi alle quantità; qui scriviamo in base 10 o 16.']] },
      { heading: 'Comandi disponibili e salti', paragraphs: [
        '`LDA` legge un valore in A; `STA` copia A in una cella RAM; `ADD` e `SUB` calcolano usando A; `JMP` cambia sempre riga e `JZ` salta se Z vale 1; `HLT` ferma la CPU. Questo è il vocabolario della nostra macchina, non l’intero vocabolario dell’Assembly reale.',
        'Dopo `JMP` o `JZ` scrivi un indice di riga eseguibile a partire da 0, per esempio `JMP 0`. Questa versione non supporta etichette come `inizio:`: in programmi più grandi le etichette aiutano a non dover contare le righe a mano. Un assembler reale risolve etichette e indirizzi, controlla la sintassi e produce codici macchina per una specifica architettura.'
      ], terms: [['Etichetta', 'Nome simbolico assegnato a una posizione del programma; l’assembler lo traduce in un indirizzo.'], ['Assembler', 'Programma che traduce mnemonici e operandi nel codice macchina previsto da una CPU.'], ['Codice macchina', 'Istruzioni codificate in bit secondo le regole di uno specifico processore.']] }
    ],
    example: '; Carica 12, sommaci 5 e ferma la CPU\nLDA #12\nADD #5\nHLT',
    observation: 'LDA e ADD hanno un operando; HLT non ne ha. Il PC avanza di una riga per istruzione eseguibile.',
    note: 'Il simulatore interpreta direttamente righe leggibili: non crea file oggetto o codice macchina. Assembler e istruzioni cambiano da una famiglia di CPU all’altra.'
  }
]
