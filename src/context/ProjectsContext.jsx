import { createContext, useContext, useEffect, useState } from "react";
import { projects as fallbackProjects } from "../data/projects.js";

const ProjectsContext = createContext({ projects: fallbackProjects, loading: false });

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(fallbackProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/content/projects")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (active && data.items?.length) setProjects(data.items);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <ProjectsContext.Provider value={{ projects, loading }}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  return useContext(ProjectsContext);
}
