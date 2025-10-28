/**
 Filters and maps test entries by the selected metric.

 @param {Array<object>} tests - Array of test entry objects.
 @param {string} selectedMetricKey - Key of the metric to filter by.
 @param {Array<object>} metrics - Array of exercise definitions.
 @returns {Array<{date: string, value: number, version: string}>} Filtered and mapped test data.
*/
export function filterTestsByMetric(tests, selectedMetricKey, metrics) {
  const metric = metrics.find((m) => m.key === selectedMetricKey);
  if (!metric) return [];
  return tests
    .slice()
    .filter((t) => t.date && metric.get(t) != null)
    .map((t) => {
      const rawMetric = t[metric.key];
      const version = rawMetric && typeof rawMetric === 'object' ? (rawMetric.version || '') : '';
      return { date: t.date, value: Number(metric.get(t)), version };
    })
    .filter((entry) => entry.value > 0); // Only keep entries with positive value
}

export function calculateStats(data) {
  if (!data || data.length === 0) return null;
  const values = data
    .map(d => d.value)
    .filter(d => d > 0); // Only positive values
  if (values.length === 0) return null;

  const size = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const pct = first === 0 ? null : (delta / first) * 100;
  return { min, max, first, last, delta, pct, size };
}