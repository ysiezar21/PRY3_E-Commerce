# Estructura de Estilos

Esta carpeta contiene todos los estilos CSS de la aplicación, organizados de forma modular por componentes.

## 📁 Estructura

```
styles/
├── index.js              # Punto de entrada - importa todos los estilos
├── globals.css           # Estilos globales de la app (header, footer, loading, error)
├── catalog.css           # Estilos del layout del catálogo
└── components/           # Estilos específicos de cada componente
    ├── SearchBar.css     # Estilos del buscador
    ├── FiltersSidebar.css # Estilos de la barra de filtros
    ├── PriceSlider.css   # Estilos del deslizador de precio
    ├── ProductGrid.css   # Estilos del grid de productos
    ├── ProductCard.css   # Estilos de las tarjetas de producto
    └── Pagination.css    # Estilos de la paginación
```

## 🎯 Cómo usar

En `App.jsx` se importa el archivo `styles/index.js` que a su vez importa todos los estilos necesarios:

```javascript
import "./styles/index.js";
```

Esto asegura que:
- ✅ Todos los estilos se cargan en el orden correcto
- ✅ Los estilos globales se aplican primero
- ✅ Los estilos de componentes sobrescriben según sea necesario
- ✅ La modularización facilita el mantenimiento

## 🔄 Variables CSS

Todas las variables CSS se definen en `src/index.css` (archivo global root):

```css
:root {
  --accent: #5b2eff;
  --text: #6b6375;
  --bg: #fff;
  --border: #e5e4e7;
  /* ... más variables */
}
```

## ✏️ Agregar nuevos estilos

1. **Para un componente nuevo**, crea un archivo en `components/NombreComponente.css`
2. **Importa el archivo** en `styles/index.js`
3. **Usa las clases** en tu componente JSX

Ejemplo:
```javascript
// styles/components/MyNewComponent.css
.my-new-component { /* estilos */ }

// styles/index.js - agregar:
import './components/MyNewComponent.css';
```

## 🧹 Eliminado

- `src/App.css` - Dividido en múltiples archivos modulares
- `src/features/catalog/ProductDetail.css` - No existía en el proyecto
