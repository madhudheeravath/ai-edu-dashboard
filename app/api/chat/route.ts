import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { message, history, assignmentContext } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate contextual AI response based on message content
    const responseMessage = generateAIResponse(message, assignmentContext, history)

    return NextResponse.json({
      message: responseMessage,
      model: "gpt-3.5-turbo",
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error("Chat API Error:", error)
    
    return NextResponse.json(
      { error: "Failed to get AI response. Please try again." },
      { status: 500 }
    )
  }
}

function generateAIResponse(message: string, assignmentContext?: string, history?: any[]): string {
  const lowerMessage = message.toLowerCase()
  
  // Responses based on common student queries
  if (lowerMessage.includes('help') && lowerMessage.includes('start')) {
    return "Great question! Let me help you get started. First, let's break down your assignment into smaller, manageable parts. What specific aspect of this assignment are you finding most challenging? Understanding the main topic, organizing your thoughts, or something else?"
  }
  
  if (lowerMessage.includes('brainstorm') || lowerMessage.includes('ideas')) {
    return "Brainstorming is a fantastic way to begin! Here are some techniques you can try:\n\n• **Mind mapping**: Start with your main topic in the center and branch out with related ideas\n• **Free writing**: Set a timer for 10 minutes and write continuously about your topic\n• **Question approach**: Ask yourself 'What if...?', 'How does...?', 'Why is...?' questions\n\nWhat's your main topic or theme? I can help you think of specific angles to explore."
  }
  
  if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
    return "I'd be happy to help you improve your work! Rather than making changes for you, let me guide you through some self-evaluation questions:\n\n• Is your main argument clear and well-supported?\n• Do your paragraphs flow logically from one to the next?\n• Have you provided specific examples or evidence?\n• Does your conclusion tie everything together?\n\nWhich of these areas would you like to focus on first?"
  }
  
  if (lowerMessage.includes('structure') || lowerMessage.includes('organize')) {
    return "Good thinking about structure! A well-organized piece makes your ideas much clearer. Here's a framework you might consider:\n\n**Introduction**: Hook + Background + Thesis\n**Body Paragraphs**: Topic sentence + Evidence + Analysis + Transition\n**Conclusion**: Restate thesis + Summarize key points + Final thought\n\nWhat type of assignment are you working on? I can suggest more specific organizational strategies."
  }
  
  if (lowerMessage.includes('research') || lowerMessage.includes('sources')) {
    return "Research is crucial for a strong assignment! Here are some strategies:\n\n• Start with credible academic databases and your library's resources\n• Look for recent, peer-reviewed sources when possible\n• Take notes on key points and always track your sources\n• Consider multiple perspectives on your topic\n\nWhat's your research question or main topic? I can help you think about what types of sources might be most valuable."
  }
  
  if (lowerMessage.includes('thesis') || lowerMessage.includes('argument')) {
    return "A strong thesis is the backbone of your work! Your thesis should:\n\n• Make a clear, specific claim\n• Be arguable (not just a fact)\n• Preview the main points you'll discuss\n• Be positioned prominently (usually end of introduction)\n\nWhat's the main point you're trying to make in your assignment? Let's work together to refine it into a strong thesis statement."
  }
  
  if (lowerMessage.includes('conclusion') || lowerMessage.includes('ending')) {
    return "Conclusions can be tricky, but they're so important! A strong conclusion should:\n\n• Restate your main argument (but not word-for-word)\n• Summarize your key supporting points\n• Explain why your argument matters\n• Leave the reader with something to think about\n\nWhat main points have you made in your assignment? I can help you think about how to tie them together effectively."
  }
  
  if (lowerMessage.includes('stuck') || lowerMessage.includes('confused')) {
    return "It's completely normal to feel stuck sometimes! Let's break through this together. Try this approach:\n\n1. **Step back**: What's the main goal of your assignment?\n2. **Identify the specific problem**: What exactly is confusing you?\n3. **Break it down**: Can you tackle just one small part right now?\n4. **Change perspective**: What would you tell a friend facing this same challenge?\n\nWhat specific part is giving you trouble? Sometimes just talking through it can help clarify your thoughts."
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('deadline')) {
    return "Time management is so important for quality work! Here's a strategy that works well:\n\n• **Plan backwards**: Start from your deadline and work back\n• **Break into phases**: Research → Outline → First draft → Revision → Final draft\n• **Set mini-deadlines**: Give yourself deadlines for each phase\n• **Buffer time**: Always plan for unexpected challenges\n\nHow much time do you have left? I can help you create a realistic timeline."
  }
  
  // Default responses for general queries
  const defaultResponses = [
    "That's an interesting question! To help you think through this, consider: What do you already know about this topic? What specific aspects are you most curious about?",
    
    "I can see you're thinking deeply about this! Rather than giving you a direct answer, let me ask: What connections can you make between this topic and what you've learned in class?",
    
    "Great question! Let's explore this together. What's your initial thinking on this? Sometimes our first instincts can lead us to valuable insights.",
    
    "I'd like to help you develop your own understanding here. What sources or examples might help you explore this topic further?",
    
    "That's a thoughtful inquiry! To guide your thinking: What are the key components of this topic? How might they relate to each other?",
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}
