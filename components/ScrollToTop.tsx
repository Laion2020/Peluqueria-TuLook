import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Forzamos el scroll arriba de todo
    window.scrollTo(0, 0);
  }, [pathname, search]); // Se dispara cada vez que cambias de URL o parámetros

  return null;
};

export default ScrollToTop;