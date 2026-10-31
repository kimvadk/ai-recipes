"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  CUISINES,
  DEFAULT_SERVINGS,
  DIETS,
  INGREDIENTS,
  MAX_INGREDIENTS,
  SERVINGS,
  TIMES,
  type Recipe,
} from "@/lib/recipes";

// «1 порция», «2 порции», «5 порций»
function servingsLabel(n: number) {
  return n === 1 ? "1 порция" : n < 5 ? `${n} порции` : `${n} порций`;
}

// Общий вид «таблетки»-кнопки: выбранная — оранжевая, невыбранная — светлая.
function chipClass(selected: boolean) {
  return [
    "rounded-2xl border-2 px-5 py-3 text-lg font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40",
    selected
      ? "border-accent bg-accent text-white"
      : "border-sand bg-white text-foreground hover:border-accent",
  ].join(" ");
}

// Рецепт одним текстом — чтобы вставить в заметки или отправить в мессенджер.
function recipeToText(recipe: Recipe, servings: number) {
  const needToBuy = recipe.missing_ingredients.length > 0;
  return [
    `${recipe.title} (${recipe.time_minutes} мин)`,
    recipe.description,
    needToBuy
      ? `Докупить: ${recipe.missing_ingredients.join(", ")}`
      : "Всё есть дома",
    "",
    `Ингредиенты (${servingsLabel(servings)}):`,
    ...recipe.ingredients.map((i) => `- ${i.name} — ${i.amount}`),
    "",
    "Приготовление:",
    ...recipe.steps.map((step, i) => `${i + 1}. ${step}`),
  ].join("\n");
}

function RecipeCard({
  recipe,
  servings,
}: {
  recipe: Recipe;
  servings: number;
}) {
  const needToBuy = recipe.missing_ingredients.length > 0;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function copyRecipe() {
    try {
      await navigator.clipboard.writeText(recipeToText(recipe, servings));
      setCopyState("copied");
    } catch {
      // Например, если браузер запретил доступ к буферу обмена.
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <article className="rounded-3xl bg-white p-7 shadow-md shadow-sand/60">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-2xl font-bold">{recipe.title}</h3>
        <span className="rounded-full bg-sand px-3 py-1 text-sm font-semibold">
          ⏱️ {recipe.time_minutes} мин
        </span>
      </div>
      <p className="mt-2 text-muted">{recipe.description}</p>

      <p
        className={`mt-4 inline-block rounded-xl px-4 py-2 font-semibold ${
          needToBuy ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-900"
        }`}
      >
        {needToBuy
          ? `🛒 Докупить: ${recipe.missing_ingredients.join(", ")}`
          : "✅ Всё есть"}
      </p>

      <h4 className="mt-6 text-lg font-bold">Ингредиенты ({servingsLabel(servings)})</h4>
      <ul className="mt-2 space-y-1">
        {recipe.ingredients.map((item, i) => (
          <li key={i}>
            {item.name} — <span className="text-muted">{item.amount}</span>
          </li>
        ))}
      </ul>

      <h4 className="mt-6 text-lg font-bold">Приготовление</h4>
      <ol className="mt-2 list-decimal space-y-2 pl-6">
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <button
        type="button"
        onClick={copyRecipe}
        className="mt-6 w-full rounded-2xl border-2 border-accent px-5 py-3 text-lg font-semibold text-accent-dark transition hover:bg-cream focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
      >
        {copyState === "copied"
          ? "✓ Скопировано"
          : copyState === "failed"
            ? "Не удалось скопировать"
            : "📋 Скопировать рецепт"}
      </button>
    </article>
  );
}

export default function AppPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [cuisine, setCuisine] = useState<string>(CUISINES[0]);
  const [minutes, setMinutes] = useState<number>(TIMES[1].minutes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [servings, setServings] = useState<number>(DEFAULT_SERVINGS);
  const [diets, setDiets] = useState<string[]>([]);
  // Порции, с которыми были запрошены показанные рецепты (пользователь мог уже переключить кнопки).
  const [recipesServings, setRecipesServings] = useState<number>(DEFAULT_SERVINGS);

  function toggleIngredient(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  const allIngredients = [...selected, ...custom];
  const limitReached = allIngredients.length >= MAX_INGREDIENTS;

  function toggleDiet(id: string) {
    setDiets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // Добавляет свой продукт; повторы (даже с другим регистром) не добавляются.
  function addCustom(e: FormEvent) {
    e.preventDefault();
    const name = customInput.trim().replace(/\s+/g, " ");
    if (!name || limitReached) return;
    const exists = [...INGREDIENTS.map((i) => i.name), ...custom].some(
      (x) => x.toLowerCase() === name.toLowerCase(),
    );
    if (!exists) setCustom((prev) => [...prev, name]);
    setCustomInput("");
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setRecipes([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: allIngredients,
          cuisine,
          minutes,
          servings,
          diets,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.recipes) {
        throw new Error(
          data?.error ?? "Что-то пошло не так. Попробуйте ещё раз.",
        );
      }
      setRecipes(data.recipes);
      setRecipesServings(servings);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Нет связи с сервером. Проверьте интернет и попробуйте снова."
          : e instanceof Error
            ? e.message
            : "Что-то пошло не так. Попробуйте ещё раз.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link href="/" className="text-muted hover:text-accent-dark">
        ← На главную
      </Link>
      <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Что приготовить?</h1>

      <section className="mt-8">
        <h2 className="text-xl font-bold">1. Какие продукты есть?</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {INGREDIENTS.map(({ emoji, name }) => (
            <button
              key={name}
              type="button"
              aria-pressed={selected.includes(name)}
              onClick={() => toggleIngredient(name)}
              className={chipClass(selected.includes(name))}
            >
              {emoji} {name}
            </button>
          ))}
        </div>

        <form onSubmit={addCustom} className="mt-5 flex gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            maxLength={40}
            disabled={limitReached}
            placeholder="Нет в списке? Впишите свой продукт"
            aria-label="Свой продукт"
            className="min-w-0 flex-1 rounded-2xl border-2 border-sand bg-white px-5 py-3 text-lg focus:border-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customInput.trim() || limitReached}
            className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-white transition hover:bg-accent-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Добавить
          </button>
        </form>
        {limitReached && (
          <p className="mt-2 text-muted">
            Достаточно! Можно выбрать не больше {MAX_INGREDIENTS} продуктов.
          </p>
        )}

        {custom.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {custom.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCustom((prev) => prev.filter((x) => x !== name))}
                aria-label={`Убрать: ${name}`}
                className={chipClass(true)}
              >
                {name} ✕
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">2. Какая кухня?</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cuisine === c}
              onClick={() => setCuisine(c)}
              className={chipClass(cuisine === c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">3. Сколько времени?</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {TIMES.map((t) => (
            <button
              key={t.minutes}
              type="button"
              aria-pressed={minutes === t.minutes}
              onClick={() => setMinutes(t.minutes)}
              className={chipClass(minutes === t.minutes)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">4. Сколько порций?</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {SERVINGS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={servings === n}
              aria-label={servingsLabel(n)}
              onClick={() => setServings(n)}
              className={`${chipClass(servings === n)} min-w-14`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">
          5. Есть ограничения?{" "}
          <span className="text-base font-normal text-muted">(по желанию)</span>
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {DIETS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={diets.includes(id)}
              onClick={() => toggleDiet(id)}
              className={chipClass(diets.includes(id))}
            >
              {label}
            </button>
          ))}
        </div>
        {diets.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Рецепты придумывает ИИ и он может ошибаться. Если у вас аллергия,
            обязательно проверяйте состав продуктов.
          </p>
        )}
      </section>

      <button
        type="button"
        onClick={generate}
        disabled={allIngredients.length === 0 || loading}
        className="mt-10 w-full rounded-2xl bg-accent px-8 py-5 text-xl font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? "Повар думает…" : "Придумай рецепты"}
      </button>
      {allIngredients.length === 0 && !loading && (
        <p className="mt-2 text-center text-muted">
          Отметьте хотя бы один продукт.
        </p>
      )}

      <div aria-live="polite" className="mt-10">
        {loading && (
          <div className="flex items-center justify-center gap-4 rounded-3xl bg-cream p-8 text-lg">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-sand border-t-accent" />
            Повар придумывает рецепты… Это займёт несколько секунд.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-3xl border-2 border-red-200 bg-red-50 p-6 text-red-900"
          >
            <p className="font-bold">Не получилось 😕</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={generate}
              className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Попробовать ещё раз
            </button>
          </div>
        )}

        {recipes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Ваши рецепты 🍽️</h2>
            {recipes.map((r, i) => (
              <RecipeCard key={i} recipe={r} servings={recipesServings} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
