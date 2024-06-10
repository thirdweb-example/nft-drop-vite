import { themeConst } from "../consts/parameters";

type Themes = "light" | "dark" | "system";

export const getTheme = () => {
  const urlParams = new URL(window.location.toString()).searchParams;
  let theme = (urlParams.get("theme") || themeConst || "light") as Themes;
  console.log({ theme });
  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
};
