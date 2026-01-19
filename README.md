# Sistema de Gestión de Inventario - EMI

Sistema Web de Gestión de Activos e Inventario desarrollado con el stack T3 (Next.js, Prisma, Tailwind CSS).

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide-React
- **Backend**: Next.js API Routes
- **Base de Datos**: MySQL con Prisma ORM
- **Autenticación**: NextAuth.js con JWT
- **Roles**: Admin, Encargado, Usuario

## 📋 Características Principales

### Seguridad y Autenticación
- ✅ Sistema de login con bloqueo automático tras 3 intentos fallidos (1 hora)
- ✅ Manejo de roles (Admin, Encargado, Usuario)
- ✅ Protección de rutas según permisos
- ✅ Sesiones seguras con JWT

### Gestión de Activos
- ✅ CRUD completo de activos
- ✅ Estados: Disponible, Reservado, En Reparación, De Baja, En Revisión
- ✅ Asignación de responsables
- ✅ Números de serie únicos
- ✅ Categorización y ubicación

### Búsqueda y Filtros
- ✅ Búsqueda multicriterio (serie, nombre, ubicación)
- ✅ Filtrado por estado
- ✅ Paginación de resultados

### Sistema de Tickets
- ✅ Reporte de fallas
- ✅ Cambio automático de estado a "En Revisión" al reportar falla
- ✅ Registro histórico en Log_Movimiento

### Dashboard
- ✅ 4 widgets de estadísticas con contadores
- ✅ Tabla de activos con acciones rápidas
- ✅ Notificaciones toast para feedback
- ✅ Navegación lateral con sidebar
- ✅ Interfaz responsive

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/kirotim28/GestionInventario.git
cd GestionInventario
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Editar el archivo `.env`:
```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/gestion_inventario"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar la base de datos**

Crear la base de datos en MySQL y ejecutar las migraciones de Prisma:
```bash
npx prisma migrate dev --name init
```

5. **Crear un usuario administrador inicial**

Puedes usar el endpoint de registro o insertar directamente en la base de datos:
```bash
npm run dev
```

Luego hacer una petición POST a `/api/users/register`:
```json
{
  "nombre": "Admin",
  "email": "admin@emi.edu",
  "password": "admin123",
  "rol": "ADMIN"
}
```

6. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

El sistema estará disponible en `http://localhost:3000`

## 🗄️ Modelo de Datos

### User
- `id`: ID único
- `nombre`: Nombre completo
- `email`: Email único
- `password`: Contraseña hasheada
- `rol`: ADMIN | ENCARGADO | USUARIO
- `estado`: ACTIVO | SUSPENDIDO
- `intentos_fallidos`: Contador de intentos fallidos
- `bloqueado_hasta`: Fecha/hora de desbloqueo

### Asset
- `id`: ID único
- `nombre`: Nombre del activo
- `serie`: Número de serie único
- `categoria`: Categoría del activo
- `ubicacion`: Ubicación física
- `estado`: DISPONIBLE | RESERVADO | REPARACION | BAJA | EN_REVISION
- `responsable_id`: Usuario responsable

### Log_Movimiento
- Registro histórico de cambios de estado
- Cambios de responsable
- Usuario que realizó el cambio
- Descripción del cambio

### Ticket_Soporte
- `id`: ID único
- `activo_id`: Activo relacionado
- `usuario_id`: Usuario que reporta
- `descripcion`: Descripción del problema
- `tipo`: FALLA | MANTENIMIENTO | CONSULTA
- `estado`: Estado del ticket

## 🔧 Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

## 📁 Estructura del Proyecto

```
/app
  /api
    /assets       # API de activos
    /auth         # Autenticación NextAuth
    /tickets      # API de tickets
    /users        # API de usuarios
  /auth
    /login        # Página de login
  /dashboard      # Dashboard principal
  globals.css     # Estilos globales
  layout.tsx      # Layout principal
  page.tsx        # Página de inicio

/components
  AssetsTable.tsx      # Tabla de activos
  DashboardLayout.tsx  # Layout del dashboard
  SearchBar.tsx        # Barra de búsqueda
  SessionProvider.tsx  # Proveedor de sesión
  StatCard.tsx         # Tarjeta de estadísticas

/lib
  auth.ts         # Configuración de NextAuth
  prisma.ts       # Cliente de Prisma

/prisma
  schema.prisma   # Esquema de base de datos

prisma.config.ts  # Configuración de Prisma
```

## 🔐 Endpoints de API

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión
- `POST /api/users/register` - Registrar usuario

### Activos
- `GET /api/assets` - Listar activos (con filtros y paginación)
- `POST /api/assets` - Crear activo (Admin/Encargado)
- `PATCH /api/assets/[id]` - Actualizar activo
- `DELETE /api/assets/[id]` - Eliminar activo (Admin)
- `GET /api/assets/stats` - Obtener estadísticas

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket (auto-cambia estado a EN_REVISION si es FALLA)

## 🎨 Características de UI/UX

- **Colores de estado**:
  - Verde: Disponible
  - Azul: Reservado
  - Amarillo: En Reparación / En Revisión
  - Rojo: De Baja

- **Acciones rápidas en tabla**:
  - Solicitar Préstamo (cambia estado a RESERVADO)
  - Reportar Falla (crea ticket y cambia estado a EN_REVISION)

- **Notificaciones**:
  - Toast de éxito en operaciones exitosas
  - Toast de error en caso de fallos
  - Mensajes descriptivos

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Sesiones JWT seguras
- Protección de rutas por rol
- Validación de entrada en API
- Bloqueo automático tras intentos fallidos

## 📝 Notas Importantes

1. **Base de Datos**: Asegúrate de tener MySQL instalado y configurado
2. **Variables de Entorno**: Cambia `NEXTAUTH_SECRET` en producción
3. **Primer Usuario**: Crea un usuario admin primero para gestionar el sistema
4. **Migraciones**: Ejecuta `npx prisma migrate dev` cada vez que cambies el schema

## 🚀 Despliegue en Producción

1. Configurar base de datos MySQL en producción
2. Configurar variables de entorno
3. Ejecutar `npm run build`
4. Ejecutar `npm run start`

## 📄 Licencia

Este proyecto es de código abierto para uso educativo.

## 👥 Autores

Sistema desarrollado para la Escuela Militar de Ingeniería (EMI)
