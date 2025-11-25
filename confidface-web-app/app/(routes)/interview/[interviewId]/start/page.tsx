"use client"
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import React,  { useEffect, useState } from 'react';
 
type interviewData={
  jobTitle:string | null,
  jobDescription:string | null,
  interviewQuestions:interviewQuestions[],
  userId: string | null,
  _id:string
  
}

type interviewQuestions={
  question:string,
  answer:string
}

function startInterview() {
    const {interviewId} = useParams();
    const convex = useConvex();
    const [interviewData, setInterviewData] = useState<interviewData>();
    useEffect(() => {
        GetInterviewQuestions();
    }, [interviewId]);
        



    const GetInterviewQuestions =async() =>{
        const result = await convex.query(api.Interview.GetInterviewQuestions,{
        //@ts-ignore
            interviewRecordId:interviewId
        })
        console.log(result);
        setInterviewData(result);
    }
  return (
    <div>
      
    </div>
  )
}

export default startInterview
