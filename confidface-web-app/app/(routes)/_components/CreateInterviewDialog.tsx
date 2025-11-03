"use client"

import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'

const CreateInterviewDialog = () => {
  return (
   <Dialog>
  <DialogTrigger>
    <Button>+Create Interview</Button>
  </DialogTrigger>
<DialogContent>
  <DialogHeader>
    <DialogTitle>Create a New Interview</DialogTitle>
    <DialogDescription>
      නව සම්මුඛ පරීක්ෂණයක් සැලසුම් කිරීමට පහත විස්තර පුරවන්න.
    </DialogDescription>
  </DialogHeader>
  {/* ඔබට ඔබේ interview form එක මෙතනට එකතු කළ හැකිය */}
</DialogContent>
</Dialog>  
  )
}

export default CreateInterviewDialog