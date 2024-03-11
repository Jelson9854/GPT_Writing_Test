import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
});

export const runtime = 'edge'

export async function POST(req) {
  const { messages } = await req.json()

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages,
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}


// async function callGPT(mess) {
//   try {
//     const response = await openai.beta.chat.completions.stream({
//       model: "gpt-3.5-turbo",
//       messages: mess,
//       temperature: 1,
//       max_tokens: 256,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//       stream: true,
//     });
//     // mess.push({
//     //   role: "assistant",
//     //   content: response.choices[0].message.content,
//     // });
//     //console.log(response.choices[0].message.content);
//     for await (const chunk of response) {
//       process.stdout.write(chunk.choices[0]?.delta?.content || '');
//     }
//     const chatCompletion = await response.finalChatCompletion();
//     console.log(chatCompletion); // {id: "…", choices: […], …}
//     console.log(chatCompletion.choices);
//     return(mess); 
//   } catch (e) {
//     console.log(e);
//   }
// }
// callGPT([
//   {
//     role: "system",
//     content:
//       "You are a helpful writing assistant. Please answer any questions that users may have so that they can complete their essay.",
//   },
// ]);



export default POST;
