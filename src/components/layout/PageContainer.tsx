interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className = '' }: PageContainerProps) => {
  return (
    <div
      className={`min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] ${className}`}
    >
      {children}
    </div>
  );
};
