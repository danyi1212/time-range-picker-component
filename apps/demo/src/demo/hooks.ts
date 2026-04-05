import * as React from "react";
import type { ThemePreference } from "@/demo/types";

export function useThemePreference(themePreference: ThemePreference) {
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (preference: ThemePreference) => {
      const darkModeEnabled = preference === "system" ? mediaQuery.matches : preference === "dark";
      document.documentElement.classList.toggle("dark", darkModeEnabled);
    };

    applyTheme(themePreference);

    const handleChange = () => {
      if (themePreference === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themePreference]);
}

export function useGithubStars() {
  const [githubStars, setGithubStars] = React.useState<string | null>(null);
  const [githubUnavailable, setGithubUnavailable] = React.useState(false);

  React.useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      setGithubUnavailable(true);
      return;
    }

    const controller = new AbortController();

    async function loadGithubStars() {
      try {
        const response = await fetch("https://api.github.com/repos/danyi1212/time-range-picker", {
          signal: controller.signal,
        });

        if (!response.ok) {
          setGithubUnavailable(true);
          return;
        }

        const data = (await response.json()) as { stargazers_count?: number };
        setGithubStars(
          typeof data.stargazers_count === "number" ? data.stargazers_count.toLocaleString() : null,
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setGithubUnavailable(true);
        }
      }
    }

    void loadGithubStars();

    return () => {
      controller.abort();
    };
  }, []);

  return { githubStars, githubUnavailable };
}

export function useLiveReferenceTime(isLive: boolean) {
  const [liveReferenceTime, setLiveReferenceTime] = React.useState(() => new Date());

  React.useEffect(() => {
    if (!isLive) {
      return;
    }

    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setLiveReferenceTime(now);

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setLiveReferenceTime(new Date());
      intervalId = window.setInterval(() => {
        setLiveReferenceTime(new Date());
      }, 60_000);
    }, msUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isLive]);

  return liveReferenceTime;
}
