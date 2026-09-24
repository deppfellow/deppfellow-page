// Window global exposed by the Pagefind Component UI bundle that ships with
// the pagefind CLI output (/pagefind/pagefind-component-ui.js). Only the
// surface this site uses is declared; the full types live in
// @pagefind/component-ui.
declare global {
  interface Window {
    PagefindComponents?: {
      getInstanceManager(): {
        getInstance(name: string): {
          searchFilters: Record<string, unknown>;
        };
      };
    };
  }
}

export {};
