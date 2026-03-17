interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: PageHeaderProps) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h2 className="page-heading">{title}</h2>
        <p className="page-subheading">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
