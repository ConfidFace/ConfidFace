"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '../../../components/ui/tabs'
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'

const CreateInterviewDialog = () => {
  const [open, setOpen] = useState(false)
  const[formData,setFormData]= useState<any>();

  const onHoldInputChange = (field: string, value: string) => {
    setFormData((prev:any)=> ({...prev, [field]: value}))

  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Create Interview</Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative bg-background border rounded-md p-4 shadow-md max-w-lg w-full z-10">
            <button
              aria-label="Close dialog"
              className="absolute top-2 right-2 text-sm opacity-70 hover:opacity-100"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <div className="mb-min-w-3xl">
              <h3 className="text-lg font-semibold">Please submit following details.</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Fill in the fields below to create a new interview.
            </p>

            <Tabs defaultValue="resume-upload" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                <TabsTrigger value="job-description">Job Description</TabsTrigger>
              </TabsList>
              <TabsContent value="resume-upload"><ResumeUpload/></TabsContent>
              <TabsContent value="job-description"><JobDescription onHandleInputChange={onHoldInputChange}/></TabsContent>
            </Tabs>
            {/* Dialog footer with actions */}
            <div className="mt-4 flex justify-end gap-6">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CreateInterviewDialog