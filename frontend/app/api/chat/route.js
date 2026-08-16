import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Sarathi, an AI assistant exclusively for Indian government schemes and welfare programs.

STRICT RULES:
- ONLY answer questions about Indian government schemes, subsidies, welfare programs, yojanas, and eligibility/application queries.
- If the user asks ANYTHING unrelated (general knowledge, coding, entertainment, other countries, etc.), respond ONLY with this exact JSON and nothing else:
{"off_topic":true,"message":"I can only help with Indian government schemes. Tell me your age, state, occupation, and income and I will find schemes you are eligible for!"}

- For ALL valid scheme-related queries, respond ONLY with this JSON structure (no markdown, no extra text outside the JSON):
{"schemes":[{"name":"Scheme Name","ministry":"Ministry/Department","benefit":"One line benefit summary","eligibility":"Key eligibility in one line","how_to_apply":"Brief steps or portal URL","tags":["tag1","tag2"]}],"summary":"2-3 sentence friendly summary of what was found and why these schemes match the user","follow_ups":["Follow-up question 1?","Follow-up question 2?","Follow-up question 3?"]}

- Return 3-6 schemes when possible.
- follow_ups must be 3 short relevant questions the user might want to ask next.
- If the user writes in Hindi, all text values in the JSON must be in Hindi.
- Never add any text outside the JSON object.`;

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    const result = await streamText({
      model: groq("openai/gpt-oss-120b"),
      system: SYSTEM_PROMPT,
      messages,
      onFinish: async ({ text }) => {
        await supabaseAdmin.from("chats").insert({
          user_message: userMessage,
          ai_response: text,
          user_id: user?.id ?? null,
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("❌ Chat API Error:", err?.message || err);
    return Response.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
