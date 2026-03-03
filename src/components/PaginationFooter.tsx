import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationFooterProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function PaginationFooter({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
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

  // Insert ellipsis markers as -1
  const displayPages: (number | "ellipsis")[] = [];
  let last = 0;
  for (const p of pages) {
    if (last && p - last > 1) displayPages.push("ellipsis");
    displayPages.push(p);
    last = p;
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border mt-4">
      <span className="text-[13px] text-muted-foreground">
        מציג {start}-{end} מתוך {totalItems} משימות
      </span>

      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="הקודם"
        >
          <ChevronRight size={16} />
        </button>

        {displayPages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="px-1 text-muted-foreground text-xs">
              ...
            </span>
          ) : (
            <button
              key={p}
              className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                p === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="הבא"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
