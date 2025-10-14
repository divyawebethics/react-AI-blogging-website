export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('access_token');
  
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getTokenPayload = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};