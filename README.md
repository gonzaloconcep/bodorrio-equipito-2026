# Bodorrio 2026 - Prueba de Menu

App web para que los invitados de la boda puntuen los platos de la prueba de menu y elijan cuales van a la boda.

## Stack

- **React 19** + TypeScript
- **Tailwind CSS 4** (via Vite plugin)
- **Supabase** (PostgreSQL + Storage para fotos)
- **Vite 8** (dev server + build)
- **Vitest** (unit tests) + **Playwright** (e2e, WebKit/iOS)

## Funcionalidades

### Invitados
- Seleccion de usuario (6 invitados)
- Listado de platos agrupados por categoria (entrante, primero, segundo, postre, vino)
- Filtros combinables por categoria y estado de review (pendiente/hecha)
- Review de cada plato: puntuacion con estrellas (1-5), si/no boda, comentarios
- "Guardar y siguiente review" para encadenar reviews sin salir del modal
- Filtro de pendientes activado por defecto para facilitar el flujo

### Admin (Gonzalo)
- Subir platos con foto desde el movil
- Ver todas las reviews de todos los invitados
- Badge de reviewers que faltan por plato
- Ranking de platos por puntuacion media y votos "si boda"

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de produccion
npm run build

# Tests unitarios
npm run test

# Tests unitarios con cobertura
npm run test:coverage

# Tests e2e (requiere npx playwright install webkit)
npm run test:e2e
```

## Variables de entorno

Crea un fichero `.env` en la raiz:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Estructura del proyecto

```
src/
  App.tsx              # Router principal (welcome, guest-select, guest, admin)
  components/
    WelcomeScreen.tsx  # Pantalla inicial con acceso invitado/admin
    GuestSelect.tsx    # Seleccion de invitado
    GuestDashboard.tsx # Dashboard del invitado con filtros y cards
    ReviewModal.tsx    # Modal de review con "guardar y siguiente"
    AdminDashboard.tsx # Dashboard admin con vista platos y ranking
    AddDishModal.tsx   # Modal para subir platos con foto
    DishDetail.tsx     # Detalle de plato con todas las reviews
    StarRating.tsx     # Componente reutilizable de estrellas
    RankingView.tsx    # Vista ranking por categoria
    MissingReviewersBadge.tsx  # Badge de reviewers pendientes
  hooks/
    useBodyScrollLock.ts    # Bloqueo de scroll al abrir modales
    useRanking.ts           # Logica de ranking
    useMissingReviewers.ts  # Logica de reviewers pendientes
  types/
    index.ts           # Tipos, constantes y mapas
e2e/
  modal-visibility.spec.ts  # Test e2e de visibilidad de modales en iOS
```

## Base de datos (Supabase)

### Tabla `dishes`
| Campo | Tipo |
|-------|------|
| id | uuid (PK) |
| title | text |
| category | text (entrante, primero, segundo, postre, vino) |
| image_url | text (nullable) |
| active | boolean |
| created_at | timestamptz |

### Tabla `reviews`
| Campo | Tipo |
|-------|------|
| id | uuid (PK) |
| dish_id | uuid (FK dishes) |
| reviewer | text |
| stars | integer (1-5) |
| wedding_worthy | boolean |
| comments | text (nullable) |
| created_at | timestamptz |

Unique constraint en `(dish_id, reviewer)` para upsert.

## Licencia

Proyecto privado para uso personal.
