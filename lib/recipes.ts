// Общие данные и типы: ими пользуются и страница /app, и серверный маршрут /api/generate.

export const INGREDIENTS = [
  { emoji: "🍗", name: "Курица" },
  { emoji: "🥩", name: "Говядина" },
  { emoji: "🐟", name: "Рыба" },
  { emoji: "🥚", name: "Яйца" },
  { emoji: "🍚", name: "Рис" },
  { emoji: "🍝", name: "Макароны" },
  { emoji: "🥔", name: "Картофель" },
  { emoji: "🧅", name: "Лук" },
  { emoji: "🥕", name: "Морковь" },
  { emoji: "🍅", name: "Помидоры" },
  { emoji: "🥒", name: "Огурцы" },
  { emoji: "🫑", name: "Болгарский перец" },
  { emoji: "🍄", name: "Грибы" },
  { emoji: "🧀", name: "Сыр" },
  { emoji: "🥛", name: "Молоко" },
  { emoji: "🧄", name: "Чеснок" },
] as const;

export const CUISINES = [
  "Любая",
  "Домашняя",
  "Европейская",
  "Итальянская",
  "Азиатская",
  "Грузинская",
] as const;

export const TIMES = [
  { minutes: 15, label: "до 15 минут" },
  { minutes: 30, label: "до 30 минут" },
  { minutes: 60, label: "до 1 часа" },
] as const;

// Необязательные ограничения по питанию: label — что видит пользователь,
// prompt — как это формулируется для Gemini.
export const DIETS = [
  { id: "vegetarian", label: "Вегетарианское", prompt: "вегетарианское (без мяса, птицы и рыбы)" },
  { id: "gluten-free", label: "Без глютена", prompt: "без глютена (без пшеницы, ржи, ячменя, обычной муки и макарон)" },
  { id: "lactose-free", label: "Без лактозы", prompt: "без лактозы (без молока и молочных продуктов с лактозой)" },
  { id: "nut-free", label: "Без орехов", prompt: "без орехов (без любых орехов и продуктов, которые могут их содержать)" },
] as const;

export const SERVINGS =[1, 2, 3, 4, 5, 6] as const;
export const DEFAULT_SERVINGS = 2;

export const MAX_INGREDIENTS = 20;

export type Recipe = {
  title: string;
  description: string;
  time_minutes: number;
  ingredients: { name: string; amount: string }[];
  missing_ingredients: string[];
  steps: string[];
};
