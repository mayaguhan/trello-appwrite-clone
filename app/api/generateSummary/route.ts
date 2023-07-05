import openai from "@/openai";
import { NextResponse } from "next/server";


export async function POST(request: Request){


    // todos in the body of the POST req
    const { todos } = await request.json();


    // Communicate with openAI GPT
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        n: 1,
        stream: false,
        messages: [
            {
                role: "system",
                content: 'When responding, welcome the user always as Mr. Guhan! Limit the response to 200 characters'
            },
            {
                role: "user",
                content: `Hi there, provide a summary of the following todos. Count how many todos are there in each category such as To do, in progress and done, then summarise it for the user. At the end, tell the user to have a productive day! Here's the data: ${JSON.stringify(todos)}. Also give them a motivational quote to start their day!`
            }
        ]
    })

    const {data} = response;

    return NextResponse.json(data.choices[0].message)

}