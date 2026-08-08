# Reglas de rendimiento

Este proyecto está en **100/100 en escritorio y ~96/100 en móvil** (Lighthouse,
sitio en producción). Llegar ahí costó trabajo; volver a caer es facilísimo.
Estas reglas existen para que cada cosa nueva nazca bien y no haya que
re-descubrir lo mismo.

La regla de oro: **medir, no suponer.** Todo lo que sigue salió de una medición,
no de una intuición. Varias veces la intuición estuvo equivocada.

---

## 1. `"use client"` es la excepción, no el punto de partida

Un componente cliente se descarga, se parsea y se hidrata en el dispositivo de
cada visitante. Un componente servidor llega listo y no cuesta nada.

Antes de escribir `"use client"`, preguntate qué necesita del navegador. Si la
respuesta es "una animación de entrada", **no lo necesita**: eso es CSS.

Casos reales de este proyecto:

- `Hero` era cliente solo por dos animaciones de entrada. Era la primera
  pantalla del sitio entero convertida en JavaScript. Hoy es servidor.
- `Reveal` era cliente y arrastraba la librería de animación **por cada
  elemento que aparecía**. Hoy es servidor y no envía nada: un único
  `RevealObserver` de 30 líneas se ocupa de todos los elementos de la página.

Si necesitás interactividad, aislala en el componente más chico posible y
dejá el resto en el servidor.

## 2. Las animaciones son CSS, y solo `opacity` y `transform`

No hay librería de animación en el proyecto, y no debería volver a haberla.
Todo lo que había —apariciones al scrollear, entrada de ruta, intro, menú
móvil, hero, cambio de pestaña— se resolvió con CSS.

Solo se animan `opacity` y `transform`: son las dos que el navegador resuelve
en la GPU sin rehacer el layout ni repintar. Animar `filter: blur()`, `width`,
`height`, `top` o `left` obliga a recalcular en cada cuadro.

**Y una trampa que ya nos costó puntos:** nunca arranques en `opacity: 0` un
elemento que esté arriba de todo. Eso le dice al navegador "no lo pintes
todavía", y Google cronometra justo eso. El hero y la entrada de ruta animan
**solo transform** por esa razón — están comentadas en `globals.css`.

## 2 bis. `animation-fill-mode: backwards`, nunca `both`

Esta se pagó cara: rompió la barra de navegación **en todo el sitio** y nadie
lo notó hasta que apareció en producción.

Con `both`, el transform del último fotograma queda aplicado para siempre. Y un
elemento con transform se convierte en el **marco de referencia** de todo lo
que tenga `position: fixed` adentro: la barra quedaba anclada al alto de la
página en vez de a la ventana y se iba con el scroll.

Usá `backwards`: el estado inicial se aplica antes de arrancar (que es lo que
hace falta para que no haya salto) y al terminar el elemento vuelve a su estado
normal, sin transform.

`both` solo cuando el estado final DEBE persistir y el elemento no contiene
nada fijo — hoy son dos casos: la salida del menú y la salida de la intro.

**Cómo detectarlo:** scrolleá y fijate si la barra se queda arriba. O en
consola: `getComputedStyle(document.querySelector('.entrada-ruta')).transform`
tiene que decir `none` cuando la animación terminó.

## 2 ter. Nada que se toque puede estar animándose para siempre

Las tarjetas de universidad tenían una rotación infinita en celular. Resultado:
el blanco del toque se movía bajo el dedo, cada tarjeta era una capa de GPU
animándose eternamente, y la página nunca terminaba de "asentarse"
visualmente — se leía como que seguía cargando.

Se detecta solo: si Playwright no puede tocar un elemento y dice
`element is not stable`, un dedo tampoco va a poder cómodamente.

Regla: la vida visual va en elementos **decorativos** (una luz que deriva
dentro de la tarjeta), nunca en el contenedor que hay que tocar. Para el
elemento tocable, respuesta al toque: `:active` con una escala breve.

Lo mismo vale para animar propiedades que no son de compositor:
`background-position` en un texto con degradado recortado re-rasteriza el texto
en cada cuadro. Si el efecto vale la pena, hacelo **finito** (dos pasadas y
para), no infinito.

## 3. El trabajo que no urge se hace cuando la persona ya está usando el sitio

Que algo sea diferido no alcanza: importa **cuánto**. "Al primer momento libre"
resultó ser demasiado pronto — en un celular ese momento llega mientras el
visitante todavía está esperando ver la página.

Escala, de mejor a peor:

1. **Al primer gesto real** (`pointerdown`, `keydown`, `scroll`). Lo mejor.
   Así cargan Sentry y el sintetizador de audio.
2. **Con un plazo largo de respaldo** (8 s), por si nunca hay gesto.
3. `requestIdleCallback` — sirve para cosas visibles que no pueden esperar un
   gesto, como la red de nodos del hero.
4. En el arranque — solo si de verdad hace falta para ver la página.

Medido acá: Sentry en el momento libre costaba **3.379 ms** de ejecución en
celular. Al primer gesto, cero.

## 4. Nunca traigas el SDK entero para hacer una llamada

Las páginas públicas usaban el SDK de Supabase (**275 KB**: autenticación,
realtime, storage) para avisar "alguien hizo clic". Hoy eso es `src/lib/rpc.ts`,
un `fetch` de 40 líneas que hace el mismo pedido HTTP.

El SDK completo sigue donde hace falta de verdad: login, recuperar contraseña y
todo el servidor.

## 5. Imágenes: nunca `unoptimized`, siempre `sizes`

`unoptimized` desactiva toda la optimización de Next. La imagen que el sitio
pintaba primero pesaba **342 KB de PNG crudo** por tener esa palabra.

- Sin `unoptimized`, salvo que puedas explicar por qué.
- `sizes` según el **ancho real en pantalla**, no el que parece. Poner `42vw`
  cuando un `max-w-[11rem]` lo topea a 176 px hace que el navegador pida una
  versión de 1080 px.
- `priority` solo en el contenido principal. Una imagen decorativa con
  `priority` le compite el ancho de banda al elemento que se cronometra: para
  eso está `loading="eager"` + `fetchPriority="low"`.

## 6. Fuentes: variables, sin listar grosores

Sin la lista de `weight`, `next/font` usa la versión variable: todos los
grosores en un solo archivo. Acá fueron **seis archivos a dos**. Mismo diseño.

## 7. Nunca traigas todas las filas para contar o mostrar una parte

Contar y ordenar es lo que la base hace bien. Traer 10.000 filas para mostrar
cuatro números anda perfecto con poco contenido y se degrada de a poco, sin
fallar nunca, hasta que un día el panel tarda ocho segundos.

- Conteos y rankings → una función en la base (ver migración `0013`).
- Listas → paginadas con `.range()` (ver `src/lib/paginacion.ts`).
- Nunca una consulta sin `limit` sobre algo que crece.

## 8. Los canvas se pausan y se moderan

`HeroField` calcula enlaces entre todos los pares de nodos: el costo crece al
cuadrado. Las reglas que quedaron:

- Menos elementos en pantallas chicas, donde el efecto casi no se aprecia y el
  costo se siente.
- 30 cuadros por segundo alcanzan para una deriva lenta: la mitad de trabajo,
  diferencia imperceptible.
- Pausar con `visibilitychange`: animar algo que nadie mira gasta batería.
- No arrancar durante la carga.

## 9. El panel no es el sitio de marketing

`/panel`, `/admin` y `/preview` son herramientas de trabajo. La intro, el fondo
con luces y la transición de entrada **no corren ahí** (ver `src/lib/rutas.ts`).
Un embajador que entra a publicar diez veces por día no quiere esperar
animaciones. Si agregás un efecto global, fijate que respete esa frontera.

---

## Cómo verificar antes de subir

```bash
npm run build && npx playwright test
```

Y para medir de verdad, contra el sitio publicado:

```bash
npx lighthouse@12 https://proyecto-cursemosingenieria.vercel.app/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile --view
```

Si el puntaje móvil bajó de 90, algo se rompió. Mirá primero **Total Blocking
Time** (JavaScript de más en el arranque) y **LCP** (algo tapando o retrasando
el contenido principal).

## Chequeo de estabilidad antes de publicar

El rendimiento no alcanza: dos de los peores problemas que tuvo este proyecto
no aparecían en Lighthouse. Estos tres se hacen a mano, en un celular o con el
navegador en modo celular:

1. **Scrolleá.** La barra de navegación tiene que quedarse arriba. Si se va con
   la página, alguna animación dejó un transform colgado (ver 2 bis).
2. **Tocá una tarjeta.** Tiene que responder al primer toque. Si hay que
   apuntar, algo se está moviendo abajo del dedo (ver 2 ter).
3. **Navegá entre secciones y volvé con el botón "atrás".** El contenido tiene
   que aparecer completo y quedarse quieto.

Y siempre con la consola abierta: cero errores. Un error de JavaScript en
producción puede dejar media página sin funcionar sin que se vea nada raro.
