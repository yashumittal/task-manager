const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task.js')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	age: {
		type: Number,
		default: 0
	},
	email: {
		type: String,
		unique: true,
		required: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Enter correct email");
			}
		},
		trim: true,
		lowercase: true
	},
	password: {
		type: String, 
		required: true,
		minlength: 7,
		validate(value) {
			if (value.includes('password')) {
				throw new Error("Password should not contain word Password");
			}
		},
		trim: true
	},
	tokens: [{
		token : {
			type: String,
			required: true
		}
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps:true
})

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner',

})
// Below methos will work on the instance of UserModel i.e a user - use of method

userSchema.methods.toJSON = function () {

	const user = this
	const userObject = user.toObject()
	delete userObject.password
	delete userObject.tokens
	delete userObject.avatar

	return userObject

}

userSchema.methods.generateAuthToken = async function() {

	const user = this
	const token = jwt.sign({_id: user._id}, 'Thisismyfirstcourse')
	user.tokens = user.tokens.concat({token})
	await user.save()
	return token

}
// Below method is used for login by creating a method on the UserSchems - use of statics

userSchema.statics.findByCredentials = async (email, password) => {

	const user = await User.findOne ({email})
	if(!user) {
		throw new Error ('Unable to login') 
	}
	const isMatch = await bcryptjs.compare(password, user.password)
	if(!isMatch){
		throw new Error ('Unable to login') 
	}
	return user
}

// Below method is used to hash the password before saving User Model (POST or PATCH) using .pre function on schema.
userSchema.pre('save', async function (next) {

	const user = this

	if(user.isModified('password')){
		user.password = await bcryptjs.hash(user.password, 8)
	}
	next()


})

userSchema.pre('remove', async function (next) {

	const user = this
	console.log(user._id)
	await Task.deleteMany({owner:user._id})
	next()


})

const User = mongoose.model("User", userSchema);

module.exports = User