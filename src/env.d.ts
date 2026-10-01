/// <reference types="astro/client" />

/**
 * De YAML-bestanden uit /content halen we binnen als platte tekst en parsen we
 * zelf in src/lib/content.ts. TypeScript moet weten dat dat een string oplevert.
 */
declare module '*.yaml?raw' {
  const content: string;
  export default content;
}

declare module '*.yml?raw' {
  const content: string;
  export default content;
}
