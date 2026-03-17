type TableColumn<Row> = {
  key: string;
  label: string;
  className?: string;
  render: (row: Row) => React.ReactNode;
};

interface DataTableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  empty: React.ReactNode;
}

export function DataTable<Row>({
  columns,
  rows,
  empty,
}: DataTableProps<Row>) {
  const gridTemplateColumns = `repeat(${columns.length}, minmax(0, 1fr))`;

  if (rows.length === 0) {
    return <section className="table-shell">{empty}</section>;
  }

  return (
    <section className="table-shell">
      <div
        className="table-head"
        aria-hidden="true"
        style={{ gridTemplateColumns }}
      >
        {columns.map((column) => (
          <p key={column.key} className={column.className}>
            {column.label}
          </p>
        ))}
      </div>
      <div className="table-body">
        {rows.map((row, index) => (
          <article
            key={index}
            className="table-row"
            style={{ gridTemplateColumns }}
          >
            {columns.map((column) => (
              <div key={column.key} className={column.className}>
                <p className="table-label">{column.label}</p>
                {column.render(row)}
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
