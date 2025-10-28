class AppError extends Error {
  constructor(message, error, status, details) {
    super(message)
    this.status = status
    this.error = error
    this.details = details
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export default { AppError }