export function notFound(request, response) {
  response.status(404).json({ error: 'Route not found' });
}

export function errorHandler(error, request, response, next) {
  console.error(error);
  const status = error.status || (error.code === '23505' ? 409 : 500);
  const message = error.code === '23505' ? 'A record with those details already exists' : error.status ? error.message : error.code === 'ECONNREFUSED' ? 'PostgreSQL is unavailable. Start PostgreSQL and try again.' : error.code === '28P01' ? 'PostgreSQL credentials are incorrect. Update server/.env and restart the server.' : 'Internal server error';
  response.status(status).json({ error: message });
}
