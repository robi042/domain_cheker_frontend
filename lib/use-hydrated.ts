'use client';

import { useEffect, useState } from 'react';

/**
 * True only after mount. Use before branching render on `localStorage` / `window`
 * so server HTML and the client's first paint match (avoids hydration errors).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
