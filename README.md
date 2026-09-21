# Agnese Sansonetti — sito pronto per GitHub e Vercel

Questa cartella contiene il sito già generato. Non occorre compilare né installare pacchetti.

## File

- index.html: archivio iniziale.
- style.css: aspetto e impaginazione responsive.
- app.js e board-math.js: interazioni, About, video e moodboard.
- projects/: tutte le nove pagine progetto.
- cv/: curriculum e stampa PDF con font di sistema.
- media/: tutte le immagini, anteprime e video necessari.
- fonts/: font locali e licenza.
- vercel.json: configurazione pronta per il deploy statico.

## Pubblicare

1. Estrai lo ZIP.
2. Crea un repository GitHub, ad esempio agnese-sansonetti. Copia nella radice del repository TUTTO il contenuto di questa cartella: index.html e vercel.json devono essere direttamente nella radice. Non caricare lo ZIP come unico file. Usa GitHub Desktop o Git per caricare insieme gli oltre 1400 file: il caricamento dal browser ha un limite di 100 file alla volta.
3. In Vercel importa il repository GitHub come nuovo progetto.
4. Framework Preset: Other. Root Directory: radice del repository. Build Command e Install Command vuoti. Output Directory: . (un punto). Il vercel.json incluso imposta già questi valori.
5. Premi Deploy. Vercel restituisce il link del sito. I successivi aggiornamenti del repository potranno essere pubblicati attraverso la stessa integrazione.

Non impostare npm run build e non scegliere dist come Output Directory per QUESTO pacchetto statico.

## Indicizzazione

Il sito conserva l'impostazione attuale noindex: può essere aperto dal link, ma non richiede l'indicizzazione su Google. Per renderlo indicizzabile, sostituisci noindex,nofollow con index,follow nelle 11 pagine principali e modifica robots.txt in User-agent: * seguito da Allow: /. Mantieni noindex nelle pagine di redirect. Dopo aver scelto il dominio, aggiungi canonical e sitemap; il pacchetto sorgente della revisione 4 automatizza questi passaggi con SITE_URL e ALLOW_INDEXING.

## Modifiche

In questo pacchetto puoi modificare direttamente HTML, CSS e JavaScript. Mantieni i percorsi relativi alla radice del sito (iniziano con /) e la struttura delle cartelle. Per cambiamenti strutturali e rigenerazione delle moodboard, usa il pacchetto sorgente Agnese-Sansonetti-portfolio-v4.zip: è un progetto separato con una propria configurazione di build. Non mescolare le due configurazioni.

## Fonti delle istruzioni

https://vercel.com/docs/builds/configure-a-build
https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

La consegna prepara i file. Nessun account, repository remoto o deployment è stato creato.
