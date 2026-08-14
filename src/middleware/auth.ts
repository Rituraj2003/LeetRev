import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
interface LeetRevJwtPayload {
  userId: string;
}

export function authMiddleware(
    req:Request,
    res:Response,
    next:NextFunction
){  
    const secret=process.env.JWT_SECRET!;
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({
            error:"Auth headers are missing"
        })
    }
    const parts=authHeader.split(" ");
    if(parts[0]!== "Bearer" || !parts[1]){
        return res.status(401).json({
            error:"Bad Header"
        })
    }
    const token=parts[1];

    try{
        const decoded=jwt.verify(token,secret) as LeetRevJwtPayload
        console.log(decoded.userId)
        req.userId=decoded.userId;
        next()
    }catch(error){
        return res.status(401).json({
            error:"Cannot find user."
        })
    }
}