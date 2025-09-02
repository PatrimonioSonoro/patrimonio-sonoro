// Script para limpiar tokens corruptos de Supabase
// Ejecuta esto en la consola del navegador si tienes problemas de autenticación

console.log('🧹 Limpiando datos de autenticación...');

// Limpiar localStorage
const localKeys = Object.keys(localStorage);
localKeys.forEach(key => {
  if (key.includes('supabase') || 
      key.includes('sb-') || 
      key.includes('ps_welcome_shown')) {
    localStorage.removeItem(key);
    console.log(`❌ Eliminado localStorage: ${key}`);
  }
});

// Limpiar sessionStorage
const sessionKeys = Object.keys(sessionStorage);
sessionKeys.forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    sessionStorage.removeItem(key);
    console.log(`❌ Eliminado sessionStorage: ${key}`);
  }
});

console.log('✅ Limpieza completada. Recarga la página para aplicar los cambios.');
console.log('🔄 Ejecuta: window.location.reload()');
