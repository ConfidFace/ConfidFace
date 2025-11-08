import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'


const JobDescription = ({ onHandleInputChange }:any) => {


    return (
        <div>
            <div className='border rounded-2xl p-10'>
                <label>Job Title</label>
                <Input
                    placeholder="e.g. Software Engineer"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onHandleInputChange('jobTitle', event.currentTarget.value)}
                />
            </div>

            <div className='mt-6'>
                <label>Job Description</label>
                <Textarea
                    placeholder='Enter or paste Job description '
                    className='h-[200px]'
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onHandleInputChange('jobDescription', event.currentTarget.value)}
                />
            </div>

        </div>
    )
}

export default JobDescription