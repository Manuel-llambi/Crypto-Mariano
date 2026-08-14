import { AudienceSection } from "@/components/sections/AudienceSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { MethodologySection } from "@/components/sections/MethodologySection";
import { ProgramSection } from "@/components/sections/ProgramSection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { TopNavBar } from "@/components/sections/TopNavBar";
import { UpdatesSection } from "@/components/sections/UpdatesSection";
import {
  audience,
  faq,
  footer,
  methodology,
  nav,
  program,
  site,
  socialProof,
  updates,
} from "@/lib/content";

/**
 * The whole landing, in the order 1.1 prescribes.
 *
 * This is the only module that imports the content, so it is also the point
 * where validation actually runs during `next build`: a malformed content file
 * stops the build here rather than blanking a section in production (2.2, 2.3).
 *
 * Every section takes its data as props and none of them reads `content/`
 * directly, which is what keeps them testable with fixtures. The section
 * identifiers come from `SECTION_IDS` through each component, so a link to a
 * section that does not exist cannot be written (1.5).
 */
export default function HomePage() {
  return (
    <>
      <TopNavBar
        items={nav}
        siteName={site.name}
        enrollLabel={site.enrollLabel}
        loginLabel={site.loginLabel}
      />

      <main>
        <Hero hero={site.hero} />
        <AudienceSection audience={audience} />
        <MethodologySection methodology={methodology} />
        <UpdatesSection updates={updates} />
        <ProgramSection program={program} enrollLabel={site.enrollLabel} />
        <SocialProofSection socialProof={socialProof} />
        <FaqSection faq={faq} />
        <FinalCta finalCta={site.finalCta} />
      </main>

      <SiteFooter footer={footer} siteName={site.name} />
    </>
  );
}
