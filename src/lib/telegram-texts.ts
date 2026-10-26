import type { Locale } from "@/lib/i18n";

// Everything the bot says, in both site languages. HTML parse mode: only <b>, <i>, <a>, <code>.

export const texts = {
  ru: {
    welcome:
      "Здорово! Я бот <b>Ingenium</b>.\n\n" +
      "Буду присылать новые конспекты и новости с сайта, а раз в день — карточку на повторение.\n\n" +
      "/new — последние материалы\n/find запрос — поиск по конспектам\n/card — карточка на повторение\n" +
      "/notify — вкл/выкл новые материалы\n/remind — вкл/выкл ежедневные карточки\n/lang — English\n/stop — отписаться",
    ownerWelcome:
      "Чат привязан к админке ✅\n\nКидай сюда текст, ссылку, фото или PDF — всё упадёт в админку черновиком. " +
      "Хэштеги станут тегами. /drafts — последние черновики.",
    linkExpired: "Ссылка привязки устарела. Открой /api/telegram/setup на сайте ещё раз.",
    unknown: "Не понял. Команды: /new, /find, /card, /notify, /remind, /lang, /stop",
    notifyOn: "Новые материалы: включено 🔔",
    notifyOff: "Новые материалы: выключено 🔕",
    remindOn: "Ежедневная карточка: включена 🧠",
    remindOff: "Ежедневная карточка: выключена",
    stopped: "Отписал. Захочешь назад — жми /start.",
    lang: "Теперь по-русски.",
    latest: "<b>Последние материалы</b>",
    nothing: "Пока пусто.",
    findUsage: "Напиши так: /find закон Ома",
    notFound: "Ничего не нашёл.",
    noCards: "Карточек пока нет: их добавляют в конспекты блоком ```cards.",
    reminder: "🧠 <b>Повторение дня</b>\nОтвет под спойлером — сначала вспомни сам.",
    more: "Ещё карточку",
    remindStop: "Не присылать",
    newMaterial: "🆕 <b>Новый материал</b>",
    newNews: "📰 <b>Новость</b>",
    open: "Открыть на сайте",
    draftSaved: "Черновик сохранён 📝",
    edit: "Открыть в админке",
    draftFailed: "Не смог сохранить черновик, глянь логи Vercel.",
    draftEmpty: "Пустое сообщение, нечего сохранять.",
    badFile: "Такой файл не возьму: только PDF, HTML и картинки до 20 МБ.",
    drafts: "<b>Черновики</b>",
  },
  en: {
    welcome:
      "Hi! I'm the <b>Ingenium</b> bot.\n\n" +
      "I'll send you new notes and news from the site, and a flashcard to review once a day.\n\n" +
      "/new — latest materials\n/find query — search the notes\n/card — a flashcard to review\n" +
      "/notify — new materials on/off\n/remind — daily flashcard on/off\n/lang — по-русски\n/stop — unsubscribe",
    ownerWelcome:
      "Chat linked to the admin ✅\n\nSend me text, a link, a photo or a PDF and it lands in the admin as a draft. " +
      "Hashtags become tags. /drafts — latest drafts.",
    linkExpired: "This link has expired. Open /api/telegram/setup on the site again.",
    unknown: "Didn't get that. Commands: /new, /find, /card, /notify, /remind, /lang, /stop",
    notifyOn: "New materials: on 🔔",
    notifyOff: "New materials: off 🔕",
    remindOn: "Daily flashcard: on 🧠",
    remindOff: "Daily flashcard: off",
    stopped: "Unsubscribed. Press /start to come back.",
    lang: "English it is.",
    latest: "<b>Latest materials</b>",
    nothing: "Nothing here yet.",
    findUsage: "Try: /find Ohm's law",
    notFound: "Nothing found.",
    noCards: "No flashcards yet: notes get them from a ```cards block.",
    reminder: "🧠 <b>Daily review</b>\nThe answer is under the spoiler — try to recall it first.",
    more: "Another card",
    remindStop: "Stop these",
    newMaterial: "🆕 <b>New material</b>",
    newNews: "📰 <b>News</b>",
    open: "Open on the site",
    draftSaved: "Draft saved 📝",
    edit: "Open in the admin",
    draftFailed: "Couldn't save the draft, check the Vercel logs.",
    draftEmpty: "Empty message, nothing to save.",
    badFile: "Can't take that file: only PDF, HTML and images up to 20 MB.",
    drafts: "<b>Drafts</b>",
  },
} satisfies Record<Locale, Record<string, string>>;

export const commands: Record<Locale, { command: string; description: string }[]> = {
  ru: [
    { command: "new", description: "Последние материалы" },
    { command: "find", description: "Поиск по конспектам" },
    { command: "card", description: "Карточка на повторение" },
    { command: "notify", description: "Вкл/выкл новые материалы" },
    { command: "remind", description: "Вкл/выкл ежедневные карточки" },
    { command: "lang", description: "Язык: русский / English" },
    { command: "stop", description: "Отписаться" },
  ],
  en: [
    { command: "new", description: "Latest materials" },
    { command: "find", description: "Search the notes" },
    { command: "card", description: "A flashcard to review" },
    { command: "notify", description: "New materials on/off" },
    { command: "remind", description: "Daily flashcard on/off" },
    { command: "lang", description: "Language: English / русский" },
    { command: "stop", description: "Unsubscribe" },
  ],
};
