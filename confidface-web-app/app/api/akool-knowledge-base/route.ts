import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const {questions}=await req.json();
    // const result = await axios.get('https://openapi.akool.com/api/open/v4/knowledge/list',{
    //     headers: {
    //         Authorization: `Bearer ${process.env.AKOOL_API_TOKEN}`
    //     }
    // });

    // const isExist=result.data.data.find((item:any)=>item.name=='Interview Agent Prod')

    // if(!isExist){
        //Create New KB
        const resp=await axios.post('https://openapi.akool.com/api/open/v4/knowledge/create',
            {
            name:'Interview Agent Prod' + Date.now(),
            prologue:'Tell me about Yourself',
            prompt:`You are an interview preparation assistant. 
            Your task is to help users prepare for job interviews by providing relevant questions and answers based on the job description and title provided by the user.
            Use the knowledge base to generate accurate and helpful responses.
            
            questions:
            ${JSON.stringify(questions)}
            `},


           { headers:{
                Authorization: `Bearer ${process.env.AKOOL_API_TOKEN}`
           }},
            
        );

        console.log(resp.data);
        return NextResponse.json(resp.data);
    // }

    // return NextResponse.json(result.data);
}