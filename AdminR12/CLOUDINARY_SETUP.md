# Integración Cloudinary para R12 Sports - INSTRUCCIONES

## ✅ Configuración Local (Tu máquina)

### 1. Crear cuenta en Cloudinary (GRATIS)
- Ir a: https://cloudinary.com/users/register/free
- Registrarse con email
- Verificar cuenta

### 2. Obtener credenciales
- Ir a: https://console.cloudinary.com/console
- En el dashboard encontrarás:
  - **Cloud Name** (arriba a la izquierda)
  - **API Key** (en Settings → API Keys)
  - **API Secret** (en Settings → API Keys)

### 3. Editar archivo `.env` en AdminR12/
Reemplaza los valores:
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### 4. Prueba localmente
```
npm start
```
Las imágenes se guardarán en: `https://res.cloudinary.com/tu_cloud_name/image/upload/R12Sports/productos/...`

---

## 🚀 Configuración en Render

### 1. Variables de entorno en Render Dashboard
- Ir a tu aplicación en https://dashboard.render.com
- Click en "Environment" → "Environment Variables"
- Agregar las 3 variables:
  ```
  CLOUDINARY_CLOUD_NAME = tu_cloud_name
  CLOUDINARY_API_KEY = tu_api_key  
  CLOUDINARY_API_SECRET = tu_api_secret
  ```

### 2. Redeploy
- Click en "Manual Deploy" o haz git push
- Las imágenes nuevas se guardarán en Cloudinary ☁️

### 3. Verificación
- Sube una imagen en la tienda
- Recarga la página después de 1 hora
- La imagen seguirá ahí ✅

---

## 📝 Beneficios

✅ **Imágenes permanentes** - No se pierden al reiniciar Render
✅ **Almacenamiento gratis** - 25GB de espacio gratuito
✅ **CDN global** - Imágenes rápidas en cualquier parte del mundo
✅ **Sin limpieza manual** - Cloudinary maneja todo

---

## 🔗 Links útiles

- Dashboard Cloudinary: https://console.cloudinary.com/console
- API Keys: https://console.cloudinary.com/settings/api-keys
- Documentación: https://cloudinary.com/documentation

---

**¿Necesitas ayuda?** Pregúntame sobre los datos de Cloudinary una vez que los tengas.
