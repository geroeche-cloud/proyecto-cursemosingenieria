import { test, expect } from "@playwright/test";
import { normalizarRed, normalizarMail } from "../src/lib/redes";

/**
 * Lo que realmente te pasa un embajador cuando le pedís sus redes.
 *
 * Nadie escribe "https://instagram.com/juanperez". Te manda "@juanperez", o
 * copia la barra de direcciones con veinte parámetros de seguimiento pegados.
 * Antes había que armar las cuatro URLs a mano, por cada embajador.
 */

test("un @usuario suelto se convierte en el enlace correcto", () => {
  expect(normalizarRed("@juanperez", "instagram")).toBe("https://instagram.com/juanperez");
  expect(normalizarRed("juanperez", "instagram")).toBe("https://instagram.com/juanperez");
  expect(normalizarRed("@juanperez", "tiktok")).toBe("https://tiktok.com/@juanperez");
  expect(normalizarRed("@sucanal", "youtube")).toBe("https://youtube.com/@sucanal");
  expect(normalizarRed("juan-perez", "linkedin")).toBe("https://linkedin.com/in/juan-perez");
});

test("un enlace completo se respeta", () => {
  expect(normalizarRed("https://instagram.com/juanperez", "instagram")).toBe(
    "https://instagram.com/juanperez",
  );
  expect(normalizarRed("instagram.com/juanperez", "instagram")).toBe(
    "https://instagram.com/juanperez",
  );
});

test("los parámetros de seguimiento se descartan", () => {
  // Esto es literalmente lo que sale al tocar "compartir" en Instagram.
  expect(normalizarRed("https://www.instagram.com/juanperez?igsh=MXY5a2s0", "instagram")).toBe(
    "https://www.instagram.com/juanperez",
  );
  expect(
    normalizarRed("https://vm.tiktok.com/perfil/?_t=8abc&_r=1&utm_source=x", "tiktok"),
  ).toBe("https://vm.tiktok.com/perfil");
});

test("un enlace de otro dominio se respeta: puede ser su portfolio", () => {
  expect(normalizarRed("https://juanperez.dev", "linkedin")).toBe("https://juanperez.dev");
});

test("vacío queda en null, no rompe", () => {
  for (const v of ["", "   ", null, undefined]) {
    expect(normalizarRed(v, "instagram")).toBeNull();
  }
});

test("un enlace que ejecuta código se rechaza también acá", () => {
  expect(normalizarRed("javascript:alert(1)", "instagram")).toBeNull();
});

test("un usuario con caracteres raros avisa en vez de guardar basura", () => {
  expect(() => normalizarRed("juan perez / hola?", "instagram")).toThrow(/caracteres raros/);
});

test("el correo se guarda pelado y en minúsculas", () => {
  expect(normalizarMail("  Juan.Perez@Gmail.COM ")).toBe("juan.perez@gmail.com");
  // Si pegan "mailto:", se saca: el sitio lo agrega al mostrar.
  expect(normalizarMail("mailto:juan@ejemplo.com")).toBe("juan@ejemplo.com");
  expect(normalizarMail("")).toBeNull();
});

test("un correo mal escrito avisa", () => {
  expect(() => normalizarMail("juan@")).toThrow(/formato válido/);
  expect(() => normalizarMail("no-es-un-mail")).toThrow();
});
