import { createContext, useContext, useEffect, useState } from "react";
import { divisions as fallbackDivisions } from "../data/divisions.js";

const DivisionsContext = createContext({ divisions: fallbackDivisions, loading: false });

export function DivisionsProvider({ children }) {
  const [divisions, setDivisions] = useState(fallbackDivisions);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/content/divisions")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (active && data.items?.length) {
          setDivisions(data.items.map((item) => ({ ...item, icon: fallbackDivisions.find((fallback) => fallback.slug === item.slug)?.icon || fallbackDivisions[0].icon })));
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  return <DivisionsContext.Provider value={{ divisions, loading }}>{children}</DivisionsContext.Provider>;
}

export function useDivisions() {
  return useContext(DivisionsContext);
}
