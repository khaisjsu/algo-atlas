/** 1-D loss functions used by the gradient-descent module and its renderer. */
export const lossFunctions: Record<string, { f: (x: number) => number; df: (x: number) => number; domain: [number, number]; label: string }> = {
  bowl: { f: (x) => 0.5 * x * x, df: (x) => x, domain: [-10, 10], label: "f(x) = ½x²" },
  wavy: { f: (x) => 0.12 * x * x + 2 * Math.sin(x), df: (x) => 0.24 * x + 2 * Math.cos(x), domain: [-10, 10], label: "f(x) = 0.12x² + 2·sin x" },
  ravine: { f: (x) => Math.log(1 + x * x) + 0.02 * x * x, df: (x) => (2 * x) / (1 + x * x) + 0.04 * x, domain: [-10, 10], label: "f(x) = ln(1 + x²) + 0.02x²" },
};
