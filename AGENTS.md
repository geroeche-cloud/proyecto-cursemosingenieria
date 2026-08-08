<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Rendimiento: leer RENDIMIENTO.md antes de tocar el front

Este proyecto está en 100/100 (escritorio) y ~96/100 (móvil) en Lighthouse.
Llegar ahí costó trabajo y volver a caer es facilísimo: basta un `"use client"`
de más, una librería de animación, un `unoptimized` en una imagen o una
consulta sin `limit`.

**`RENDIMIENTO.md` tiene las nueve reglas, cada una con el caso real que la
originó y el número que la justifica.** Leelo antes de agregar componentes,
animaciones, dependencias o consultas. Las tres que más se rompen sin querer:

1. `"use client"` es la excepción. Una animación de entrada NO justifica un
   componente cliente: eso es CSS.
2. Nada de librerías de animación. Solo `opacity` y `transform`, y nunca
   arranques en `opacity: 0` algo que esté arriba de todo.
3. Nunca traigas todas las filas para contar o para mostrar una parte.
