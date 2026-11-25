import { products } from "./menu";
export type Sede = "Fiesta Lima" | "Fiesta Chiclayo";
export type Basket = Record<string, number>;
export type Receipt = {
  id: string;
  name: string;
  place: Sede;
  day: string;
  items: Basket;
};
export type Session = {
  bag: Basket;
  name: string;
  place: Sede;
  day: string;
  hasCard: boolean;
  orders: Receipt[];
};
const key = "fiesta-navidad-demo-v1";
export const fresh: Session = {
  bag: {},
  name: "Ana Torres",
  place: "Fiesta Lima",
  day: "",
  hasCard: false,
  orders: [],
};
export function readSession(): Session {
  try {
    const s = JSON.parse(sessionStorage.getItem(key) || "null");
    if (
      s &&
      typeof s.name === "string" &&
      s.bag &&
      Array.isArray(s.orders) &&
      ["Fiesta Lima", "Fiesta Chiclayo"].includes(s.place)
    )
      return { ...fresh, ...s };
  } catch {
    /* Private browsing may disable storage. */
  }
  return { ...fresh };
}
export function persist(s: Session) {
  try {
    sessionStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* The demo also works in memory. */
  }
}
export const sol = (v: number) => "S/ " + v.toLocaleString("es-PE");
export const lines = (bag: Basket) => products.filter((p) => bag[p.id] > 0);
export const total = (bag: Basket) =>
  lines(bag).reduce((a, p) => a + p.price * bag[p.id], 0);
export const count = (bag: Basket) =>
  lines(bag).reduce((a, p) => a + bag[p.id], 0);
const openDays: Record<Sede, number[]> = {
  "Fiesta Lima": [10, 11, 12, 15, 16, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30],
  "Fiesta Chiclayo": [11, 12, 13, 17, 18, 19, 21, 22, 24, 29, 30, 31],
};
export const available = (place: Sede, day: string) =>
  day.startsWith("2026-12-") && openDays[place].includes(Number(day.slice(-2)));
export function dateLabel(day: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(day + "T12:00:00Z"));
}
export function calendarDays(block: number) {
  return Array.from({ length: 28 }, (_, i) =>
    new Date(Date.UTC(2026, 10, 30 + 28 * block + i))
      .toISOString()
      .slice(0, 10),
  );
}
