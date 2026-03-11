import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-header-bg" dir="rtl">
      <div className="text-center px-6">
        <h1 className="mb-2 text-5xl font-extrabold text-primary">404</h1>
        <p className="mb-5 text-[15px] font-semibold text-muted-foreground">
          העמוד לא נמצא
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
        >
          חזרה לדף הבית
        </a>
      </div>
    </div>
  );
};

export default NotFound;
