const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')
const JWT_SECRET ='Dheemantisagoodbhuabutsometimehebhavelikesbhua';


// ROUTE-1: Create a user for auth Post "api/auth/createUser". no login required

router.post('/createUser', [
    body('name', 'Enter a vaild name').isLength({ min: 3 }),
    body('email', 'Enter a valid mail').isEmail(),
    body('password', 'Password length must be 5 and more').isLength({ min: 3 }),
], async (req, res) => {
    //     If therr is bad request with alredy email exist
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {        
        // check user is already exist
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry with this email user ia already exist" })
        }

        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);
        // create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        });

        const data ={
            user:{
            id:user.id
            }
        }
        
         const authToken = jwt.sign(data, JWT_SECRET); 

         // .then(user => res.json(user))
         // .catch(err=>console.log(err))
         // res.json({error:'Please Enter Unique value for email', message:err.message})
         success = true;
         res.json({success, authToken})
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-2: Authenticate a user for auth Post "api/auth/login".  login required

router.post('/login', [
    body('email', 'Enter a valid mail ').isEmail(),
    body('password', 'Password cannot be balnk').exists(),
], async (req, res) => {
let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    // console.log(req.body);
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success, error:"Try to loginin with correct credentials"});
        }
        let comparePassword = await bcrypt.compare(password, user.password);
        if(!comparePassword){
            success = false;
            return res.status(400).json({success,  error:"Try to loginin with correct credentials"});
        }
    const data ={
        user:{
        id : user.id    
        }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authToken})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})
// ROUTE-3: Get logedin user deatils auth Post "api/auth/getuser".  login required

router.post('/getuser', fetchuser, async (req, res) => {

try {
    userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)

} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}
})
module.exports = router