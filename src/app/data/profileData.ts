// Shared reference data used by Onboarding, Profile, and SkillPicker

export const MAJORS = [
  // Technology
  "Computer Science",
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Software Engineering",
  // Science & Math
  "Mathematics",
  "Statistics",
  "Physics",
  "Biology",
  "Chemistry",
  "Environmental Science",
  // Engineering
  "Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  // Business
  "Business Administration",
  "Accounting",
  "Finance",
  "Marketing",
  "Management",
  "Economics",
  // Health & Social
  "Nursing",
  "Health Sciences",
  "Public Health",
  "Psychology",
  "Sociology",
  "Criminal Justice",
  // Education & Arts
  "Education",
  "Communication",
  "Media Studies",
  "Graphic Design",
  "Fine Arts",
  "English",
  "History",
  "Political Science",
  "Other",
];

export interface SkillCategory {
  name: string;
  emoji: string;
  color: string;          // Tailwind active-button color classes
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Programming",
    emoji: "💻",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#",
      "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "R", "MATLAB",
      "Scala", "Perl", "Bash / Shell", "Assembly", "Lua", "Haskell",
    ],
  },
  {
    name: "Web & Mobile",
    emoji: "🌐",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "HTML / CSS", "React", "Angular", "Vue.js", "Next.js", "Svelte",
      "Node.js", "Django", "Flask", "Spring Boot", "Laravel",
      "React Native", "Flutter", "iOS Development", "Android Development",
      "WordPress", "REST APIs", "GraphQL", "Tailwind CSS", "Bootstrap",
      "Express.js", "FastAPI", "Nuxt.js", "Astro",
    ],
  },
  {
    name: "Data & AI",
    emoji: "📊",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "SQL", "Data Analysis", "Machine Learning", "Deep Learning",
      "Statistics", "Data Visualization", "Tableau", "Power BI",
      "Excel / Sheets", "TensorFlow", "PyTorch", "NLP",
      "Computer Vision", "Big Data", "Spark", "Pandas / NumPy",
      "Jupyter Notebooks", "Scikit-learn", "Hugging Face", "LangChain",
      "A/B Testing", "ETL Pipelines", "Data Engineering", "dbt",
    ],
  },
  {
    name: "Cloud & DevOps",
    emoji: "☁️",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
      "Linux", "CI/CD", "Terraform", "Ansible", "Networking",
      "System Administration", "Git / GitHub", "DevOps",
      "Nginx", "Apache", "Prometheus", "Grafana", "Vagrant",
      "Infrastructure as Code", "Serverless",
    ],
  },
  {
    name: "Security",
    emoji: "🔒",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Cybersecurity", "Network Security", "Ethical Hacking",
      "Penetration Testing", "Cryptography", "SIEM", "Incident Response",
      "Forensics", "Risk Assessment", "Compliance",
      "Vulnerability Assessment", "Threat Modeling", "Zero Trust",
      "IAM", "SOC Operations", "Malware Analysis",
    ],
  },
  {
    name: "Engineering",
    emoji: "⚙️",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "AutoCAD", "SolidWorks", "Arduino", "Raspberry Pi",
      "Embedded Systems", "PLC Programming", "Circuit Design",
      "PCB Design", "VHDL / Verilog", "LabVIEW",
      "Structural Analysis", "Fluid Mechanics", "Thermodynamics",
      "3D Printing", "ANSYS", "MATLAB Simulink", "Robotics",
      "Control Systems", "Signal Processing", "CAD / CAM",
    ],
  },
  {
    name: "Business",
    emoji: "📈",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Project Management", "Agile / Scrum", "Business Analysis",
      "Product Management", "Financial Analysis", "Accounting",
      "Marketing", "Sales", "Operations", "Supply Chain",
      "Microsoft Office", "Google Workspace", "QuickBooks",
      "Business Strategy", "Entrepreneurship", "Six Sigma",
      "Change Management", "Customer Experience", "Digital Marketing",
      "SEO / SEM", "E-Commerce",
    ],
  },
  {
    name: "Finance",
    emoji: "💰",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Financial Modeling", "Bloomberg Terminal", "Investment Analysis",
      "Portfolio Management", "Econometrics", "Tax Planning",
      "Auditing", "Budgeting", "Cryptocurrency", "Corporate Finance",
      "Derivatives", "Financial Reporting", "Cost Accounting",
      "Valuation", "Risk Management", "Mergers & Acquisitions",
      "Private Equity", "Real Estate Finance",
    ],
  },
  {
    name: "Design",
    emoji: "🎨",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "UI / UX Design", "Figma", "Adobe Photoshop", "Illustrator",
      "InDesign", "Canva", "Video Editing", "Motion Graphics",
      "3D Modeling", "Graphic Design", "Wireframing",
      "Adobe XD", "Sketch", "Prototyping", "Brand Identity",
      "Typography", "Color Theory", "User Research", "Accessibility Design",
    ],
  },
  {
    name: "Health & Medicine",
    emoji: "🏥",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Patient Care", "Nursing Skills", "Medical Terminology",
      "EMR / EHR", "Clinical Research", "Pharmacology",
      "Public Health", "Epidemiology", "Health Informatics",
      "CPR / First Aid", "Mental Health Support", "Nutrition & Dietetics",
      "Anatomy & Physiology", "Medical Imaging", "Telehealth",
      "Community Health", "Case Management (Health)", "Health Policy",
      "Infection Control", "Surgical Assistance",
    ],
  },
  {
    name: "Social Sciences",
    emoji: "🧠",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Psychology", "Sociology", "Criminology", "Social Work",
      "Policy Analysis", "Survey Research", "Qualitative Research",
      "Behavioral Analysis", "Child Development", "Community Organizing",
      "Advocacy", "Conflict Mediation", "Grant Writing",
      "Criminal Justice", "Juvenile Justice", "Trauma-Informed Care",
      "Cultural Competency", "Political Science", "International Relations",
    ],
  },
  {
    name: "Science & Math",
    emoji: "🔬",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Research", "Lab Techniques", "Scientific Writing",
      "Data Collection", "Calculus", "Linear Algebra",
      "Biology", "Chemistry", "Physics", "Environmental Analysis",
      "GIS / Mapping", "SPSS", "Biochemistry", "Genetics",
      "Microbiology", "Ecology", "Organic Chemistry",
      "Differential Equations", "Probability Theory", "Bioinformatics",
    ],
  },
  {
    name: "Arts & Humanities",
    emoji: "🎭",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Creative Writing", "Photography", "Video Production",
      "Music Theory", "Journalism", "Film Production",
      "Podcasting", "Art Direction", "Copyediting",
      "Digital Media", "Storytelling", "Literature Analysis",
      "Historical Research", "Screenwriting", "Illustration",
      "Animation", "Art History", "Cultural Studies",
      "Script Writing", "Blogging",
    ],
  },
  {
    name: "Communication",
    emoji: "🗣️",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Public Speaking", "Technical Writing", "Content Writing",
      "Social Media", "Copywriting", "Academic Writing",
      "Customer Service", "Teaching / Tutoring", "Counseling",
      "Bilingual / Multilingual", "Translation", "Negotiation",
      "Presentation Skills", "Media Relations", "Crisis Communication",
    ],
  },
  {
    name: "Soft Skills",
    emoji: "🤝",
    color: "bg-blue-600 border-blue-600 text-white",
    skills: [
      "Leadership", "Teamwork", "Problem Solving", "Critical Thinking",
      "Time Management", "Adaptability", "Creativity",
      "Conflict Resolution", "Mentoring", "Attention to Detail",
      "Emotional Intelligence", "Decision Making", "Networking",
      "Self-Motivation", "Work Ethic",
    ],
  },
];

// Flat list of all preset skills (for validation, deduplication, etc.)
export const ALL_PRESET_SKILLS: string[] = Array.from(
  new Set(SKILL_CATEGORIES.flatMap((c) => c.skills))
);

export const PRESET_INTERESTS = [
  "Data Science",
  "Cybersecurity",
  "Software Development",
  "Machine Learning",
  "Web Development",
  "Mobile Development",
  "Cloud Engineering",
  "DevOps",
];
