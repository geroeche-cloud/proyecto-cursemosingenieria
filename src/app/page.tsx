import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Vision } from "@/components/sections/Vision";
import { Embajadores } from "@/components/sections/Embajadores";
import { Collaborate } from "@/components/sections/Collaborate";
import { MetalDivider } from "@/components/ui/MetalDivider";
import { ORG } from "@/lib/org";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORG.name,
  description: ORG.statement,
  foundingDate: ORG.established,
  email: ORG.email,
  url: "https://geronimoechevarria.com",
  founder: {
    "@type": "Person",
    name: ORG.founder,
    jobTitle: "Fundador",
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad Nacional del Comahue" },
  },
  address: { "@type": "PostalAddress", addressLocality: "Neuquén", addressCountry: "AR" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <Vision />
        <MetalDivider withMark />
        <Embajadores />
        <MetalDivider />
        <Collaborate />
      </main>
      <Footer />
    </>
  );
}
