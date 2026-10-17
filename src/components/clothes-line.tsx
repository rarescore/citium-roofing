import { Link } from "@/lib/citium-link";

export type ClothesItem = { href: string; title: string; src?: string; alt?: string };

function thumb(src: string) {
  return src.includes("1600.jpg") ? src.replace("1600.jpg", "800.webp") : src;
}

/** Photos hang from a rope. The whole picture stays visible, and each one is used once. */
export function ClothesLine({ items }: { items: ClothesItem[] }) {
  return (
    <div className="clothesline">
      <ul className="clothesline-track">
        {items.map((item, index) => (
          <li key={item.href} style={{ animationDelay: `${(index % 8) * 0.22}s` }}>
            <Link href={item.href} className={`clothes-card clip-${index % 3}`}>
              <span className="clothes-clip" aria-hidden="true" />
              {item.src ? (
                <img src={thumb(item.src)} alt={item.alt || ""} width="800" height="533" loading="lazy" decoding="async" />
              ) : null}
              <h3>{item.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
