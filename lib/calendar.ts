export type CalendarDay = {
  gd: string;
  dow: string;
  gy: number;
  gm: string;
  gmn: number;
  hy: number;
  hm: string;
  hmn: number;
  hd: number;
  pc: string;
  cats: string;
  oc: number;
  oi: string;
  os: string;
  vs: string;
};

export const categoryColors: Record<string, string> = {
  "No Fasting": "#b91c1c",
  Ramadan: "#f59e0b",
  Arafah: "#7c3aed",
  "Tasu'a & Ashura": "#ec4899",
  "6 Days of Shawwal": "#22c55e",
  "Ayyam al-Beed": "#facc15",
  "Monday & Thursday": "#38bdf8",
  "Ordinary Day": "#d8ded7",
};

export const categories = [
  "All Categories",
  "Ramadan",
  "Monday & Thursday",
  "Ayyam al-Beed",
  "6 Days of Shawwal",
  "Arafah",
  "Tasu'a & Ashura",
  "No Fasting",
];

export const months = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
