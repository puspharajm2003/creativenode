import { ReactNode } from "react";

interface SlideLayoutProps {
  children: ReactNode;
  className?: string;
  pageNumber?: number;
  totalPages?: number;
  showFooter?: boolean;
}

export const SlideLayout = ({ children, className = "", pageNumber, totalPages, showFooter = true }: SlideLayoutProps) => {
  return (
    <div className={`slide-content ${className}`}>
      {children}
      {showFooter && (
        <div className="absolute bottom-12 left-24 right-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="CreativeNode Logo" className="w-5 h-5 rounded-full object-cover" />
            <span className="font-display tracking-[0.4em] text-gold text-[18px]">CREATIVENODE</span>
          </div>
          {pageNumber && (
            <div className="flex items-center gap-3 font-serif-elegant text-cream/50 text-[20px]">
              <span className="text-gold">{String(pageNumber).padStart(2, "0")}</span>
              <span>/</span>
              <span>{String(totalPages ?? 10).padStart(2, "0")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
