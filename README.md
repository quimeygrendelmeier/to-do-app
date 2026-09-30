# 📝 To-Do App

Una aplicación de lista de tareas hecha con HTML, CSS y JavaScript puro (sin frameworks ni dependencias de build). Pensada con una identidad visual de "cuaderno de notas": tipografía manuscrita, fondo con líneas tipo hoja rayada y una paleta cálida que combina bien en modo claro y oscuro.

🔗 **Demo:** [quimeygrendelmeier.github.io/to-do-app](https://quimeygrendelmeier.github.io/to-do-app/)


## ✨ Funcionalidades

- **Tareas principales**: crear, editar in-place, marcar como completada y borrar (con confirmación no bloqueante vía toast "Deshacer").
- **Subtareas anidadas** (un nivel): cada tarea puede tener su propia lista de subtareas, colapsada por defecto, con:
  - Badge de progreso junto al texto (ej. `Películas (1/3)`)
  - Auto-completado del padre cuando se completan todas sus subtareas (y reversión si se reabre alguna)
  - Edición, borrado con undo y reordenamiento por drag & drop propios, independientes de las tareas principales
- **Filtros**: Todas / Pendientes / Completadas, con contadores en cada pestaña (ej. `Pendientes 2/10`)
- **Drag & drop** para reordenar tareas (y subtareas) con Pointer Events — funciona con mouse y con touch
- **Modo oscuro** con toggle, persistido en `localStorage` y que respeta la preferencia del sistema operativo la primera vez
- **Restricciones en "Completadas"**: en esa vista solo se puede eliminar y agregar; edición y drag & drop quedan deshabilitados para no reordenar ni modificar tareas ya cerradas
- **Persistencia local**: todo se guarda en `localStorage`, no requiere backend
- Diseño **responsive** (mobile y desktop) y accesible (estados de foco visibles, `aria-label`s, soporte de `prefers-reduced-motion`)

## 🛠️ Tecnologías

- HTML5
- CSS3 (variables CSS, Flexbox, sin frameworks)
- JavaScript (vanilla, sin librerías de estado ni build tools)
- [Lucide Icons](https://lucide.dev/) vía CDN, para los íconos
- Fuentes de Google Fonts: [Caveat](https://fonts.google.com/specimen/Caveat) (título) e [Inter](https://fonts.google.com/specimen/Inter) (texto)

## 🚀 Cómo correrlo localmente

No necesita instalación ni dependencias. Alcanza con:

```bash
git clone https://github.com/quimeygrendelmeier/to-do-app.git
cd to-do-app
```

Y después abrir `index.html` en el navegador (doble clic, o con una extensión tipo "Live Server" en VS Code para recargar automático al guardar cambios).

## 📁 Estructura del proyecto

```
to-do-app/
├── index.html      # Estructura de la app
├── style.css        # Estilos (paleta, layout, responsive, modo oscuro)
├── script.js        # Lógica: tareas, subtareas, filtros, drag & drop, tema
└── README.md
```

## 🗺️ Próximas mejoras

- [ ] Fechas de vencimiento por tarea
- [ ] Categorías o etiquetas
- [ ] Búsqueda dentro de la lista
- [ ] PWA (instalable, funcionamiento offline)
- [ ] Sincronización entre dispositivos (requeriría backend)

## ⚠️ Limitaciones conocidas

- Los datos se guardan solo en el `localStorage` del navegador: no hay sincronización entre dispositivos ni respaldo en la nube.
- Pensada para un solo usuario por navegador; no tiene autenticación ni cuentas.

## 📄 Licencia

Este proyecto está bajo la licencia MIT — libre para usar, modificar y compartir.

## 👤 Autor

**Quimey Grendelmeier**
- GitHub: [@quimeygrendelmeier](https://github.com/quimeygrendelmeier)
- LinkedIn: [quimeygrendelmeier](https://www.linkedin.com/in/quimeygrendelmeier/)
