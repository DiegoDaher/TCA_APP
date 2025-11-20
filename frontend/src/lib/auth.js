// Servicio de autenticación para manejar tokens y sesiones de forma segura

/**
 * Guarda el token de autenticación de forma segura
 * @param {string} token - Token JWT
 * @param {object} user - Información del usuario
 */
export const saveAuthToken = (token, user) => {
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
  
  // Usar sessionStorage para mayor seguridad (se limpia al cerrar navegador)
  sessionStorage.setItem('authToken', token);
  sessionStorage.setItem('authUser', JSON.stringify(user));
  sessionStorage.setItem('tokenExpiry', expiresAt.toString());
};

/**
 * Obtiene el token de autenticación
 * @returns {string|null} Token o null si no existe o expiró
 */
export const getAuthToken = () => {
  const token = sessionStorage.getItem('authToken');
  const expiry = sessionStorage.getItem('tokenExpiry');
  
  if (!token || !expiry) {
    return null;
  }
  
  // Verificar si el token expiró
  if (Date.now() > parseInt(expiry)) {
    clearAuth();
    return null;
  }
  
  return token;
};

/**
 * Obtiene la información del usuario autenticado
 * @returns {object|null} Usuario o null si no existe
 */
export const getAuthUser = () => {
  const userStr = sessionStorage.getItem('authUser');
  const expiry = sessionStorage.getItem('tokenExpiry');
  
  if (!userStr || !expiry) {
    return null;
  }
  
  // Verificar si el token expiró
  if (Date.now() > parseInt(expiry)) {
    clearAuth();
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado y el token no expiró
 */
export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

/**
 * Limpia la sesión de autenticación
 */
export const clearAuth = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('tokenExpiry');
};

/**
 * Cierra sesión del usuario
 */
export const logout = () => {
  clearAuth();
  // Redirigir a la página principal
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Obtiene los headers de autenticación para fetch
 * @returns {object} Headers con Authorization si está autenticado
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  
  if (!token) {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Realiza una petición autenticada
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones de fetch
 * @returns {Promise<Response>} Respuesta de la petición
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Si recibimos 401, el token expiró o es inválido
  if (response.status === 401) {
    clearAuth();
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  
  return response;
};

/**
 * Verifica si el token sigue siendo válido en el servidor
 * @returns {Promise<boolean>} True si el token es válido
 */
export const verifyToken = async () => {
  try {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
    const token = getAuthToken();
    
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${apiHost}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      clearAuth();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    clearAuth();
    return false;
  }
};

/**
 * Hook para refrescar el estado de autenticación cada cierto tiempo
 * Se puede usar en el componente principal
 */
export const setupAuthRefresh = () => {
  if (typeof window === 'undefined') return;
  
  // Verificar token cada 5 minutos
  const interval = setInterval(async () => {
    const isValid = await verifyToken();
    if (!isValid && isAuthenticated()) {
      clearAuth();
      window.location.reload();
    }
  }, 5 * 60 * 1000); // 5 minutos
  
  return () => clearInterval(interval);
};
