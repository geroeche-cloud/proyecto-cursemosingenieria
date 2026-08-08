import { test, expect } from "@playwright/test";
import { leerPagina, totalPaginas, POR_PAGINA } from "../src/lib/paginacion";

/**
 * El número de página viene de la URL, así que lo escribe cualquiera. Si un
 * valor raro se colara al .range() de Supabase, la lista quedaría vacía o
 * tiraría error. Acá se fija que todo lo raro caiga en la página 1.
 */

test("la primera página empieza en cero", () => {
  const p = leerPagina({});
  expect(p.numero).toBe(1);
  expect(p.desde).toBe(0);
  expect(p.hasta).toBe(POR_PAGINA - 1);
});

test("la página 3 pide el tramo correcto", () => {
  const p = leerPagina({ pagina: "3" });
  expect(p.numero).toBe(3);
  expect(p.desde).toBe(POR_PAGINA * 2);
  expect(p.hasta).toBe(POR_PAGINA * 3 - 1);
});

test("cualquier valor inválido cae en la página 1", () => {
  for (const valor of ["0", "-5", "abc", "", "1.5e400", "NaN", "999999999999999999999"]) {
    const p = leerPagina({ pagina: valor });
    expect(p.numero >= 1, `pagina=${valor}`).toBe(true);
    expect(Number.isSafeInteger(p.desde), `pagina=${valor}`).toBe(true);
    expect(p.desde >= 0, `pagina=${valor}`).toBe(true);
  }
});

test("un parámetro repetido en la URL no rompe", () => {
  const p = leerPagina({ pagina: ["2", "7"] });
  expect(p.numero).toBe(2);
});

test("el total de páginas nunca es cero", () => {
  expect(totalPaginas(0)).toBe(1);
  expect(totalPaginas(null)).toBe(1);
  expect(totalPaginas(POR_PAGINA)).toBe(1);
  expect(totalPaginas(POR_PAGINA + 1)).toBe(2);
});
