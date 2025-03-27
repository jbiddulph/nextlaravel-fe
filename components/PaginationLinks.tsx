import Link from 'next/link';
import React from 'react';
import { Paginator } from "@/types/Paginator"; // Import the shared Paginator interface

interface PaginationLinksProps {
  section: string;  // Accept section as a prop
  paginator: Paginator;
}

const PaginationLinks = ({ section, paginator }: PaginationLinksProps) => {
  const makeLabel = (label: string | string[]) => {
    if (label.includes('Previous')) {
      return '<<';
    } else if (label.includes('Next')) {
      return '>>';
    } else {
      return label;
    }
  };

  const hasLinks = paginator.links && paginator.links.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center overflow-hidden rounded-md shadow-lg">
        {hasLinks ? (
          paginator.links.map((link, i) => (
            <React.Fragment key={i}>
              {link.url ? (
                <Link
                  href={`/${section}?page=${link.label}`}  // Dynamically add section and page
                  className={`grid h-12 w-12 place-items-center border-x border-slate-50 bg-white ${
                    link.active
                      ? 'font-bold text-indigo-500 dark:text-indigo-400'
                      : 'hover:bg-slate-300 dark:hover:bg-slate-500'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: makeLabel(link.label),
                  }}
                />
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: makeLabel(link.label),
                  }}
                  className="grid h-12 w-12 place-items-center border-x border-slate-50 bg-white text-slate-300"
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="text-slate-500">No pagination links available</span>
        )}
      </div>

      {/* Pagination info */}
      <div>
        {hasLinks ? (
          <p className="text-sm text-slate-600">
            Showing {paginator.from} to {paginator.to} of {paginator.total} results
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            No results to display
          </p>
        )}
      </div>
    </div>
  );
};

export default PaginationLinks;
