const { sendError } = require("../helpers/responseHelpers");


const urlVersioning = (version) => (req,res,next) => {

    if( req.path === "/healthcheck" || req.path.startsWith("/graphql")) {
        return next();
    }

    console.log(`Requested API Version: ${version}, Path: ${req.path}`);

    if(req.path.startsWith(`/${version}`)){
        return next()
    }else{
        return sendError(
            res,
            400,
            "Unsupported API Version"
        );
    }
}

module.exports = urlVersioning;