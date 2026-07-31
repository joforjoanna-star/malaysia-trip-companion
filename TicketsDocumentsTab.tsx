interface EmptyStateProps {
  text: string;
}

export function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="text-center py-10 text-bark-muted text-sm border border-dashed border-sand-deep rounded-2xl">
      {text}
    </div>
  );
}
