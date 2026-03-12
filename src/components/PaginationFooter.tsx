import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationFooterProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFeedbackClick?: () => void;
  onSupportClick?: () => void;
}

export default function PaginationFooter({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onFeedbackClick,
  onSupportClick,
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push(i);
    }
  }

  const displayPages: (number | "ellipsis")[] = [];
  let last = 0;
  for (const p of pages) {
    if (last && p - last > 1) displayPages.push("ellipsis");
    displayPages.push(p);
    last = p;
  }

  return (
    <div className="bg-primary border-t border-primary">
      <div className="flex flex-col items-center gap-2 py-3">
        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md text-primary-foreground/60 hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="הקודם"
          >
            <ChevronRight size={16} />
          </button>

          {displayPages.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} className="px-1 text-primary-foreground/50 text-xs">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                  p === currentPage
                    ? "text-primary-foreground font-bold underline underline-offset-4"
                    : "text-primary-foreground/60 hover:text-primary-foreground"
                }`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="p-1.5 rounded-md text-primary-foreground/60 hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="הבא"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Item count */}
        <span className="text-[12px] text-primary-foreground/70">
          מציג {start}-{end} מתוך {totalItems} משימות
        </span>

        {/* Footer links */}
        <div className="flex items-center gap-3 text-[12px] text-primary-foreground/70">
          <button onClick={onFeedbackClick} className="hover:text-primary-foreground transition-colors">שלח משוב</button>
          <span>|</span>
          <button onClick={onSupportClick} className="hover:text-primary-foreground transition-colors">לתמיכה</button>
        </div>
      </div>
    </div>
  );
}
