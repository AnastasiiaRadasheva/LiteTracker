/* =====================================================================
   SÕNAVARA KONTROLL — hajusrakenduste terminoloogia (EE ↔ RU)
   Projekt: "Random sõnad" (LiteTracker Story: HTML/JS veebileht)
   ===================================================================== */

/* 1. KOMMENTAAR: Andmemassiiv (dictionary) — iga kirje on üks "sõnum" (message)
   kahe väljaga: eestikeelne termin ja venekeelne vaste. See on rakenduse
   ainuke andmeallikas (single source of truth), millest mõlemad sõlmed
   (nodes) oma juhuslikud sõnad ammutavad. */
const dictionary = [
  { ee: "server",            ru: "сервер" },
  { ee: "klient",            ru: "клиент" },
  { ee: "andmebaas",         ru: "база данных" },
  { ee: "sõlm",              ru: "узел" },
  { ee: "klaster",           ru: "кластер" },
  { ee: "koormus",           ru: "нагрузка" },
  { ee: "skaleeritavus",     ru: "масштабируемость" },
  { ee: "vearesistentsus",   ru: "отказоустойчивость" },
  { ee: "latentsus",         ru: "задержка" },
  { ee: "puhver",            ru: "кэш" },
  { ee: "sõnum",             ru: "сообщение" },
  { ee: "järjekord",         ru: "очередь" },
  { ee: "autentimine",       ru: "аутентификация" },
  { ee: "turvalisus",        ru: "безопасность" },
  { ee: "pilv",              ru: "облако" },
  { ee: "konteiner",         ru: "контейнер" },
  { ee: "mikroteenus",       ru: "микросервис" },
  { ee: "protokoll",         ru: "протокол" },
  { ee: "sünkroniseerimine", ru: "синхронизация" },
  { ee: "koopia",            ru: "реплика" },
  { ee: "päring",            ru: "запрос" },
  { ee: "vastus",            ru: "ответ" },
  { ee: "haru",              ru: "ветка" },
  { ee: "muudatus",          ru: "коммит" }
];

/* 2. KOMMENTAAR: Rakenduse olek (state) hoitakse muutujates, mitte
   brauseri storage'is — see vastab lihtsa "stateless kliendi" mudelile,
   kus iga leheuuendus alustab uue seansiga (nii nagu paljud hajusteenused
   ei säilita kliendi oleku vahel päringuid). */
let currentEE = null;   // hetkel kuvatav sõna Sõlmes A (eesti keeles)
let currentRU = null;   // hetkel kuvatav sõna Sõlmes B (vene keeles)
let correctCount = 0;
let wrongCount = 0;

/* 3. KOMMENTAAR: Juhusliku elemendi valimise abifunktsioon — see on
   rakenduse "random sõnade genereerimine massiivist" tuumfunktsioon,
   mida kasutavad mõlemad sõlmed (nii EE→RU kui RU→EE suund). */
function randomEntry() {
  const index = Math.floor(Math.random() * dictionary.length);
  return dictionary[index];
}

/* 4. KOMMENTAAR: Sõlm A uuendus — tõmbab uue juhusliku sõna, kuvab
   eestikeelse termini ja lähtestab vastuse sisestusvälja ning tagasiside. */
function refreshEE() {
  currentEE = randomEntry();
  document.getElementById("wordEE").textContent = currentEE.ee;
  document.getElementById("inputRU").value = "";
  setFeedback("feedbackEE", "", "");
}

/* 5. KOMMENTAAR: Sõlm B uuendus — sümmeetriline Sõlm A funktsioonile,
   kuid vastupidises suunas (kuvatakse vene sõna, oodatakse eesti vastust). */
function refreshRU() {
  currentRU = randomEntry();
  document.getElementById("wordRU").textContent = currentRU.ru;
  document.getElementById("inputEE").value = "";
  setFeedback("feedbackRU", "", "");
}

/* 6. KOMMENTAAR: Tagasiside kuvamise ühisfunktsioon (DRY-põhimõte) —
   väldib koodikordust mõlema sõlme jaoks ja hoiab visuaalse oleku
   (roheline/punane) ühes kohas hallatavana. */
function setFeedback(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = "feedback" + (type ? " " + type : "");
}

/* 7. KOMMENTAAR: Vastuse normaliseerimine enne võrdlust — eemaldab
   tühikud ja teisendab väiketähtedeks, et vältida valenegatiivseid
   tulemusi kasutaja väiksemate kirjavigade tõttu (nt lisatühik lõpus). */
function normalize(str) {
  return str.trim().toLowerCase();
}

/* 8. KOMMENTAAR: Sõlme A kontrollkood — võrdleb kasutaja sisestust
   õige vene vastega. Vastavalt tulemusele uuendatakse globaalset
   skoori (loendurid) ja antakse kohene visuaalne tagasiside, sarnaselt
   sellele, kuidas teenus kinnitab (acknowledge) või lükkab tagasi (reject)
   sissetuleva päringu. */
function checkEE() {
  const userAnswer = normalize(document.getElementById("inputRU").value);
  const correctAnswer = normalize(currentEE.ru);
  if (userAnswer === correctAnswer) {
    correctCount++;
    setFeedback("feedbackEE", "Õige! ✓ (" + currentEE.ru + ")", "ok");
  } else {
    wrongCount++;
    setFeedback("feedbackEE", "Vale. Õige vastus: " + currentEE.ru, "err");
  }
  updateScore();
}

/* 9. KOMMENTAAR: Sõlme B kontrollkood — vastupidise suuna loogika.
   Eraldi funktsioonina hoitud, sest kaks sõlme kontrollivad andmeid
   üksteisest sõltumatult (nii nagu hajussüsteemis kaks teenust ei jaga
   otseselt üksteise sisemist olekut, vaid ainult ühist andmeallikat). */
function checkRU() {
  const userAnswer = normalize(document.getElementById("inputEE").value);
  const correctAnswer = normalize(currentRU.ee);
  if (userAnswer === correctAnswer) {
    correctCount++;
    setFeedback("feedbackRU", "Правильно! ✓ (" + currentRU.ee + ")", "ok");
  } else {
    wrongCount++;
    setFeedback("feedbackRU", "Неверно. Правильный ответ: " + currentRU.ee, "err");
  }
  updateScore();
}

/* 10. KOMMENTAAR: Ekraanil kuvatava skoori ja sõnavara mahu uuendus —
    eraldi vaate-uuendusfunktsioon (render), et loogika (check-funktsioonid)
    ja kuva (DOM) oleksid selgelt lahutatud. */
function updateScore() {
  document.getElementById("scoreCorrect").textContent = correctCount;
  document.getElementById("scoreWrong").textContent = wrongCount;
}

/* 11. KOMMENTAAR: Klaviatuuriga kinnitamine (Enter) — parandab
   kasutajakogemust (usability), et vastust ei peaks iga kord hiirega
   kinnitama; testitud mõlema sisestusvälja peal. */
document.getElementById("inputRU").addEventListener("keydown", function (e) {
  if (e.key === "Enter") checkEE();
});
document.getElementById("inputEE").addEventListener("keydown", function (e) {
  if (e.key === "Enter") checkRU();
});

/* 12. KOMMENTAAR: Sündmuste (event listeners) sidumine nuppudega —
   "Kontrolli/Проверить" ja "Uus sõna/Новое слово" nupud kummagi sõlme jaoks. */
document.getElementById("checkEE").addEventListener("click", checkEE);
document.getElementById("checkRU").addEventListener("click", checkRU);
document.getElementById("refreshEE").addEventListener("click", refreshEE);
document.getElementById("refreshRU").addEventListener("click", refreshRU);

/* 13. KOMMENTAAR: Rakenduse käivitus (init) — täidab sõnavara mahu välja
   ja laeb kummalegi sõlmele esimese juhusliku sõna kohe lehe avanemisel. */
document.getElementById("dictSize").textContent = dictionary.length;
refreshEE();
refreshRU();
