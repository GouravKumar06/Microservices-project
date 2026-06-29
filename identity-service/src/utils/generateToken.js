
const jwt = require('jsonwebtoken')

exports.generateTokens = (user) => {

    const payload = {
        userId: user._id,
        username: user.username
    };

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "5m" }
    );

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    return {
        accessToken,
        refreshToken
    };
}