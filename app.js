require('dotenv').config();
const express=require('express');
const mongoose= require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')


const app= express();
//MODELS
const User =require('./models/User')
//Config JSON responde
app.use(express.json())

//OPEN ROUTE -Public Route
app.get('/',(req,res)=>{
    res.status(200).json({msg:"Server is open..."})
})
//Private Router
function checkToken(req,res,next){

    const autHeader= req.headers['authorization'];
    const token = autHeader && autHeader.split(" ")[1]
    if (!token){
        return res.status(401).json({message:"Access denied"})
    }
    
    try {

        const secret= process.env.SECRET

        jsonwebtoken.verify(token,secret)

        return next()

    } catch (error) {
        res.status(400).json({msg:"Token inválido"})
    }


}

app.get("/user/:id",checkToken,async(req,res)=>{
    const id = req.params.id
    try {
    //check if user exists
    const user =await User.findById(id,'-password')
    if(!user){
        return res.status(404).json({msg:"User not found."})
    }

    res.status(200).json({user})
    } catch (error) {
        console.log(error)

        res.status(500)
        .json({
            msg:'Error in serve system...'
        })
    }



})
//Register User


app.post('/auth/register',async(req,res)=>{

    const {name,email,password,confirmpassowrd}=req.body
    
// validations

if(!name || !email || !password){
    return res.status(422).json({msg:'O nome,email e senha são obrigatórios!'})
}
if (password !== confirmpassowrd){
    return res.status(422).json({msg:"Senhas precisam ser iguais "})
}
//check user
const userExists= await User.findOne({email:email})

if (userExists){
    return res.status(422).json({msg:"This email already taken.Please choose another"})    
}

//create password 

const salt= await bcrypt.genSalt(12)
const passwordHash= await bcrypt.hash(password,salt)

//create User

const user = new User ({
    name,
    email,
    password:passwordHash
 })

 try {
    await user.save()
    res.status(201).json({msg:"Usuario criado com sucesso "})
 } catch (error) {
    console.log(error)

    res.status(500)
    .json({
        msg:'Error in serve system...'
    })
 }

})


//CREDENCIAILS
const dbUser= process.env.DB_USER
const dbPassword= process.env.DB_PASS

//LOGIN  User 

app.post("/auth/login",async (req,res)=>{
    const {email,password}=req.body

    if(!email || !password){
        return res.status(422).json({msg:'Email and password are required for login'})
    }
//check if user exists
const user= await User.findOne({email:email})

if (!user){
    return res.status(404).json({msg:"This user dont exists"})    
}
//check if password is right 

const checkPassword= await bcrypt.compare(password,user.password)

if(!checkPassword){
    return res.status(422).json({msg:"Wrong Password!"})
}
try {
    
    const secret=process.env.SECRET

    const token = jsonwebtoken.sign(
        {
          id:user._id,  
        },
        secret,
    )
    res.status(200).json({msg:"authentication complete",token})
} catch (error) {
    console.log(error)

    res.status(500)
    .json({
        msg:'Error in serve system...'
    })
 
}

})
mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.5wigewj.mongodb.net/test`)
    .then(()=>{
        app.listen(33333)
        console.log('Connect to DB!')
    })
    .catch((err)=> console.log(err) )




app.listen(3333)