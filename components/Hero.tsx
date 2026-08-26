export function Hero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="hero">
      <img src="/assets/planner-visual.png" alt="" />
      <div className="hero-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}
