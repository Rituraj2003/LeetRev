import prisma from "../db.js"

export async function getProblemDetails(problemId:string,userId:string){
    const getProblemDetails= await prisma.problem.findUnique({
        where:{
           id:problemId,
        },
        include:{
            solutions:{
                where:{
                    userId:userId
                },
                include:{
                    review:true,
                },
                orderBy:{
                    solvedAt:"desc"
                },
                take:1
            }
        },
    })
    if(!getProblemDetails){
        throw new Error("Problem details not found")
    }

    const latestSolution=getProblemDetails.solutions[0]?? null;
    return {
        problem:{
            id:getProblemDetails.id,
            difficulty:getProblemDetails.difficulty,
            title:getProblemDetails.title,
            url:getProblemDetails.url,
            topics:getProblemDetails.topics
        },
        solution:latestSolution,
        review:latestSolution?.review
    }
}