export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500
    const message = err.message || 'Error interno del servidor'
    const details = err.details || 'Internal error'
    res.status(status).json({ message: message, details: details })
}
