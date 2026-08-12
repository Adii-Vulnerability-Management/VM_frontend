// components/ui/Pagination.js
import React from "react";
import Button from "@/components/ui/Button";

const DOTS = "...";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) {
  if (totalPages < 2) return null;

  const totalPageNumbers = siblingCount * 2 + 5; // first, last, current ± siblings, 2 dots

  let pages = [];

  if (totalPages <= totalPageNumbers) {
    pages = range(1, totalPages);
  } else {
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, 3 + 2 * siblingCount);
      pages = [...leftRange, DOTS, totalPages];
    } else if (showLeftDots && !showRightDots) {
      const rightRange = range(
        totalPages - (3 + 2 * siblingCount) + 1,
        totalPages,
      );
      pages = [1, DOTS, ...rightRange];
    } else {
      pages = [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages];
    }
  }

  return (
    <nav className="flex items-center justify-end space-x-2 mt-5">
      {/* Prev */}

      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
      >
        Prev
      </Button>

      {/* Page Numbers */}
      {pages.map((page, idx) =>
        page === DOTS ? (
          <span key={idx} className="px-3 py-1 text-gray-500 select-none">
            {DOTS}
          </span>
        ) : (
          <Button
            key={idx}
            onClick={() => onPageChange(page)}
            variant={page === currentPage ? "primary" : "outline"}
            className="px-3"
          >
            {page}
          </Button>
        ),
      )}

      {/* Next */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
      >
        Next
      </Button>
    </nav>
  );
}
