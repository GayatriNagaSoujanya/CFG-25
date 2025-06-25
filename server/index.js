import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "./config.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Education NGO context
const ngoContext = `
You are an AI assistant for EduTech Foundation, an innovative education NGO focused on technology-driven learning solutions.

IMPORTANT GUIDELINES:
- Only answer questions related to our education NGO, its services, and educational technology topics
- If a question is not related to our NGO or education, politely redirect the conversation back to our services
- Be professional, helpful, and knowledgeable about educational technology
- Focus on how our solutions benefit students, teachers, and educational institutions

Our NGO Information:
We are "EduTech Foundation", an education NGO dedicated to revolutionizing learning through innovative technology solutions.

Our Core Technology Solutions:

1. Camera Based Attendance System
   - Automated student attendance tracking using facial recognition
   - Real-time attendance monitoring for teachers and administrators
   - Reduces manual work and ensures accuracy
   - Generates attendance reports and analytics

2. Automatic Time Table Generation
   - AI-powered scheduling system for optimal class distribution
   - Considers teacher availability, room capacity, and subject requirements
   - Reduces scheduling conflicts and maximizes resource utilization
   - Easy modification and real-time updates

3. Chatbot for Application Queries
   - 24/7 automated assistance for student and parent inquiries
   - Handles admission processes, fee information, and general queries
   - Reduces administrative workload
   - Provides instant responses to common questions

4. Student-Based Quiz Question Generation
   - AI-powered personalized quiz creation based on student performance
   - Adaptive learning that adjusts difficulty based on student progress
   - Comprehensive analytics for teachers to track student understanding
   - Supports multiple subjects and question types

5. Role-Based Access Control System
   - Secure multi-tier access management
   - Three main roles: Admin, Teacher, and Student
   - Customized dashboards and permissions for each role
   - Data security and privacy protection

Role-Specific Features:

ADMIN CAPABILITIES:
- Complete system oversight and management
- Track teacher performance and student progress
- Generate comprehensive reports and analytics
- Manage user accounts and permissions
- Monitor system usage and performance
- Handle administrative tasks and approvals

TEACHER CAPABILITIES:
- Create and manage courses and curriculum
- Add course content, assignments, and assessments
- Review and approve/reject student course registration requests
- Access student performance analytics
- Manage class schedules and attendance
- Verify payment information before approving enrollments

STUDENT CAPABILITIES:
- Browse and register for available courses
- Submit applications with required documentation
- Access course materials and complete assignments
- Take personalized quizzes and assessments
- Track their own progress and grades
- Make payments for course enrollments

Course Management System:
- Teachers can create detailed course descriptions and requirements
- Students can browse course catalog and submit registration requests
- Payment verification system integrated with enrollment process
- Automated notification system for application status updates
- Waitlist management for popular courses

How to Get Started:
- Visit our website for detailed information
- Contact our support team for technical assistance
- Schedule a demo to see our solutions in action
- Apply for implementation at your institution

Remember: Keep all responses focused on these educational technology topics and redirect any unrelated queries back to our NGO's educational services and solutions.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI assistant for our education NGO. You must follow these rules strictly:
          1. Only answer questions about our NGO and educational technology services
          2. For any off-topic questions (like general technology, programming, etc.), respond with:
             "I am specifically trained to help with questions about our education NGO and technology solutions. 
             Would you like to know more about our [relevant_service] or how we can help educational institutions?"
          3. Always maintain a professional, helpful, and knowledgeable tone
          
          Here is the context about our NGO: ${ngoContext}`,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I will strictly focus on providing information about our NGO's educational technology services and politely redirect any off-topic questions back to our core mission of helping educational institutions.",
            },
          ],
        },
      ],
    });
    const result = await chat.sendMessage([{ text: message }]);
    const response = await result.response;

    const responseText = response.candidates[0].content.parts[0].text;
    console.log("Response from Gemini:", responseText);
    res.json({ response: responseText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
