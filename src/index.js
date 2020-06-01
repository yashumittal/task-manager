const express = require('express')
require('dotenv').config()
require('./db/mongoose.js')
const userRouter = require('./routers/userRouter.js')
const taskRouter = require('./routers/taskRouter.js')



//Required
const app = express()

// Take port from process var or use default 3000
const port = process.env.PORT

// Below is used to tell express incoming request is JSON object.
app.use(express.json())

// To use Routers
app.use(userRouter)
app.use(taskRouter) 


// Listen to Port - Required
app.listen(port, () => {
    console.log('Server is up at port: ', port)
})