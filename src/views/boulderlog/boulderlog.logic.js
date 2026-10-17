// Reine Boulder-Log-Logik ohne DOM — unit-testbar.

// Formatiert eine Log-Zeile: "- <grade>: <t> try|tries[ (send)][ - <style>]".
export function buildLine(grade, t, send, style) {
  return `- ${grade}: ${t} ${t === 1 ? 'try' : 'tries'}${send ? ' (send)' : ''}${style ? ` - ${style}` : ''}`;
}
