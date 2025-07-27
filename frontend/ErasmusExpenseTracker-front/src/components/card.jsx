export const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-zinc-900 shadow rounded-2xl ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
