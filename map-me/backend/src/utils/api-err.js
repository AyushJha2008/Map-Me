class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ){
        //overide
            super(message);
            this.statusCode = statusCode,
            this.data = null;
            this.success = false;
            this.errors = errors
            this.message = message

             if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    }
}

export {ApiError}