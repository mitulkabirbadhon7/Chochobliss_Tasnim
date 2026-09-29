import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, HeartHandshake, ShieldCheck, Flame, ArrowRight, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story & Craft | ChocoBliss by Tasnim",
  description:
    "Discover the artisanal heritage, bean-to-bar craftsmanship, and single-origin dedication of ChocoBliss by Tasnim.",
};

const pillars = [
  {
    icon: Sparkles,
    title: "Heirloom & Single-Origin",
    description:
      "We source exclusively from sustainable, regenerative family estates across Madagascar, Ecuador, and Ghana. Every harvest reflects its native soil, rainfall, and sunshine.",
  },
  {
    icon: Flame,
    title: "72-Hour Granite Conching",
    description:
      "Unlike mass-market confectioneries, our cacao nibs are stone-ground continuously for three full days, unlocking velvety smoothness and delicate aromatic top notes naturally.",
  },
  {
    icon: HeartHandshake,
    title: "Fair Harvest Partnerships",
    description:
      "We pay 45% above Fairtrade minimums directly to indigenous farming cooperatives, ensuring thriving livelihoods and preserving ancient cacao varietals from deforestation.",
  },
  {
    icon: ShieldCheck,
    title: "Pure & Unadulterated",
    description:
      "Never hydrogenated fats, artificial vanillin, or emulsifiers. Only single-origin cacao mass, rich raw cocoa butter, and unrefined organic cane sugar.",
  },
];

const craftSteps = [
  {
    step: "01",
    title: "Direct Sourcing & Selection",
    desc: "Only the ripest, hand-harvested pods from regenerative agroforestry canopy farms pass our master chocolatier's inspection.",
  },
  {
    step: "02",
    title: "Gentle Micro-Roasting",
    desc: "Carefully roasted in small batches to preserve volatile terroir aromas without imparting acrid or burnt notes.",
  },
  {
    step: "03",
    title: "Stone Conching & Refining",
    desc: "Continuous friction between volcanic granite stones smooths particles below 18 microns for an ethereal mouthfeel.",
  },
  {
    step: "04",
    title: "Hand Tempering & Molding",
    desc: "Hand-tempered on polished Italian marble slabs to achieve the signature audible crystalline snap and radiant gloss.",
  },
];

export default function StoryPage() {
  return (
    <div className="bg-espresso-950 text-cream min-h-screen">
      {/* Hero Header */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-gold/15">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/30 via-espresso-900 to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs uppercase tracking-widest mb-6">
            <Award className="w-3.5 h-3.5" />
            <span>The Atelier Heritage</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-cream font-bold leading-tight mb-8">
            Obsession With <span className="text-gold italic font-normal">Pure Terroir</span>.
            <br />
            Handcrafted with Heart.
          </h1>

          <p className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Founded by Tasnim in Dhaka, ChocoBliss began with a single granite melangeur and an unwavering
            refusal to settle for commercial confectionery. Today, it stands as an homage to pure chocolate alchemy.
          </p>
        </div>
      </section>

      {/* Founder Editorial Split */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold/25 shadow-2xl">
            <Image
              src="/images/categories/truffles.jpg"
              alt="Artisanal chocolate craftsmanship in the atelier"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-espresso-900/80 backdrop-blur-md border border-gold/20">
              <p className="text-gold font-serif italic text-sm">
                &ldquo;Chocolate is not merely a sweet indulgence; it is a complex agricultural poem written by rain, sun, and ancient trees.&rdquo;
              </p>
              <p className="text-cream text-xs font-semibold mt-2 tracking-wider uppercase">— Tasnim, Founder & Master Chocolatier</p>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">A Vision Born from Passion</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream font-bold leading-tight">
              Reviving the Lost Art of Bean-to-Bar Chocolate
            </h2>
            <div className="space-y-4 text-cream/75 leading-relaxed text-sm md:text-base">
              <p>
                In a market inundated with industrial candies laden with palm oil, hydrogenated fats, and excessive
                refined sugars, the true soul of cacao had become obscured. Tasnim embarked on a quest to restore
                chocolate to its sacred Mesoamerican reverence.
              </p>
              <p>
                Traveling to single-origin estates across South America and West Africa, Tasnim worked alongside
                cacao growers who have tended ancient heirloom trees for generations. By sourcing small-lot harvests
                and roasting with scientific precision, each creation reveals unmasked notes of wild berries, florals,
                smoked tobacco, and honeyed molasses.
              </p>
              <p>
                Every bar and bonbon leaving our Dhaka atelier is hand-tempered, inspected, and wrapped with
                sustainable luxury packaging—a labor of love that honors the grower, the artisan, and the connoisseur.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-espresso-950 font-semibold hover:bg-gold-light transition shadow-lg shadow-gold/20 text-sm"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Pillars */}
      <section className="py-20 bg-espresso-900/60 border-y border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Uncompromising Standards</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream font-bold mt-2">
              The Four Pillars of Bliss
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-espresso-950/70 border border-gold/15 hover:border-gold/40 transition flex flex-col group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg text-cream font-bold mb-3">{pillar.title}</h3>
                  <p className="text-cream/65 text-sm leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bean to Bar Timeline */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold text-xs font-bold uppercase tracking-widest">The Metamorphosis</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-cream font-bold mt-2">
            The Bean-to-Bar Process
          </h2>
          <p className="text-cream/70 text-sm mt-3">
            Every step is calibrated to honor the delicate nuance of the single-origin harvest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {craftSteps.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-2xl bg-espresso-900/40 border border-gold/10 relative overflow-hidden"
            >
              <span className="font-serif text-5xl font-black text-gold/15 absolute top-3 right-4 select-none">
                {step.step}
              </span>
              <h3 className="font-serif text-lg text-cream font-bold mb-2 relative z-10">{step.title}</h3>
              <p className="text-cream/65 text-sm leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Atelier Experience CTA */}
      <section className="py-20 bg-espresso-900/40 border-t border-gold/15 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream font-bold mb-4">
            Taste the Craftsmanship Today
          </h2>
          <p className="text-cream/70 text-base mb-8">
            Treat yourself or someone special to fresh micro-batch creations delivered directly to your doorstep in temperature-controlled luxury boxes.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-espresso-950 font-bold hover:bg-gold-light transition shadow-xl shadow-gold/25"
          >
            <span>Browse All Creations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
