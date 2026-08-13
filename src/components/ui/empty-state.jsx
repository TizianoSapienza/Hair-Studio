import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, className, children }) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-card p-12 text-center", className)}>
      {Icon && <Icon className="mx-auto h-10 w-10 text-muted-foreground" />}
      <p className="mt-3 font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
