# 🚀 Cómo iniciar SimpleTrade (desarrollo local)

## Requisitos
- Node.js 18+
- MySQL corriendo localmente (o XAMPP / MySQL Workbench)

---

## 1. Configurar el backend

```bash
cd api
cp .env.example .env
# Editar .env con tus credenciales MySQL locales
```

Luego instalar dependencias e iniciar:
```bash
cd api
npm install
npm run dev      # Inicia en http://localhost:3001
```

El servidor crea las tablas automáticamente al arrancar.

## 2. Crear tu usuario (primera vez)

```bash
cd api
node scripts/create-user.js tu@email.com tuPassword TuNombre
```

## 3. Iniciar el frontend React

En otra terminal, desde la raíz del proyecto:
```bash
npm start        # Inicia en http://localhost:3000
```

---

## URLs de desarrollo
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health check**: http://localhost:3001/api/health

## Para producción (Hostinger)
Ver `DEPLOY_HOSTINGER.md` (en los artefactos del proyecto).
