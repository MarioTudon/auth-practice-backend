export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500
    const error = err.error|| 'internal_error'
    const details = err.details || 'Error interno del servidor'
    res.status(status).json({ error: error, details: details })
}
