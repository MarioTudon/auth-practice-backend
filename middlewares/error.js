export const errorHandler = (err, req, res, next) => {
    console.log(err)
    const status = err.status || 500
    const error = err.error|| 'internal_error'
    const details = err.details || 'Internal error, please try again later'
    res.status(status).json({ error: error, details: details })
}
