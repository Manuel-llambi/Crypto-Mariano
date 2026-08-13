import { SiteFooter } from "@/components/sections/SiteFooter";
import { TopNavBar } from "@/components/sections/TopNavBar";
import { footer, nav, site } from "@/lib/content";

import styles from "./not-found.module.css";

/**
 * The 404 page (10.4).
 *
 * Next returns the 404 status for this file on its own; what is ours to get
 * right is that the visitor does not land somewhere shapeless. Header and
 * footer are the same components the landing uses, so the page still looks
 * like the site.
 *
 * Both of them receive `anchorPrefix="/"`. A bare `#programa` would resolve
 * against the missing route and go nowhere; prefixed, it sends the visitor to
 * the landing and then to the section.
 */
export default function NotFound() {
  return (
    <>
      <TopNavBar
        items={nav}
        siteName={site.name}
        enrollLabel={site.enrollLabel}
        loginLabel={site.loginLabel}
        anchorPrefix="/"
      />

      <main className={styles.main}>
        <p className={styles.code}>Error 404</p>
        <h1 className={styles.title}>Esta página no existe</h1>
        <p className={styles.body}>
          El enlace que seguiste no lleva a ninguna parte de este sitio. Puede que la dirección
          esté mal escrita o que la página haya cambiado de lugar.
        </p>
        <a className={styles.home} href="/">
          Volver al inicio
        </a>
      </main>

      <SiteFooter footer={footer} siteName={site.name} anchorPrefix="/" />
    </>
  );
}
