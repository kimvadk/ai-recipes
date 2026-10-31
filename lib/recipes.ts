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

export const MAX_INGREDIENTS = 20;

export type Recipe = {
  title: string;
  description: string;
  time_minutes: number;
  ingredients: { name: string; amount: string }[];
  missing_ingredients: string[];
  steps: string[];
};
