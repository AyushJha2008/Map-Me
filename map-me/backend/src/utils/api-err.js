class Apierr extends Error {
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
    }
}

export {Apierr}