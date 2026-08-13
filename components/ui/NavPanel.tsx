"use client";

import { useEffect, useRef } from "react";

import type { NavItem } from "@/lib/nav/sections";

import styles from "./NavPanel.module.css";

interface NavPanelProps {
  items: NavItem[];
}

/**
 * The narrow-screen navigation panel — the one client component of the site.
 *
 * It opens without any JavaScript of ours, because it is a native `<details>`
 * and `<summary>` is its control (8.4). The effect below exists for one reason:
 * a fragment link does not reload the page, so the panel would stay open on top
 * of the section the visitor just asked for (7.3).
 *
 * That is the whole degradation the project accepts with JavaScript blocked
 * (8.5): the panel still opens, still navigates, and merely stays open. Nothing
 * else here — no scrolling, no history, no preventing the default. The
 * `<details>` owns whether it is open; this keeps no state of its own.
 */
export function NavPanel({ items }: NavPanelProps) {
  const panel = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = panel.current;
    if (details === null) {
      return;
    }

    const closeOnLink = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("a") !== null) {
        details.removeAttribute("open");
      }
    };

    details.addEventListener("click", closeOnLink);
    return () => details.removeEventListener("click", closeOnLink);
  }, []);

  return (
    <details ref={panel} className={styles.panel}>
      <summary className={styles.summary}>Menú</summary>

      <nav className={styles.nav} aria-label="Secciones del sitio, panel">
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <a className={styles.link} href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
