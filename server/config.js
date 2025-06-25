import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};

export default config;
