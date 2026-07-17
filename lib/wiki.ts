// ponytail: hardcoded topic list — move to DB only if topics become admin-managed.
export type WikiSection = {
  title?: string;
  rows?: [es: string, pl: string][];
  notes?: string[];
};

export const WIKI_TOPICS = [
  { slug: "pronouns", title: "Pronouns" },
  { slug: "adverbs", title: "Adverbs" },
  { slug: "prepositions", title: "Prepositions" },
  { slug: "days-of-the-week", title: "Days of the week" },
  { slug: "months", title: "Months" },
  { slug: "seasons", title: "Seasons" },
  { slug: "numbers", title: "Numbers" },
  { slug: "time-words", title: "Time words" },
] as const;

// ponytail: hardcoded es→pl content — one map entry per topic, empty topics show a stub.
export const WIKI_CONTENT: Record<string, WikiSection[]> = {
  pronouns: [
    {
      title: "Subject pronouns",
      notes: [
        "Usually dropped in Spanish — the verb ending shows the person: hablo = (yo) hablo.",
      ],
      rows: [
        ["yo", "ja"],
        ["tú", "ty"],
        ["él", "on"],
        ["ella", "ona"],
        ["usted", "pan / pani"],
        ["nosotros / nosotras", "my"],
        ["vosotros / vosotras", "wy"],
        ["ellos", "oni"],
        ["ellas", "one"],
        ["ustedes", "państwo"],
      ],
    },
    {
      title: "Direct object pronouns",
      rows: [
        ["me", "mnie"],
        ["te", "ciebie"],
        ["lo", "jego / to"],
        ["la", "ją"],
        ["nos", "nas"],
        ["os", "was"],
        ["los / las", "ich / je"],
      ],
    },
    {
      title: "Possessives",
      rows: [
        ["mi", "mój / moja"],
        ["tu", "twój / twoja"],
        ["su", "jego / jej / pana / pani"],
        ["nuestro / nuestra", "nasz / nasza"],
        ["vuestro / vuestra", "wasz / wasza"],
        ["su (de ellos)", "ich"],
      ],
    },
  ],
  adverbs: [
    {
      notes: [
        "Adjective + -mente = adverb (like Polish -ie / -o): rápida → rápidamente (szybko), lenta → lentamente (powoli).",
      ],
      rows: [
        ["muy", "bardzo"],
        ["bien", "dobrze"],
        ["mal", "źle"],
        ["mucho", "dużo"],
        ["poco", "mało"],
        ["demasiado", "za dużo"],
        ["bastante", "dość / wystarczająco"],
        ["casi", "prawie"],
        ["ya", "już"],
        ["todavía", "jeszcze / nadal"],
        ["también", "też"],
        ["tampoco", "też nie"],
        ["aquí", "tutaj"],
        ["allí", "tam"],
        ["así", "tak / w ten sposób"],
        ["rápido", "szybko"],
        ["despacio", "powoli"],
        ["quizás", "może"],
      ],
    },
  ],
  prepositions: [
    {
      title: "Basic",
      notes: [
        "por vs para: por = przez / po / z powodu (por la calle, gracias por), para = dla / żeby / do celu (para ti, para aprender).",
      ],
      rows: [
        ["a", "do / na (kierunek)"],
        ["de", "z / od / o (pochodzenie, przynależność)"],
        ["en", "w / na"],
        ["con", "z (kimś, czymś)"],
        ["sin", "bez"],
        ["por", "przez / po / z powodu"],
        ["para", "dla / żeby"],
        ["entre", "między"],
        ["hasta", "do / aż do"],
        ["desde", "od / z (miejsca, czasu)"],
        ["hacia", "w kierunku"],
        ["durante", "podczas"],
        ["sobre", "na / o (temacie)"],
      ],
    },
    {
      title: "Place (with de)",
      rows: [
        ["encima de", "na / nad"],
        ["debajo de", "pod"],
        ["delante de", "przed"],
        ["detrás de", "za"],
        ["al lado de", "obok"],
        ["cerca de", "blisko"],
        ["lejos de", "daleko od"],
        ["dentro de", "wewnątrz"],
        ["fuera de", "na zewnątrz"],
      ],
    },
    {
      title: "Time (before / after)",
      rows: [
        ["antes de", "przed"],
        ["después de", "po"],
      ],
    },
  ],
  numbers: [
    {
      title: "1–10",
      rows: [
        ["uno", "jeden"],
        ["dos", "dwa"],
        ["tres", "trzy"],
        ["cuatro", "cztery"],
        ["cinco", "pięć"],
        ["seis", "sześć"],
        ["siete", "siedem"],
        ["ocho", "osiem"],
        ["nueve", "dziewięć"],
        ["diez", "dziesięć"],
      ],
    },
    {
      title: "Tens",
      rows: [
        ["veinte", "dwadzieścia"],
        ["treinta", "trzydzieści"],
        ["cuarenta", "czterdzieści"],
        ["cincuenta", "pięćdziesiąt"],
        ["sesenta", "sześćdziesiąt"],
        ["setenta", "siedemdziesiąt"],
        ["ochenta", "osiemdziesiąt"],
        ["noventa", "dziewięćdziesiąt"],
        ["cien", "sto"],
      ],
    },
    {
      title: "Building numbers",
      notes: [
        "From 31 up: tens + y + unit. 43 = cuarenta y tres, 67 = sesenta y siete, 91 = noventa y uno.",
        "21–29 are one word with veinti-: 21 = veintiuno, 23 = veintitrés, 28 = veintiocho.",
        "16–19 are also one word: dieciséis, diecisiete, dieciocho, diecinueve.",
      ],
      rows: [
        ["cuarenta y tres", "czterdzieści trzy (43)"],
        ["sesenta y siete", "sześćdziesiąt siedem (67)"],
        ["veintidós", "dwadzieścia dwa (22)"],
        ["dieciocho", "osiemnaście (18)"],
      ],
    },
  ],
  "days-of-the-week": [
    {
      notes: ["Days are not capitalized in Spanish."],
      rows: [
        ["lunes", "poniedziałek"],
        ["martes", "wtorek"],
        ["miércoles", "środa"],
        ["jueves", "czwartek"],
        ["viernes", "piątek"],
        ["sábado", "sobota"],
        ["domingo", "niedziela"],
      ],
    },
  ],
  months: [
    {
      notes: ["Months are not capitalized in Spanish."],
      rows: [
        ["enero", "styczeń"],
        ["febrero", "luty"],
        ["marzo", "marzec"],
        ["abril", "kwiecień"],
        ["mayo", "maj"],
        ["junio", "czerwiec"],
        ["julio", "lipiec"],
        ["agosto", "sierpień"],
        ["septiembre", "wrzesień"],
        ["octubre", "październik"],
        ["noviembre", "listopad"],
        ["diciembre", "grudzień"],
      ],
    },
  ],
  seasons: [
    {
      rows: [
        ["la primavera", "wiosna"],
        ["el verano", "lato"],
        ["el otoño", "jesień"],
        ["el invierno", "zima"],
      ],
    },
  ],
  "time-words": [
    {
      title: "Days",
      rows: [
        ["hoy", "dzisiaj"],
        ["ayer", "wczoraj"],
        ["anteayer", "przedwczoraj"],
        ["mañana", "jutro"],
        ["pasado mañana", "pojutrze"],
      ],
    },
    {
      title: "Parts of the day",
      rows: [
        ["la mañana", "poranek / rano"],
        ["el mediodía", "południe"],
        ["la tarde", "popołudnie"],
        ["la noche", "noc / wieczór"],
        ["la medianoche", "północ"],
      ],
    },
    {
      title: "Units of time",
      rows: [
        ["el segundo", "sekunda"],
        ["el minuto", "minuta"],
        ["la hora", "godzina"],
        ["el día", "dzień"],
        ["la semana", "tydzień"],
        ["el mes", "miesiąc"],
        ["el año", "rok"],
      ],
    },
    {
      title: "Frequency & order",
      rows: [
        ["ahora", "teraz"],
        ["antes", "wcześniej"],
        ["después / luego", "później / potem"],
        ["temprano", "wcześnie"],
        ["tarde", "późno"],
        ["siempre", "zawsze"],
        ["a menudo", "często"],
        ["a veces", "czasami"],
        ["nunca", "nigdy"],
      ],
    },
  ],
};
