const {Router}=require ('express');
const routes=Router();
const Login = require('./SystemLogin/Login');

routes.get('/',(req,res)=>{
    return res.status(200).json({message:"System on..."});
})
routes.post('/auth/register',Login.register);
routes.post('/auth/login',Login.loginAuth);


module.exports=routes

