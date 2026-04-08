<div align="center">
  <img src="public/Images/kean-seal.png" alt="Kean University" width="80" />
  <h1>Kean AIEducator</h1>
  <p><strong>AI-Powered Career Platform for Kean University Students</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Status-Prototype-blue" alt="Status" />
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/AI-Llama_3.3_70B-orange" alt="AI" />
    <img src="https://img.shields.io/badge/Hosted-Cloudflare-F38020?logo=cloudflare" alt="Cloudflare" />
  </p>

  <h3>
    <a href="https://aieducator.jamesmardi475.workers.dev">View Live Prototype</a>
  </h3>

  <br />

  > **This is a functional prototype** built for academic purposes at Kean University.
  > It demonstrates AI-powered career tools for students and employers.
  > Use any email/password to sign in (no real authentication).

  <br />
</div>

---

## Landing Page

Interactive Three.js globe with animated city connections. Two clear paths: Students and Employers. Real Kean University branding, campus imagery, and student testimonials.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_19_39_PM.png" alt="Landing Page" width="100%" />
</p>

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_19_31_PM.png" alt="Globe Animation" width="100%" />
</p>

### Campus Showcase and Features

Kean University campus with animated Ken Burns effect. Three core pillars: Resume Intelligence, Career Matching, and Employer Portal.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_20_21_PM.png" alt="Campus and Features" width="100%" />
</p>

### Student Testimonials

Real feedback from Kean University students who tested the prototype.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_20_34_PM.png" alt="Student Testimonials" width="100%" />
</p>

---

## Student Sign In

Split-screen layout with Kean campus imagery on the left and a clean login form on the right. Responsive on mobile.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_21_35_PM.png" alt="Student Login" width="100%" />
</p>

---

## Student Dashboard

Personalized home screen with time-based greeting, progress tracker, animated SVG score ring, rotating feedback carousel, inline AI Q&A, skills display, career tips, and job search resource links.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_28_38_PM.png" alt="Student Dashboard" width="100%" />
</p>

---

## Onboarding

Step 1 of 5. Students select their major, pick skills from categorized lists, and choose career interests. All data saved locally and pre-filled on return visits.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_22_07_PM.png" alt="Onboarding" width="100%" />
</p>

---

## Resume Upload

Supports PDF, DOCX, DOC, and TXT file uploads or direct text paste. Character count and file validation built in.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_26_11_PM.png" alt="Resume Upload" width="100%" />
</p>

---

## AI Resume Analysis

Real-time AI analysis powered by Llama 3.3 70B via Groq. Five-step progress indicator with elapsed timer and rotating resume tips while the AI works. Not hardcoded — every analysis is unique to the uploaded resume.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_26_26_PM.png" alt="AI Analysis" width="100%" />
</p>

---

## AI Feedback

Detailed results including overall score (out of 100), letter grade, category breakdown across 5 dimensions, strengths with specific resume references, and bullet point improvements with concrete rewrite suggestions.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_28_03_PM.png" alt="AI Feedback" width="100%" />
</p>

---

## Career Center — AI Recommendations

AI generates 6 personalized career paths ranked by match score. Each career shows salary range, demand level, skills breakdown, growth path, and direct job search links to LinkedIn, Indeed, and Handshake. Students can regenerate for fresh results.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_27_04_PM.png" alt="AI Career Recommendations" width="100%" />
</p>

---

## Career Center — Career Fair Employers

Real companies recruiting Kean students. Each employer card expands to show: Apply Now (links to real careers page), Schedule Interview, Send Resume, AI-generated preparation tips, and AI-generated interview questions.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_27_15_PM.png" alt="Career Fair Employers" width="100%" />
</p>

---

## AI Assistant

Full chat interface with streaming responses. The AI knows the student's profile, major, skills, and resume — giving personalized advice. Also answers general questions (math, homework, life advice). Includes quick action prompts, undo, and clear chat.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_28_27_PM.png" alt="AI Assistant" width="100%" />
</p>

---

## Employer Portal

Dedicated section for employers with its own landing page, sign in, and dashboard. Emerald green theme to visually separate from the student blue side. Features: post positions, browse candidates, analytics, and a four-step hiring flow.

<p align="center">
  <img src="public/screenshots/Screenshot_2026-04-07_at_11_21_21_PM.png" alt="Employer Portal" width="100%" />
</p>

---

## Features

### For Students
| Feature | Description |
|---------|-------------|
| AI Resume Analysis | Upload a resume and receive a score across 5 dimensions with specific improvement suggestions |
| Bullet Rewrites | Weak bullets identified and rewritten with 3 alternatives using the STAR method |
| Missing Keywords | AI identifies field-specific keywords missing from the resume |
| Career Recommendations | 6 AI-generated career paths with salary data, growth paths, and match scores |
| Job Search Links | Direct links to LinkedIn, Indeed, and Handshake for each career |
| Career Fair Employers | Real companies with AI-generated interview prep and practice questions |
| AI Assistant | Chat with an AI advisor that knows your profile and answers any question |
| Dashboard | Progress tracker, score ring, feedback carousel, quick Q&A, and career tips |

### For Employers
| Feature | Description |
|---------|-------------|
| Employer Portal | Dedicated landing, login, and dashboard with emerald branding |
| Post Positions | Create internship, part-time, and full-time listings |
| AI Matching | Students matched to employer criteria based on skills and interests |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS 4 |
| Build | Vite 6 |
| AI | Llama 3.3 70B via Groq API |
| 3D | Three.js |
| Icons | Lucide React |
| Hosting | Cloudflare Pages |
| Storage | localStorage (prototype) |

---

## Running Locally

```bash
git clone https://github.com/Brago475/AIEducator.git
cd AIEducator

# Create .env with your free Groq API key
echo "VITE_GROQ_KEY=your_key_here" > .env

npm install
npm run dev
```

Get a free API key at [console.groq.com](https://console.groq.com)

---

## Prototype Limitations

This is an academic prototype. For production use, the following would need to be addressed:

- No backend — data stored in browser localStorage only
- No real authentication — login is simulated
- API key runs in the browser — would need a server proxy in production
- Data does not persist across devices or browser clears
- Career fair employers are a static list — would need a real management system
- Interview requests and resume submissions are simulated

---

## Student Feedback

> *"The most helpful part of the prototype was the personalized career recommendations, as they made it easier to identify relevant job opportunities based on my skills and interests."*
> — **Meeraben Patel**

> *"I think the layout and presentation was nice. I could find everything I needed to with a maximum of 2 clicks."*
> — **Brodie Berger**

> *"The resume analyzer and career suggestions were the most helpful features."*
> — **Iyadunni Adenuga**

> *"I liked the clean and intuitive interface. It reduces complexity and makes it easy for users to quickly find matches and schedule meetings without confusion."*
> — **Meeraben Patel**

> *"The Resume Analysis feature stood out as particularly useful."*
> — **Md Jonayed Hossain Chowdhury**

> *"I like how it asks to insert your resume — it makes the process straightforward."*
> — **Travis Matos**

> *"The UI and UX were the most impressive parts of the prototype."*
> — **Akhil Ageer**

---

## Author

**James W. Mardi**
M.S. Computer Science — Kean University (Expected May 2027)

GitHub: [@Brago475](https://github.com/Brago475)

---

<div align="center">
  <img src="public/Images/kean-seal.png" alt="Kean" width="40" />
  <br />
  <sub>Built for Kean University · Union, New Jersey · Est. 1855</sub>
  <br />
  <sub>Academic prototype — not for commercial use</sub>
</div>
  # Build functional website

  This is a code bundle for Build functional website. The original project is available at https://www.figma.com/design/IIAk6xIAxxN6waXlXEHpBj/Build-functional-website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  