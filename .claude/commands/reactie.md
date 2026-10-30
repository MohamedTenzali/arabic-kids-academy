---
description: Voeg een ouderreactie uit de Web3Forms-mail toe aan de reactiemuur
argument-hint: [plak hier de tekst uit de mail]
---
De gebruiker plakt hieronder een ouderreactie uit de mail "Nieuwe ouderreactie via arabicokids.com":

$ARGUMENTS

Doe dit:
1. Haal naam, beoordeling (aantal sterren), avatar en ervaring uit de tekst.
2. Verbeter alleen hoofdletters en leestekens in de ervaring. Verander nooit de inhoud.
3. Laat zien hoe de reactie wordt toegevoegd (naam, avatar, sterren, tekst, datum van vandaag) en wacht op "ja".
4. Na "ja": voeg de reactie bovenaan toe in DEFAULT_REVIEWS in js/reviews-wall.js, met een uniek id (naam-jjjjmmdd) en de avatarBg die bij de emoji hoort in AVATAR_OPTIONS.
5. Verhoog ?v= van reviews-wall.js op alle pagina's die hem laden, en CACHE_NAME in service-worker.js.
6. Encoding-check (geen ??? of �), commit met "✅ Ouderreactie toegevoegd: [naam]", en push naar origin main.
7. Meld: "Staat over 2 minuten online."
