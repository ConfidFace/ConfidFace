import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "./ResumeUpload";
import JobDescription from "./JobDescription";
import axios from "axios";
import { log } from "node:console";
import { Loader2Icon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useUserDetailContext } from "@/app/Provider";
import { UserDetailContext } from "@/context/UserDetailContext";

function CreateInterviewDialog() {
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const saveInterviewQuestion = useMutation(
    api.Interview.SaveInterviewQuestion
  );

  const onHandleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    const formData_ = new FormData();
    // Only append the file if one was selected (job description-only flows
    // should not send an empty string as the file field).
    if (file) {
      formData_.append("file", file);
    }
    if (formData?.jobTitle) {
      formData_.append("jobTitle", formData.jobTitle);
    }
    if (formData?.jobDescription) {
      formData_.append("jobDescription", formData.jobDescription);
    }
    try {
      const res = await axios.post(
        "api/generate-interview-questions",
        formData_
      );
      console.log(res.data);

      // Normalize questions to an array (may be empty). We want to store the
      // session even when no questions were generated.
      let questions: any[] = [];
      const raw = res.data?.questions ?? res.data?.data ?? [];
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) questions = parsed;
        } catch (err) {
          console.warn(
            "Could not parse questions string, storing empty array.",
            err
          );
        }
      } else if (Array.isArray(raw)) {
        questions = raw;
      }

      // Always save the interview session (questions may be empty)
      //@ts-ignore
      const resp = await saveInterviewQuestion({
        questions,
        resumeUrl: res.data?.resumeUrl ?? "",
        uid: userDetail?._id,
        jobTitle: formData?.jobTitle ?? "",
        jobDescription: formData?.jobDescription ?? "",
      });
      console.log(resp);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>+ Create Interview</Button>
      </DialogTrigger>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>Please submit following details.</DialogTitle>
          <DialogDescription>
            <Tabs defaultValue="resume-upload" className="w-full mt-5">
              <TabsList>
                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                <TabsTrigger value="job-description">
                  Job Description
                </TabsTrigger>
              </TabsList>
              <TabsContent value="resume-upload">
                {" "}
                <ResumeUpload setFiles={(file: File) => setFile(file)} />
              </TabsContent>
              <TabsContent value="job-description">
                <JobDescription onHandleInputChange={onHandleInputChange} />
              </TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-6">
          <DialogClose>
            <Button variant={"ghost"}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={onSubmit}
            // Enable submit when loading is false and either a file is present
            // or the user has provided a job title/description.
            disabled={
              loading ||
              (!file && !formData?.jobTitle && !formData?.jobDescription)
            }
          >
            {loading && <Loader2Icon className="animate-spin" />}Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewDialog;
