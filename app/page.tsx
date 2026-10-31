import Link from "next/link";

const BENEFITS = [
  {
    emoji: "🥕",
    title: "Из того, что есть",
    text: "Отметьте продукты из холодильника — не нужно бежать в магазин.",
  },
  {
    emoji: "⏱️",
    title: "Под ваше время",
    text: "Хватает 15 минут или есть целый час — подберём подходящее блюдо.",
  },
  {
    emoji: "📝",
    title: "Понятные шаги",
    text: "Три рецепта с количеством продуктов и простой инструкцией.",
  },
];

export default function Landing() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="mb-6 text-6xl">🍳</p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Не знаете, что приготовить?
        </h1>
        <p className="mt-5 text-lg text-muted sm:text-xl">
          AI-повар придумает три рецепта из ваших продуктов. Выберите кухню и
          время — остальное он возьмёт на себя.
        </p>
        <Link
          href="/app"
          className="mt-10 inline-block rounded-2xl bg-accent px-10 py-5 text-xl font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
        >
          Попробовать
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-20 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-3xl bg-cream p-7 text-center">
            <p className="text-4xl">{b.emoji}</p>
            <h2 className="mt-3 text-xl font-bold">{b.title}</h2>
            <p className="mt-2 text-muted">{b.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
