// Вариант F «Два настроения»: день (мир C) и ночь (мир E) на скелете A.
// Ключ@night — текст для ночного режима, ключ.m — для узкого экрана, где девочки не гуляют по странице.
import { T as A } from "../i18n.js";
import { T as E, LINES as E_LINES } from "../e/i18n-e.js";
import { LINES as C_LINES } from "../c/i18n-c.js";

const F = {
  ru: {
    "skip": "К содержанию",
    "nav.how": "Как это", "nav.day": "Распорядок", "nav.hire": "Нанять", "nav.price": "Цены", "nav.faq": "Вопросы",
    "mode.group": "Настроение страницы", "mode.day": "Уютно", "mode.night": "Смелее",
    "mode.said": "Днём: уютный офис, девочки гуляют по странице.",
    "mode.said@night": "Ночь: свет погас, включились лампы. Курсор — твой взгляд.",

    "hero.title": "Офис, который живёт у тебя на экране",
    "hero.title@night": "Офис, который не спит, пока ты здесь",
    "hero.lead": "Маленькие пиксельные сотрудницы ходят по краю рабочего стола, пьют кофе и сплетничают. Позовёшь — сядут за стол и правда сделают задачу через Claude Code, Codex или любую модель.",
    "hero.lead@night": "Все задержались после работы. Юки дописывает тест, остальные делают вид, что заняты, и почему-то всё время смотрят на тебя. Задачи — по-настоящему, через Claude Code, Codex или любую модель.",
    "hero.hire": "Нанять первую сотрудницу",
    "hero.hire@night": "Нанять сотрудницу",
    "hero.hint": "Ткни в пустое место: прилетит кофе. Две сбежали гулять по странице — лови.",
    "hero.hint.m": "Нажми на любую: она отзовётся.",
    "hero.hint@night": "Курсор — твой взгляд. Клик — похвала. Засмотришься на одну — остальные заметят.",
    "hero.hint@night.m": "Нажми на сотрудницу — это похвала. Симпатия копится под офисом.",
    "stage.label": "Живой офис: кликни по сотруднице, она отзовётся",
    "stage.label@night": "Ночной офис: наведи курсор на сотрудницу, кликни, чтобы похвалить",
    "editor.comment": "// Юки: дата приходит строкой — чиню парсер",
    "editor.comment@night": "// Юки: чиню парсер. Не стой над душой…",

    "how.title": "Не ещё один чат. Коллеги.",
    "how.title@night": "Не ещё один чат. Коллеги, которые краснеют.",
    "how.life.p@night": "Окно висит на краю рабочего стола и ничего не просит. Утром очередь к кофемашине, днём работа, вечером диван. Иногда кто-нибудь машет. Иногда краснеет, если долго смотреть.",
    "how.memory.p@night": "У каждой характер и своя память. Через месяц Момо всё ещё помнит капучино без сахара, какой проект горит и как зовут твоего кота. Всё это лежит у тебя на компьютере.",
    "chat.me1@night": "Юки, почему тесты красные?",
    "chat.y1@night": "Смотрю. Только не стой над душой…",
    "chat.y2@night": "Дата приходит строкой. Поправила парсер, 43 из 43 зелёные.",
    "chat.me2@night": "Умница",
    "chat.y3@night": "…повтори, я не расслышала.",

    "day.p": "Подвинь время и посмотри, чем занят офис. После семи вечера включаются лампы, и вся страница переходит в ночной режим. В приложении так же, только по твоим часам.",
    "day.night": "ночь", "day.dayword": "день",

    "hire.title@night": "Анкета новой сотрудницы",
    "hire.p": "Резюме не нужно. Собери сотрудницу и нажми «Нанять»: днём она сразу выбежит гулять по странице.",
    "hire.p.m": "Резюме не нужно. Собери сотрудницу и нажми «Нанять»: она придёт в офис наверху страницы.",
    "hire.p@night": "Заполни и нажми «Нанять»: она войдёт в офис наверху страницы и поздоровается так, как ты скажешь.",
    "hire.name": "Имя",
    "hire.preview": "Привет, {b}! Я уже бегу",
    "hire.preview@night": "Приятно познакомиться, {b}.",
    "hire.hired": "Нанята и уже убежала. Поищи её на странице.",
    "hire.hired.m": "Нанята. Посмотри наверх.",
    "hire.hired@night": "Нанята. Она уже в офисе.",
    "hire.look": "Посмотреть",
    "hire.full": "В офисе тесно: самая первая новенькая ушла домой.",
    "hire.nosport": "Ночью в офисе дресс-код: спорт — днём.",

    "price.title": "Пиксели бесплатно. Красота по желанию.",
    "price.title@night": "Подарить ей нарисованный портрет",
    "price.p": "Приложение и пиксельные сотрудницы бесплатны всегда. Платишь, только если хочешь свою девочку нарисованной художницей-нейросетью.",
    "price.p@night": "Пиксельные сотрудницы бесплатны всегда. А если хочется — закажи ей портрет: художница-нейросеть нарисует её в аниме-стиле, по её характеру. Память и характер те же, меняется только то, как она выглядит у тебя на экране.",
    "tier.px.d": "Конструктор сотрудниц без ограничений, чат, память, задачи в папках, любая модель своим ключом.",
    "tier.hd.d": "Крупнее: лица, пряди, складки. Новые действия по просьбе: «пусть танцует».",
    "tier.art.d": "За одну сотрудницу. Кнопка «Нарисовать её по-настоящему» прямо в офисе.",
    "tier.hd.note": "скоро",
    "price.wall": "Так они выглядят нарисованными. Нажми на любую.",
    "price.wall@night": "Выбрать, кому подарить",
    "gift.iskra": "Это я? Повешу над кофемашиной!", "gift.yuki": "Похоже. Даже чёлку поймали.", "gift.momo": "Я бы нарисовала лучше. Но мило!", "gift.nori": "Беру в презентацию для клиента.",

    "faq.q0": "Это что-то для взрослых?",
    "faq.a0": "Нет. Днём это уютный офис, ночью — офисный ромком: смущение, румянец, «не смотри так». Все сотрудницы взрослые и одеты по-офисному. Если и это слишком, переключи на «Уютно».",
    "faq.a3": "Да: Yandex AI Studio, российские OpenAI-совместимые агрегаторы и локальные модели. Нарисованных сотрудниц можно будет оплатить картой РФ.",

    "footer": "Офис в коробке. Собрано вечерами, кофе включён.",
    "footer@night": "Офис в коробке. Собрано вечерами, пока все спали.",
  },
  en: {
    "skip": "Skip to content",
    "nav.how": "How it works", "nav.day": "Routine", "nav.hire": "Hire", "nav.price": "Pricing", "nav.faq": "FAQ",
    "mode.group": "Page mood", "mode.day": "Cozy", "mode.night": "Bolder",
    "mode.said": "Daytime: a cozy office, the girls wander the page.",
    "mode.said@night": "Night: lights out, lamps on. Your cursor is your gaze.",

    "hero.title": "An office that lives on your screen",
    "hero.title@night": "An office that stays up while you’re here",
    "hero.lead": "Tiny pixel coworkers stroll along the edge of your desktop, drink coffee and gossip. Call one over and she sits down and actually does the task — through Claude Code, Codex or any model.",
    "hero.lead@night": "Everyone stayed late. Yuki is finishing a test, the rest pretend to be busy and for some reason keep looking at you. The tasks are real, through Claude Code, Codex or any model.",
    "hero.hire": "Hire your first coworker",
    "hero.hire@night": "Hire a coworker",
    "hero.hint": "Poke empty space: coffee flies in. Two of them ran off to wander the page — catch them.",
    "hero.hint.m": "Tap any of them — she’ll answer.",
    "hero.hint@night": "Your cursor is your gaze. A click is praise. Stare at one too long and the others will notice.",
    "hero.hint@night.m": "Tap a coworker to praise her. Affection adds up below the office.",
    "stage.label": "Live office: click a coworker and she answers",
    "stage.label@night": "Night office: hover over a coworker, click to praise her",
    "editor.comment": "// Yuki: the date comes in as a string — fixing the parser",
    "editor.comment@night": "// Yuki: fixing the parser. Don’t hover over me…",

    "how.title": "Not another chat. Coworkers.",
    "how.title@night": "Not another chat. Coworkers who blush.",
    "how.life.p@night": "The window sits at the edge of the desktop and asks for nothing. Coffee queue in the morning, work in the afternoon, sofa at night. Sometimes someone waves. Sometimes someone blushes, if you look too long.",
    "how.memory.p@night": "Each one has her own personality and memory. A month later Momo still remembers the sugar-free cappuccino, which project is on fire and your cat’s name. All of it lives on your computer.",
    "chat.me1@night": "Yuki, why are the tests red?",
    "chat.y1@night": "Looking. Just don’t hover over me…",
    "chat.y2@night": "The date comes in as a string. Fixed the parser, 43 of 43 green.",
    "chat.me2@night": "Good job",
    "chat.y3@night": "…say that again, I didn’t catch it.",

    "day.p": "Drag the clock and see what the office is up to. After 7 pm the lamps come on and the whole page switches to night. The app does the same, on your own hours.",
    "day.night": "night", "day.dayword": "day",

    "hire.title@night": "New coworker application",
    "hire.p": "No résumé needed. Build a coworker and press Hire: in the daytime she runs straight out onto the page.",
    "hire.p.m": "No résumé needed. Build a coworker and press Hire: she’ll walk into the office at the top of the page.",
    "hire.p@night": "Fill it in and press Hire: she’ll walk into the office at the top of the page and greet you the way you ask.",
    "hire.name": "Name",
    "hire.preview": "Hi, {b}! On my way",
    "hire.preview@night": "Nice to meet you, {b}.",
    "hire.hired": "Hired and already gone. Look for her on the page.",
    "hire.hired.m": "Hired. Look up.",
    "hire.hired@night": "Hired. She’s already in the office.",
    "hire.look": "Take a look",
    "hire.full": "The office is crowded: the earliest new hire went home.",
    "hire.nosport": "Night dress code: sportswear is for daytime.",

    "price.title": "Pixels are free. Beauty is optional.",
    "price.title@night": "Give her a hand-drawn portrait",
    "price.p": "The app and pixel coworkers are free forever. You only pay if you want your girl drawn by an AI artist.",
    "price.p@night": "Pixel coworkers are free forever. If you feel like it, order her a portrait: an AI artist draws her in anime style, true to her personality. Same memory, same character — only how she looks on your screen changes.",
    "tier.px.d": "Unlimited coworker builder, chat, memory, tasks in folders, any model with your own key.",
    "tier.hd.d": "Bigger: faces, hair strands, folds. New actions on request: “make her dance”.",
    "tier.art.d": "Per coworker. A “Draw her for real” button right in the office.",
    "tier.hd.note": "soon",
    "price.wall": "This is how they look hand-drawn. Click any of them.",
    "price.wall@night": "Choose who gets one",
    "gift.iskra": "Is that me? Going over the coffee machine!", "gift.yuki": "Looks like me. They even got the bangs.", "gift.momo": "I’d have drawn it better. Still cute!", "gift.nori": "Putting this in the client deck.",

    "faq.q0": "Is this an adult thing?",
    "faq.a0": "No. By day it’s a cozy office, by night an office rom-com: blushing, flustered looks, “don’t stare like that”. All coworkers are adults in office clothes. If even that’s too much, switch to Cozy.",

    "footer": "Office in a Box. Built in the evenings, coffee included.",
    "footer@night": "Office in a Box. Built in the evenings while everyone slept.",
  },
};

// из E: анкета, симпатия, ночные подарки
const FROM_E = ["f.call", "f.yourname", "call.boss", "call.chief", "call.name", "boss", "chief", "roster.label", "roster.praise",
  "lvl.0", "lvl.1", "lvl.2", "lvl.3", "lvl.4", "lvl.5"];
for (const l of ["ru", "en"]) {
  for (const k of FROM_E) F[l][k] = E[l][k];
  for (const id of ["iskra", "yuki", "momo", "nori"]) F[l][`gift.${id}@night`] = E[l][`gift.${id}`];
  F[l]["role.new"] = E[l]["role.new"];
}

export const NAMES = { ru: { iskra: "Искра", yuki: "Юки", momo: "Момо", nori: "Нори" }, en: { iskra: "Iskra", yuki: "Yuki", momo: "Momo", nori: "Nori" } };

// Pixelify Sans склеивает «fi» в «A» неотключаемо — разбиваем пару невидимым ZWNJ
export const unfi = (s) => s.replace(/f(?=[iíl])/g, "f‌");

export function tr(lang, mode, k, narrow = false) {
  const d = F[lang], n = mode === "night";
  const s = (n && narrow && d[`${k}@night.m`]) || (n && d[`${k}@night`]) || (narrow && d[`${k}.m`]) || d[k] || A[lang][k] || F.ru[k] || A.ru[k] || k;
  return unfi(s);
}

// реплики: днём — C (уютно + кофе и прыжки), ночью — E (смелее, с обращением {b})
export const LINES = {
  ru: { day: C_LINES.ru.cozy, night: E_LINES.ru.bold },
  en: { day: C_LINES.en.cozy, night: E_LINES.en.bold },
};
