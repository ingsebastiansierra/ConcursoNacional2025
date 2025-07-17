# Configuración del Sistema de Administrador

## 📋 Resumen

Se ha implementado un sistema de autenticación de administrador que permite:
- Detectar automáticamente si un usuario es administrador
- Redirigir a administradores a una pantalla especial
- Mantener la funcionalidad existente para usuarios normales

## 🔧 Configuración

### 1. Crear Usuario Administrador

Para crear un usuario administrador, puedes usar uno de estos métodos:

#### Opción A: Usar el script (Recomendado)
1. Edita el archivo `src/scripts/createAdminUser.js`
2. Agrega tu configuración de Firebase
3. Ejecuta el script:
```bash
node src/scripts/createAdminUser.js
```

#### Opción B: Crear manualmente en Firebase Console
1. Ve a Firebase Console > Authentication > Users
2. Crea un usuario con email: `admin@tractomulas.com`
3. Ve a Firestore > users collection
4. Crea un documento con el UID del usuario y estos datos:
```json
{
  "name": "Administrador",
  "email": "admin@tractomulas.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Configurar Correos de Administrador

Los correos de administrador están definidos en `src/services/authService.ts`:

```typescript
const ADMIN_EMAILS = [
  'admin@tractomulas.com',
  'administrador@tractomulas.com'
];
```

Puedes agregar más correos según necesites.

## 🚀 Cómo Funciona

### Para Usuarios Normales:
1. Inician sesión normalmente
2. Son redirigidos a las pantallas normales (Vota, Ranking, Perfil)

### Para Administradores:
1. Inician sesión con un correo de administrador
2. Son redirigidos automáticamente al Panel de Administrador
3. Tienen acceso a:
   - Panel de Administrador (pantalla principal)
   - Vota (para probar la funcionalidad)
   - Ranking (para ver resultados)

## 📱 Pantalla de Administrador

La pantalla de administrador (`src/screens/AdminScreen.tsx`) incluye:
- **Estadísticas**: Para ver datos del concurso
- **Usuarios**: Para gestionar participantes
- **Configuración**: Para ajustes del sistema

Por ahora muestra alertas informativas. Puedes expandir estas funcionalidades según necesites.

## 🔐 Credenciales de Prueba

Si usaste el script, las credenciales son:
- **Email**: `admin@tractomulas.com`
- **Contraseña**: `admin123456`

⚠️ **Importante**: Cambia la contraseña en producción.

## 📁 Archivos Modificados/Creados

### Nuevos Archivos:
- `src/screens/AdminScreen.tsx` - Pantalla de administrador
- `src/navigation/AdminTabs.tsx` - Navegación para administradores
- `src/scripts/createAdminUser.js` - Script para crear admin
- `ADMIN_SETUP.md` - Este archivo

### Archivos Modificados:
- `src/services/authService.ts` - Agregadas funciones de admin
- `src/components/LoginForm.tsx` - Detección de admin
- `src/screens/AuthScreen.tsx` - Paso de funciones de admin
- `App.tsx` - Lógica de navegación de admin

## 🛠️ Próximos Pasos

Para expandir la funcionalidad de administrador:

1. **Estadísticas**: Conectar con Firestore para mostrar datos reales
2. **Gestión de Usuarios**: Crear pantallas para ver/editar usuarios
3. **Configuración**: Agregar opciones de configuración del sistema
4. **Seguridad**: Implementar reglas de Firestore para proteger datos de admin

## 🔍 Troubleshooting

### El administrador no puede acceder:
1. Verifica que el email esté en `ADMIN_EMAILS`
2. Verifica que el documento en Firestore tenga `role: "admin"`
3. Revisa la consola para errores

### Usuario normal accede como admin:
1. Verifica que el email NO esté en `ADMIN_EMAILS`
2. Verifica que el documento en Firestore tenga `role: "user"`

## 📞 Soporte

Si tienes problemas, verifica:
1. Configuración de Firebase
2. Reglas de Firestore
3. Logs de la aplicación 