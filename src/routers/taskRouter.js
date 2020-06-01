const express = require('express')
const Task = require('../models/task.js')
const auth = require('../middleware/auth.js')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

   // const task = new Task(req.body)
    const task = new Task ( {
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send({Error: e.toString()})
    }
})

// GET with query parameters completed  /tasks?completed=true
// OR
// Pagination: /tasks/limit=10&skip=0
// Sort: /tasks/sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const options = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] == 'desc' ? -1 : 1
    }
    try {
        const user = req.user
        await user.populate({
            path: 'tasks',
            match,
            options : {
                limit: parseInt(req.query.limit) ,
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        const tasks = user.tasks
        res.status(200).send(tasks)
    } catch (e) {
        res.status(500).send({Error: e.toString()})
    }

})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner:req.user._id})
        if (task != null) {
            res.send(task)
        } else {
            res.status(404).send();
        }
    } catch (e) {
        res.status(500).send({Error: e.toString()})
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every((update) =>allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({Error: 'Invalid Update'})
    }

    try {
        const _id = req.params.id
        const task = await Task.findOne({_id, owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach( (update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch(e) {
        console.log(e)
        res.status(500).send({Error: e.toString()})
    }

})

router.delete('/tasks/:id', auth, async (req, res) => {


    try {
        const _id = req.params.id
        const deletedTask = await Task.findOneAndDelete({_id, owner:req.user._id})
        if(!deletedTask){
            return res.status(404).send({Error:'Task Not found'})
        } else {
            res.send(deletedTask)
        }
    } catch (e) {
        res.status(500).send({Error: e.toString()})
    }

})

module.exports = router