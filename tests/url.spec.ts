import { test, expect } from "@playwright/test";
import { urlSegura, hrefSeguro } from "../src/lib/url";

/**
 * Los enlaces de drives, oportunidades y redes los escribe una persona con
 * cuenta. Un enlace `javascript:` no navega: ejecuta código en el navegador de
 * quien lo toca. Un embajador podía dejarlo preparado y correría en el
 * navegador de cualquier estudiante que entrara a su universidad.
 */

test("un enlace normal pasa", () => {
  expect(urlSegura("https://drive.google.com/abc")).toBe("https://drive.google.com/abc");
  expect(urlSegura("http://ejemplo.com")).toBe("http://ejemplo.com/");
  expect(urlSegura("mailto:hola@ejemplo.com")).toBe("mailto:hola@ejemplo.com");
});

test("sin esquema se asume https, que es lo que la persona quiso decir", () => {
  expect(urlSegura("drive.google.com/carpeta")).toBe("https://drive.google.com/carpeta");
  expect(urlSegura("  www.unco.edu.ar  ")).toBe("https://www.unco.edu.ar/");
});

test("los enlaces que ejecutan código se rechazan", () => {
  for (const malo of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "  javascript:fetch('/api')  ",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ]) {
    expect(urlSegura(malo), `deberia rechazarse: ${malo}`).toBeNull();
    expect(hrefSeguro(malo), `el href deberia ser inofensivo: ${malo}`).toBe("#");
  }
});

test("vacío o basura no rompe", () => {
  for (const v of ["", "   ", null, undefined, "://", "http://"]) {
    expect(() => urlSegura(v)).not.toThrow();
  }
  expect(urlSegura("")).toBeNull();
  expect(urlSegura(null)).toBeNull();
});
