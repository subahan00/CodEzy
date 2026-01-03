import jwt from 'jsonwebtoken'

const authMiddleware =(req , res, next)=>{
   console.log('req.headers-', req.headers)
    const authHeader = req.headers.authorization;
    console.log('authheader-', authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  const token =authHeader.split(' ')[1];
  console.log('token',token )
  try{
    const decode=jwt.verify(token, process.env.JWT_SECRET)
    console.log('decode',decode)
    req.user=decode;  
    console.log('req.user-', req.user)  
    next();
  }
  catch(error){
    res.status(201).json({message:"invalid token"})
  }

}
export default authMiddleware