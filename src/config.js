export const CURRENCY = "Rs.";
export const FLOORS = [
  "Ground Floor",
  "First Floor",
  "Third Floor",
  "Whole House",
];
export const CATEGORIES = [
  "Foundation",
  "Slab",
  "Material",
  "Workers Salary",
  "Electricity Supply",
  "Water Supply",
  "Wiring",
  "Windows & Doors",
  "Kitchen",
  "Tiles & Flooring",
  "Lights",
  "Bathrooms",
  "Paint",
  "Garden",
  "Other",
];
export const TYPES = ["Material", "Daily Wage", "Other"];
export const money = (n) => CURRENCY + " " + Number(n || 0).toLocaleString();
export const sum = (a) => a.reduce((s, c) => s + Number(c.amount || 0), 0);
export const PERIODS = [
  ["1/4 day", 0.25],
  ["1/2 day", 0.5],
  ["1 day", 1],
];
export const days = (w) =>
  w.reduce((s, x) => s + (PERIODS.find((p) => p[0] === x.period)?.[1] || 0), 0);
