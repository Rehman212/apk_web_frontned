import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeFeed } from "@/components/HomeFeed";
import { allApps } from "@/lib/catalog";
import { loadHomeFeed } from "@/lib/homeFeed";

export default async function Home() {
  const apps = allApps();
  const games = apps.filter((app) => app.kind === "game");
  const heroGames = (games.length ? games : apps).slice(0, 3);
  const heroArt = ["/hero/hero-city.jpg", "/hero/hero-neon.jpg", "/hero/hero-quest.jpg"];
  const heroSlides = heroGames.map((app, i) => ({
    badge: app.kind === "game" ? "Featured Game" : "Featured App",
    title: app.name,
    subtitle: `Latest Version (${app.version})`,
    description: app.short,
    href: `/app/${app.slug}`,
    image: heroArt[i % heroArt.length],
  }));

  const feed = await loadHomeFeed();

  return (
    <div>
      <div className="bg-[#07111f]">
        <HeroCarousel slides={heroSlides} />
      </div>
      <HomeFeed
        latest={feed.latest}
        games={feed.games}
        apps={feed.apps}
        trending={feed.trending}
        tools={feed.tools}
        recommended={feed.recommended}
        newGames={feed.newGames}
        hotGames={feed.hotGames}
      />
    </div>
  );
}
