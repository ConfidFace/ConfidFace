"use client"
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import React,  { use, useEffect, useRef, useState } from 'react';
import { GenericAgoraSDK } from 'akool-streaming-avatar-sdk';
import { video } from 'motion/react-client';
import { Button } from '@/components/ui/button';

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

const CONTAINER_ID='akool-avatar-container';
const AVATAR_ID='dvp_Tristen_cloth2_1080p';
function startInterview() {
    const {interviewId} = useParams();
    const convex = useConvex();
    const [interviewData, setInterviewData] = useState<interviewData>();
    const videoContainerRef = useRef<any>(null);
    const [micOn, setMicOn] = useState(false);
    const [kbId,setKbId]=useState<string|null>();
    const [agoraSdk,setAgoraSdk]=useState<GenericAgoraSDK|null>(null)
    const [joined,setJoined]=useState(false);
    
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




    useEffect(() => {
      interviewData && GetKnowledgebase();
    }, [interviewData]);



    const GetKnowledgebase=async()=>{
        const result=await axios.post('/api/akool-knowledge-base', {
          questions: interviewData?.interviewQuestions
        });
        console.log(result);
        setKbId(result?.data?.data?._id);
    }

    useEffect(() => {
      const sdk = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });
    
    // Register event handlers
sdk.on({
  onStreamMessage: (uid, message) => {
    console.log("Received message from", uid, ":", message);
  },
  onException: (error) => {
    console.error("An exception occurred:", error);
  },
  onMessageReceived: (message) => {
    console.log("New message:", message);
  },
  onMessageUpdated: (message) => {
    console.log("Message updated:", message);
  },
  onNetworkStatsUpdated: (stats) => {
    console.log("Network stats:", stats);
  },
  onTokenWillExpire: () => {
    console.log("Token will expire in 30s");
  },
  onTokenDidExpire: () => {
    console.log("Token expired");
  },
  onUserPublished: async (user, mediaType) => {
    if (mediaType === 'video') {
      await sdk.getClient().subscribe(user, mediaType);
      user?.videoTrack?.play(videoContainerRef.current);
    } else if (mediaType === 'audio') {
      await sdk.getClient().subscribe(user, mediaType);
      user?.audioTrack?.play();
    }
  }
});

      setAgoraSdk(sdk);

      return () => {
        sdk.leaveChat();
        sdk.leaveChannel();
        sdk.closeStreaming();
      }

    }, [])

    const StartConversation=async()=>{


      if(!agoraSdk) return;
      //Create Akool Session
      const result=await axios.post('/api/akool-session',{
        avatar_id:AVATAR_ID,
        knowledge_id:kbId
      });

      console.log(result.data);
      const credentials=result?.data?.data?.credentials
      //Connect to Agora Channel and  Start Chat
      if(!credentials) throw new Error("Missing Credentials");
   
      await agoraSdk?.joinChannel({
          agora_app_id: credentials.agora_app_id,
          agora_channel: credentials.agora_channel,
          agora_token: credentials.agora_token,
          agora_uid: credentials.agora_uid
        });

        await agoraSdk.joinChat({
        vid: "en-US-Wavenet-A",
        lang: "en",
        mode: 2  // 1 for repeat mode, 2 for dialog mode
});
   
        await agoraSdk.toggleMic();
        setMicOn(true);
        setJoined(true);

      try {
        const Prompt =`You are an interview preparation assistant. 
Your task is to help users prepare for job interviews by providing relevant questions and answers based on the job description and title provided by the user.
Use the knowledge base to generate accurate and helpful responses.

questions:
${JSON.stringify(interviewData?.interviewQuestions?.map)}
`;

        await agoraSdk.sendMessage(Prompt);
        await agoraSdk.toggleMic();
        setMicOn(true);
        setJoined(true);
      } catch (error) {
        console.error("Failed to start conversation:", error);
      } finally {
        setLoading(false);
      }
    }

    const leaveConversation=async()=>{
      if(!agoraSdk) return;
      await agoraSdk.leaveChat();
      await agoraSdk.leaveChannel();
      await agoraSdk.closeStreaming();
      setJoined(false);
      setMicOn(false);
    }

    const toggleMic=async()=>{
      if(!agoraSdk) return;
      await agoraSdk.toggleMic();
      setMicOn(agoraSdk?.isMicEnabled());
    }

  return (
    <div>
      <div ref={videoContainerRef}
      id={CONTAINER_ID}
      style={{
        width:640, 
        height:480, 
        backgroundColor:'#000000',
        marginTop:20
      }}  
      >


      </div>

      <div>
          <Button onClick={toggleMic}>{micOn?"Mute Mic":"Unmute Mic"}</Button>
          
          {!joined? <Button onClick={StartConversation}>Start Conversation</Button>
          :<Button onClick={leaveConversation}>Leave Conversation</Button>}

      </div>
    </div>
  )
}

export default startInterview
