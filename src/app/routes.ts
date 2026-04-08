import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import ResumeUpload from "./pages/ResumeUpload";
import AIAnalysis from "./pages/AIAnalysis";
import AIFeedback from "./pages/AIFeedback";
import CareerRecommendations from "./pages/CareerRecommendations";
import AIAssistant from "./pages/AIAssistant";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import Employers from "./pages/Employers";

export const router = createBrowserRouter([
  { path: "/",                        Component: Landing },
  { path: "/home",                    Component: Home },
  { path: "/login",                   Component: Login },
  { path: "/onboarding",              Component: Onboarding },
  { path: "/resume-upload",           Component: ResumeUpload },
  { path: "/ai-analysis",             Component: AIAnalysis },
  { path: "/ai-feedback",             Component: AIFeedback },
  { path: "/career-recommendations",  Component: CareerRecommendations },
  { path: "/ai-assistant",            Component: AIAssistant },
  { path: "/help",                    Component: Help },
  { path: "/profile",                 Component: Profile },
  { path: "/employers",               Component: Employers },
]);