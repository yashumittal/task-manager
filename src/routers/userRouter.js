const express = require('express')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')
const multer = require('multer')
const sharp = require('sharp')

// Creating a new Router
const router = new express.Router()

router.post('/users', async (req, res) => {

    
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send({Error: e.toString()})
    }

})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch(e){
        res.status(403).send({Error: e.toString()})
    }
   
})

// We can pass whatever number of middleware functions we want. Here only auth is passed.
//Middleware functions are executed in the sequene they are defined

router.post('/users/logout',auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send({Error: e.toString()})
    }
   

})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e){
        console.log(e)
        res.status(500).send({Error: e.toString()})
    }
   

})


router.get('/users/me' , auth , async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me',auth,  async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({Error: 'Invalid Update'})
    }

    try {
        const user = req.user
        updates.forEach( (update) => user[update] = req.body[update])
        await user.save()
        res.send(req.user)
    } catch(e) {
        res.status(400).send({Error: e.toString()})
    }

})

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send({Error: e.toString()})
    }

})

const upload = multer({
    limits: {
        fileSize: 20000000
    },
    fileFilter(req, file, cb) {
       if(!file.originalname.match(/\.(JPG|JPEG|PNG|jpg|jpeg|png)$/)){
           return cb(new Error('Error: Upload image'))
        }
         cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
     const avatar = await sharp(req.file.buffer).png()
     .resize(150,150,150)
     .toBuffer()
     req.user.avatar = avatar
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(400).send()
    }
})


// Export Router
module.exports = router