// Тексты варианта B («Посмелее»). Берём общие ключи из ../i18n.js и переписываем то, что звучит иначе на плакате.
import { T as BASE, LINES } from "../i18n.js";
export { LINES };

const RU = {
  "hero.t1": "Они живут", "hero.t2": "у тебя", "hero.t3": "на экране.",
  "hero.t1.bold": "Они ждут", "hero.t2.bold": "тебя", "hero.t3.bold": "на экране.",
  "hero.lead": "Пиксельные сотрудницы пьют кофе, спорят у кулера и помнят, как зовут твоего кота. Позовёшь — сядут за стол и сделают задачу через Claude Code, Codex или любую модель.",
  "hero.lead.bold": "Пиксельные сотрудницы пьют кофе, сплетничают у кулера и помнят, что ты любишь. Позовёшь — сядут за стол и сделают задачу через Claude Code, Codex или любую модель. Похвалишь — сделают ещё одну.",
  "hero.hire": "Нанять первую", "hero.download": "Скачать", "hero.soon": "скоро",
  "hero.meta": "macOS, Windows, Linux. Бесплатно, без подписки.",
  "hero.poke": "Кликни по любой — отзовётся.",
  "how.title": "Не чат. Коллеги.",
  "how.life.t": "Живут", "how.life.p": "Утром очередь к кофемашине, днём работа, вечером диван и отжимания у кулера. Окно висит на краю экрана и ничего от тебя не хочет.",
  "how.memory.t": "Помнят", "how.memory.p": "У каждой характер и своя память. Через месяц Сора всё ещё знает, какой проект горит и как зовут твоего кота.",
  "how.work.t": "Делают", "how.work.p": "Выбираешь папку проекта — она садится за стол. Виден каждый файл, который она читает, и каждая команда. Остановить — одна кнопка.",
  "chat.title": "Юки и красные тесты",
  "chat.who.me": "Ты", "chat.who.her": "Юки",
  "engines": "Работает с тем, что уже стоит:",
  "hire.title": "Отдел кадров",
  "hire.p": "Собери сотрудницу и нажми «Нанять» — она войдёт в офис наверху страницы.",
  "hire.name": "Имя", "hire.look": "Наверх, к ней",
  "price.title": "Пиксели бесплатно.", "price.title2": "Красота — от 390 ₽.",
  "price.p": "Приложение и пиксельные сотрудницы бесплатны всегда. Платишь только за то, чтобы твою девочку нарисовал художник-нейросеть.",
  "tier.px.price": "0 ₽", "tier.hd.price": "0 ₽", "tier.art.price": "390 ₽", "tier.art.from": "от",
  "faq.title": "Вопросы",
  "footer": "Офис в коробке. Собрано вечерами, после основной работы.",
  "footer.a": "Вариант A",
};

const EN = {
  "hero.t1": "They live", "hero.t2": "on your", "hero.t3": "screen.",
  "hero.t1.bold": "They wait", "hero.t2.bold": "for you,", "hero.t3.bold": "boss.",
  "hero.lead": "Pixel coworkers drink coffee, argue by the water cooler and remember your cat's name. Call one over and she sits down and does the task through Claude Code, Codex or any model.",
  "hero.lead.bold": "Pixel coworkers drink coffee, gossip by the cooler and remember what you like. Call one over and she sits down and does the task through Claude Code, Codex or any model. Praise her and she'll do another.",
  "hero.hire": "Hire the first one", "hero.download": "Download", "hero.soon": "soon",
  "hero.meta": "macOS, Windows, Linux. Free, no subscription.",
  "hero.poke": "Click any of them — she'll answer.",
  "how.title": "Not a chat. Coworkers.",
  "how.life.t": "They live", "how.life.p": "Coffee queue in the morning, work after lunch, sofa and push-ups by the cooler at night. The window sits at the edge of your screen and asks for nothing.",
  "how.memory.t": "They remember", "how.memory.p": "Each has a personality and her own memory. A month in, Sora still knows which project is on fire and your cat's name.",
  "how.work.t": "They deliver", "how.work.p": "Pick a project folder and she sits at her desk. You see every file she reads and every command she runs. Stopping her is one button.",
  "chat.title": "Yuki and the red tests",
  "chat.who.me": "You", "chat.who.her": "Yuki",
  "engines": "Works with what you already run:",
  "hire.title": "HR department",
  "hire.p": "Put a coworker together and press Hire — she'll walk into the office at the top of the page.",
  "hire.name": "Name", "hire.look": "Up, to meet her",
  "price.title": "Pixels are free.", "price.title2": "Beauty from $5.",
  "price.p": "The app and pixel coworkers are free forever. You only pay to have your girl drawn by a neural artist.",
  "tier.px.price": "$0", "tier.hd.price": "$0", "tier.art.price": "$5", "tier.art.from": "from",
  "faq.title": "Questions",
  "footer": "Office in a Box. Built in the evenings, after the day job.",
  "footer.a": "Variant A",
};

export const T = { ru: { ...BASE.ru, ...RU }, en: { ...BASE.en, ...EN } };
