

const isAuthenticated = (req,res,next) => {
    const userId = req.headers['x-user-id']

    if(!userId){
        return res.status(400).json({
            message:"authentication required! Please login to continue "
        })
    }

    req.user = {userId}

    next()
}

module.exports = isAuthenticated