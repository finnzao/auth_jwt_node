const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const User= require('../models/User')

class Login{
    
    async register(req,res){

        try {
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

        } catch (error) {
            console.log(error);
            return res.status(404).json({message:"Connection is down,please try again"});
        }

    }


  
    async loginAuth(req,res){

        const {email,password}=req.body

        if(!email || !password){
            return res.status(422).json({msg:'Email and password are required to login'})
        }

         //check if user exists
        const user= await User.findOne({email:email})

        if (!user){
            return res.status(404).json({msg:"This user dont exists"})    
        }
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

    }
}
module.exports= new Login();