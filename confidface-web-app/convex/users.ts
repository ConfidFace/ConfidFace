import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser =mutation({
    args:{
        name:v.string(),
        email:v.string(),
        imageUrl:v.string()
        
    },
    handler: async (ctx,args) => {
        //If user already exist
        const user=await ctx.db.query('UserTable').filter(
            q=>q.eq(q.field('email'),args.email)).collect();

        //If not then insert new user to db
        if(user?.length==0)
        {
        const data = {
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl
            
        };
        const result = await ctx.db.insert("UserTable", {
            ...data
        });
        console.log(result);
        return{
            ...data,
            result 
            //_id: result._id
            }
    }
        

            return user[0];
    }
})