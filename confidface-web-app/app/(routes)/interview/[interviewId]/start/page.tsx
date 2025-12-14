"use client";
import { api } from "@/convex/_generated/api";
import axios from "axios";
import { useConvex, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
import { GenericAgoraSDK } from "akool-streaming-avatar-sdk";
import { div, video } from "motion/react-client";
import { Button } from "@/components/ui/button";
import { User, PhoneCall, PhoneOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

type interviewData = {
  jobTitle: string | null;
  jobDescription: string | null;
  interviewQuestions: interviewQuestions[];
  userId: string | null;
  _id: string;
};

type interviewQuestions = {
  question: string;
  answer: string;
};
type Messages = {
  from: "user" | "bot";
  text: String;
};

const CONTAINER_ID = "akool-avatar-container";
const AVATAR_ID = "dvp_Tristen_cloth2_1080p";

const DUMMY_CONVERSATION="[{'from':'bot','text':'Tell me about yourself.'},{'from':'user','text':'I am a React Developer working in IT for the last 7 years.'},{'from':'bot','text':'That\'s great to hear!'},{'from':'bot','text':'Can you explain the role of state in React and how it differs from props?'},{'from':'user','text':'I am working in the IT industry from last seven years.'},{'from':'bot','text':'Thank you for sharing that!'},{'from':'bot','text':'Can you explain the role of state in React and how it differs from props?'},{'from':'user','text':'State is used to manage the state of the React application like setting or getting values.'},{'from':'bot','text':'That\'s a good explanation!'},{'from':'bot','text':'How do you manage form state in a React application?'},{'from':'user','text':'Props are used to send values from one component to another.'},{'from':'bot','text':'Thank you for that clarification!'},{'from':'bot','text':'How do you manage form state in a React application?'},{'from':'user','text':'There are different libraries, but you can manage it using useState.'},{'from':'bot','text':'Great!'},{'from':'bot','text':'Thank you for your insights.'}]"
function startInterview() {
  const { interviewId } = useParams();
  const convex = useConvex();
  const [interviewData, setInterviewData] = useState<interviewData>();
  const videoContainerRef = useRef<any>(null);
  const [micOn, setMicOn] = useState(false);
  const [kbId, setKbId] = useState<string | null>();
  const [agoraSdk, setAgoraSdk] = useState<GenericAgoraSDK | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const updateFeedback = useMutation(api.Interview.UpdateFeedback);
  const router=useRouter();

  useEffect(() => {
    GetInterviewQuestions();
  }, [interviewId]);

  const GetInterviewQuestions = async () => {
    const result = await convex.query(api.Interview.GetInterviewQuestions, {
      //@ts-ignore
      interviewRecordId: interviewId,
    });
    console.log(result);
    setInterviewData(result);
  };

  useEffect(() => {
    interviewData && GetKnowledgebase();
  }, [interviewData]);

  const GetKnowledgebase = async () => {
    const result = await axios.post("/api/akool-knowledge-base", {
      questions: interviewData?.interviewQuestions,
    });
    console.log(result);
    setKbId(result?.data?.data?._id);
  };

  useEffect(() => {
    const sdk = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });

    // Register event handlers
    sdk.on({
      onStreamMessage: (uid, message) => {
        console.log("Received message from", uid, ":", message);
        //@ts-ignore
        message.pld?.text?.length > 0 &&
          setMessages((prev: any) => [...prev, message.pld]);
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
        if (mediaType === "video") {
          await sdk.getClient().subscribe(user, mediaType);
          user?.videoTrack?.play(videoContainerRef.current);
        } else if (mediaType === "audio") {
          await sdk.getClient().subscribe(user, mediaType);
          user?.audioTrack?.play();
        }
      },
    });

    setAgoraSdk(sdk);

    return () => {
      sdk.leaveChat();
      sdk.leaveChannel();
      sdk.closeStreaming();
    };
  }, []);

  const StartConversation = async () => {
    if (!agoraSdk) return;
    setLoading(true);
    try {
      //Create Akool Session
      const result = await axios.post("/api/akool-session", {
        avatar_id: AVATAR_ID,
        knowledge_id: kbId,
      });

      console.log(result.data);
      const credentials = result?.data?.data?.credentials;
      //Connect to Agora Channel and  Start Chat
      if (!credentials) throw new Error("Missing Credentials");

      await agoraSdk?.joinChannel({
        agora_app_id: credentials.agora_app_id,
        agora_channel: credentials.agora_channel,
        agora_token: credentials.agora_token,
        agora_uid: credentials.agora_uid,
      });

      await agoraSdk.joinChat({
        vid: "en-US-Wavenet-A",
        lang: "en",
        mode: 2, // 1 for repeat mode, 2 for dialog mode
      });

      const Prompt = `You are an interview preparation assistant. 
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
  };

  const leaveConversation = async () => {
    if (!agoraSdk) return;
    await agoraSdk.leaveChat();
    await agoraSdk.leaveChannel();
    await agoraSdk.closeStreaming();
    setJoined(false);
    setMicOn(false);

    await GenerateFeedback();
  };

  const toggleMic = async () => {
    if (!agoraSdk) return;
    await agoraSdk.toggleMic();
    setMicOn(agoraSdk?.isMicEnabled());
  };

  useEffect(() => {
    console.log(JSON.stringify(messages));
  }, [messages]);

  const GenerateFeedback=async()=>{
    toast.info("Generating Feedback, Please wait...");

    const result = await axios.post('/api/interview-feedback',{
      messages: DUMMY_CONVERSATION,
    });
    console.log(result.data);
    toast.success("Feedback Generated Successfully!");
    //Save the feedback
    const resp=await updateFeedback({
      feedback:result.data,
      //@ts-ignore
      recordId:interviewId
    });
    console.log("Feedback saved:", resp);
    toast.success("Interview Completed Successfully!");
    //Navigate
    router.replace('/dashboard');
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50">
      
      <div className="flex flex-col items-center py-4 px-6 lg:w-2/3">
        <h2 className="text-2xl font-bold mb-3">Interview Sessions</h2>
        <div
          ref={videoContainerRef}
          id={CONTAINER_ID}
          className="rounded-2xl overflow-hidden border bg-white flex items-center justify-center"
          style={{
            width: 560,
            height: 420,
            marginTop: 10,
          }}
        >
          {!joined && (
            <div>
              <div>
                <User size={40} className="text-gray-500" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-4">
          {!joined ? (
            <button
              onClick={StartConversation}
              disabled={loading}
              className="flex items-center px-5 py-3 bg-green-500 text-white hover:bg-green-400 rounded-full shadow-lg transition disabled:opacity-50"
            >
              <PhoneCall className="mr-2" size={20} />
              {loading ? "Connecting..." : "Connect Call"}
            </button>
          ) : (
            <>
              {/* MIC BUTTON */}
              <button
                onClick={toggleMic}
                className={`flex items-center px-5 py-3 rounded-full shadow-lg transition 
                ${
                  micOn
                    ? "bg-yellow-400 hover:bg-yellow-300 text-white"
                    : "bg-gray-300 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {micOn ? (
                  <>
                    <Mic className="mr-2" size={20} /> Mute
                  </>
                ) : (
                  <>
                    <MicOff className="mr-2" size={20} /> Unmute
                  </>
                )}
              </button>

              {/* LEAVE BUTTON */}
              <button
                onClick={leaveConversation}
                className="flex items-center px-5 py-3 bg-red-500 text-white hover:bg-red-400 rounded-full shadow-lg transition"
              >
                <PhoneOff className="mr-2" size={20} />
                Leave Call
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col p-6 lg:w-1/3 h-screen overflow-auto">
        <h2 className="text-lg font-semibold my-4">Conversations</h2>
        <div className="flex-1 border border-gray-200 rounded-xl p-4 space-y-3">
          {messages?.length == 0 ? (
            <div>
              <p>No Messages yet</p>
            </div>
          ) : (
            <div>
              {messages?.map((msg, index) => (
                <div key={index}>
                  <h2
                    className={`p-3 rounded-lg max-w-[80%] mt-1
                    ${
                      msg.from == "user"
                        ? "bg-blue-100 text-blue-700 self-start"
                        : "bg-green-100 text-green-700 self-end"
                    }
                    `}
                  >
                    {msg.text}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default startInterview;