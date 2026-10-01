export default function SizeChart({ chart }) {
  if (!chart) return null;
  return (
    <div className="size-chart">
      <div className="size-chart-head">
        <h3>{chart.title}</h3>
        <span>{chart.unit}</span>
      </div>
      <table>
        <thead>
          <tr>
            {chart.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
