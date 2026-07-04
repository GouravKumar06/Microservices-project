
const urlVersioning = (version) => (req,res,next) => {

    if( req.path === "/healthcheck" || req.path.startsWith("/graphql")) {
        return next();
    }

    if(req.originalUrl.startsWith(`/${version}`)){
        return next()
    }else{
        return res.status(400).json({
            success:false,
            message:"Url Versioning is not allowed in post service"
        })
    }
}

module.exports = urlVersioning;