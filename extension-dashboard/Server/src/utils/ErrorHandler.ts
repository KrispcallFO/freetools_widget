class ErrorHandler extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        // Maintains proper stack trace (only in V8 environments like Node.js)
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;
  