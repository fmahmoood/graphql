export function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload && payload.sub) {
      return parseInt(payload.sub, 10);
    }
    throw new Error('User ID not found in token');
  } catch (error) {
    console.error('Error parsing token:', error);
    throw new Error('Invalid token structure');
  }
}
