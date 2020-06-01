const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            res.status(403).send({message: 'Authorization Failed'})
        } else {
            const token = req.header('Authorization').split('Bearer')[1].trim()
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findOne({_id: decoded._id, 'tokens.token' : token })
            if(!user){
                throw new Error()
            }
            req.token=token
            req.user = user
            next()
        }
    } catch (e) {
        console.log('xax')
        res.status(403).send({message: 'Authorization Failed'})
    }
}

module.exports = auth