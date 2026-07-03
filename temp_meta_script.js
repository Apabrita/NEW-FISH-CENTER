  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      let metaTheme = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = "theme-color";
        document.head.appendChild(metaTheme);
      }
      if (activeTheme === "light") {
        root.classList.add("theme-light", "light");
        root.classList.remove("theme-dark", "dark");
        metaTheme.content = "#f2f2f7";
      } else {
        root.classList.add("theme-dark", "dark");
        root.classList.remove("theme-light", "light");
        metaTheme.content = "#000000";
      }
    }
  }, [activeTheme]);
