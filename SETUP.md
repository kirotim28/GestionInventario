# Guía de Configuración Inicial

Esta guía te ayudará a configurar el sistema de gestión de inventario desde cero.

## Prerrequisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado y en ejecución
- Git instalado

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/kirotim28/GestionInventario.git
cd GestionInventario
```

## Paso 2: Instalar Dependencias

```bash
npm install
```

## Paso 3: Configurar MySQL

### Opción A: Crear base de datos manualmente

1. Accede a MySQL:
```bash
mysql -u root -p
```

2. Crea la base de datos:
```sql
CREATE DATABASE gestion_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'inventario_user'@'localhost' IDENTIFIED BY 'tu_password_segura';
GRANT ALL PRIVILEGES ON gestion_inventario.* TO 'inventario_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Opción B: Usar base de datos existente

Si ya tienes una base de datos MySQL, solo necesitas la cadena de conexión.

## Paso 4: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tus credenciales:
```env
DATABASE_URL="mysql://inventario_user:tu_password_segura@localhost:3306/gestion_inventario"
NEXTAUTH_SECRET="genera-una-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

**Importante**: Genera una clave secreta segura para `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Paso 5: Crear las Tablas en la Base de Datos

Ejecuta el siguiente comando para crear todas las tablas necesarias:

```bash
npm run db:push
```

Este comando creará las siguientes tablas:
- `users` - Usuarios del sistema
- `assets` - Activos/inventario
- `log_movimientos` - Registro histórico de cambios
- `tickets_soporte` - Tickets de soporte y fallas

## Paso 6: Poblar la Base de Datos con Datos Iniciales (Opcional)

Para crear usuarios de prueba y activos de ejemplo:

```bash
npm run db:seed
```

Este comando creará:

**Usuarios de prueba:**
- **Admin**: admin@emi.edu / admin123
- **Encargado**: encargado@emi.edu / encargado123
- **Usuario**: usuario@emi.edu / user123

**Activos de ejemplo:**
- Laptop Dell Latitude 5420
- Proyector Epson EB-X41
- Impresora HP LaserJet
- Router Cisco RV340
- Monitor LG 24"

## Paso 7: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El sistema estará disponible en: http://localhost:3000

## Paso 8: Acceder al Sistema

1. Abre tu navegador en http://localhost:3000
2. Serás redirigido a la página de login
3. Inicia sesión con uno de los usuarios creados

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Base de Datos
npm run db:push          # Sincronizar schema con la base de datos
npm run db:seed          # Poblar con datos iniciales
npm run db:studio        # Abrir Prisma Studio (GUI para la BD)

# Producción
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Calidad de Código
npm run lint             # Ejecutar linter
```

## Verificación de la Instalación

### 1. Verificar conexión a la base de datos

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en http://localhost:5555 donde puedes ver tus tablas y datos.

### 2. Verificar que el servidor funciona

Accede a http://localhost:3000 y deberías ver la página de login.

### 3. Probar el login

Intenta iniciar sesión con:
- Email: admin@emi.edu
- Password: admin123

Si todo funciona correctamente, serás redirigido al dashboard.

## Solución de Problemas Comunes

### Error: "Can't connect to MySQL server"

**Problema**: No se puede conectar a MySQL.

**Solución**:
1. Verifica que MySQL esté en ejecución: `sudo systemctl status mysql`
2. Verifica las credenciales en el archivo `.env`
3. Asegúrate de que el puerto 3306 esté disponible

### Error: "Database does not exist"

**Problema**: La base de datos no existe.

**Solución**:
1. Crea la base de datos manualmente (ver Paso 3)
2. O ejecuta: `mysql -u root -p -e "CREATE DATABASE gestion_inventario;"`

### Error: "NEXTAUTH_SECRET must be provided"

**Problema**: Falta la variable de entorno NEXTAUTH_SECRET.

**Solución**:
1. Genera una clave: `openssl rand -base64 32`
2. Agrégala al archivo `.env`

### Error durante la compilación

**Problema**: Errores de TypeScript o dependencias.

**Solución**:
1. Elimina node_modules: `rm -rf node_modules`
2. Reinstala: `npm install`
3. Limpia caché: `npm cache clean --force`

## Siguientes Pasos

1. **Cambiar contraseñas por defecto** en producción
2. **Crear usuarios adicionales** según sea necesario
3. **Configurar backup** de la base de datos
4. **Personalizar categorías y ubicaciones** según tu institución
5. **Configurar un servidor de producción** (Vercel, DigitalOcean, etc.)

## Configuración para Producción

Para desplegar en producción:

1. **Base de datos**: Usa una base de datos MySQL en la nube (PlanetScale, AWS RDS, etc.)
2. **Variables de entorno**: Configura las variables en tu plataforma de hosting
3. **NEXTAUTH_SECRET**: Usa una clave secreta fuerte y única
4. **NEXTAUTH_URL**: Cambia a tu dominio de producción

## Soporte

Para problemas o preguntas:
1. Revisa la documentación en README.md
2. Verifica los logs del servidor
3. Contacta al equipo de desarrollo

---

¡Listo! Ya tienes el sistema de gestión de inventario funcionando. 🎉
