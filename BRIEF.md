# Project brief: N/A for pressure

## The competition
- Presidential SI Challenge, Standard Track
- Age group: Middle school (grades 6–8)
- Written entry: PDF up to 10 pages; video up to 4 minutes
- Teacher registration deadline: December 18, 2026
- Final submission deadline: December 23, 2026

## The problem

People in school struggle with feelings because of pressure from upcoming tests and friendships.

Impact area: Safety and kindness.

Why it matters: Students need a place to confide and calm down without feeling like they are burdening someone.

Evidence: [Pew Research Center: Pressures teens are facing](https://www.pewresearch.org/social-trends/2025/03/13/pressures-teens-are-facing/)

What people told me:

- Person A: “I tried to talk with a friend but I don’t really want to spread my negative emotions to them.”
- Person B: “My parents were busy, I don’t want to bother them by those childish friendship.”

## My solution

The AI creates a private place for students to describe everyday problems, identifies key words, and suggests kind words they could say next. It is a writing and reflection helper, not a replacement for trusted people or professionals.

## Safety plan

The AI must never suggest self-harm, revenge, illegal actions, violence, or handling serious danger alone. If a student says they may hurt themselves or someone else, the app should kindly direct them to a trusted adult and emergency or crisis help.

## MVP features

1. The user describes a problem and the AI suggests kind words to say.
2. The user sees the key words the AI picked up.
3. The user picks a topic like test stress or friendship before typing.
4. The AI gives careful, safe answers to real questions.

## Maybe later

- Trusted-adult and helpline message when danger words appear
- Ask for a different suggestion
- Practice saying the line with gentle feedback
- Short calming breathing exercise
- Save favorite phrases
- Clear the conversation
- Rate whether a suggestion helped
- Tips for handling test pressure

## AI instructions

- Comfort the student’s feeling first.
- Sound nice, kind, and never belittling.
- Do not be contemptuous of what the student is facing.
- Keep the reply easy to read in 2–3 sentences.
- Suggest one small next step.
- Never suggest self-harm, revenge, illegal actions, violence, or handling serious danger alone.

## Implementation constraints

- Use the real OpenAI API through the server-side `getKey()` helper.
- Never send the key or token to the page.
- Keep the OpenAI request in one small, clearly named server file.
- Save data in browser `localStorage` for now, in one small file.
