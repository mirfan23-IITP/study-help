import { Persona, RoadmapNode, TopicStatus, UserProfile } from "../types.js";

let counter = 0;
let roadmapSeed = "road";

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 34) || "road";

const node = (
  title: string,
  type: RoadmapNode["type"],
  estimatedHours: number,
  status: TopicStatus = "not-started",
  children: RoadmapNode[] = []
): RoadmapNode => {
  counter += 1;
  const progress =
    children.length > 0
      ? calculateRoadmapProgress(children)
      : status === "completed"
        ? 100
        : status === "in-progress"
          ? 45
          : 0;
  return {
    id: `${roadmapSeed}_${counter}`,
    title,
    type,
    status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : status,
    estimatedHours,
    progress,
    children
  };
};

type TopicPlan = [title: string, hours: number];
type ModulePlan = [title: string, hours: number, topics: TopicPlan[]];

export function buildPersonalizedRoadmap(
  profile: UserProfile,
  persona: Persona = "self-learner"
): RoadmapNode[] {
  const isCareer =
    persona === "job-seeker" ||
    persona === "self-learner" ||
    Boolean(profile.targetJob);
  return isCareer ? buildCareerRoadmap(profile) : buildExamRoadmap(profile);
}

export function buildCareerRoadmap(profile: UserProfile): RoadmapNode[] {
  counter = 0;
  const role = profile.targetJob?.trim() || "Software Engineering";
  const branch = profile.branch?.trim();
  roadmapSeed = `road_${slug(role)}`;
  const lower = role.toLowerCase();
  const modules =
    lower.includes("data") || lower.includes("ml") || lower.includes("ai")
      ? dataCareerModules(role)
      : lower.includes("web")
        ? webCareerModules(role)
        : softwareCareerModules(role, branch);
  return buildRoadmapFromModules(role, modules, profile.currentSkillLevel);
}

export function buildExamRoadmap(profile: UserProfile): RoadmapNode[] {
  counter = 0;
  const exam = profile.examName?.trim() || profile.collegeDegree?.trim() || "Government Exam";
  roadmapSeed = `road_${slug(exam)}`;
  const lower = exam.toLowerCase();
  const modules =
    lower.includes("upsc")
      ? upscModules()
      : lower.includes("gate")
        ? gateModules(profile.branch)
        : lower.includes("cat")
          ? catModules()
          : lower.includes("jee") || lower.includes("neet")
            ? scienceEntranceModules(exam)
            : lower.includes("ssc") ||
                lower.includes("bank") ||
                lower.includes("railway")
              ? govtExamModules(exam)
              : collegeModules(profile);
  return buildRoadmapFromModules(exam, modules, profile.currentSkillLevel);
}

export function calculateRoadmapProgress(children: RoadmapNode[]) {
  if (children.length === 0) return 0;
  const total = children.reduce((sum, child) => sum + child.progress, 0);
  return Math.round(total / children.length);
}

export function buildRevisionDates(base = new Date()) {
  return [1, 3, 7, 15, 30, 60].map((days) => {
    const date = new Date(base);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  });
}

export function nextRevisionDate(base = new Date()) {
  return buildRevisionDates(base)[0];
}

export function flattenRoadmap(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.flatMap((nodeItem) => [
    nodeItem,
    ...flattenRoadmap(nodeItem.children)
  ]);
}

export function nextBestTopics(nodes: RoadmapNode[], limit = 4) {
  return flattenRoadmap(nodes)
    .filter((item) => item.type === "topic" && item.status !== "completed")
    .sort((a, b) => {
      if (a.status === b.status) return b.estimatedHours - a.estimatedHours;
      return a.status === "in-progress" ? -1 : 1;
    })
    .slice(0, limit);
}

function buildRoadmapFromModules(
  title: string,
  modules: ModulePlan[],
  level: UserProfile["currentSkillLevel"] = "beginner"
) {
  const moduleNodes = modules.map(([moduleTitle, hours, topics], moduleIndex) =>
    node(
      moduleTitle,
      "module",
      hours,
      moduleStatus(moduleIndex, level),
      topics.map(([topicTitle, topicHours], topicIndex) =>
        node(topicTitle, "topic", topicHours, topicStatus(moduleIndex, topicIndex, level))
      )
    )
  );
  return [node(title, "subject", modules.reduce((sum, item) => sum + item[1], 0), "in-progress", moduleNodes)];
}

function topicStatus(
  moduleIndex: number,
  topicIndex: number,
  level: UserProfile["currentSkillLevel"]
): TopicStatus {
  if (level === "advanced") {
    if (moduleIndex === 0) return "completed";
    if (moduleIndex === 1 && topicIndex <= 1) return "completed";
    if (moduleIndex <= 2 && topicIndex === 0) return "in-progress";
  }
  if (level === "intermediate") {
    if (moduleIndex === 0 && topicIndex === 0) return "completed";
    if (moduleIndex <= 1 && topicIndex <= 1) return "in-progress";
  }
  if (moduleIndex === 0 && topicIndex === 0) return "in-progress";
  return "not-started";
}

function moduleStatus(
  moduleIndex: number,
  level: UserProfile["currentSkillLevel"]
): TopicStatus {
  if (level === "advanced" && moduleIndex === 0) return "completed";
  if (moduleIndex <= (level === "beginner" ? 0 : 1)) return "in-progress";
  return "not-started";
}

function dataCareerModules(role: string): ModulePlan[] {
  const aiTrack = role.toLowerCase().includes("ai") || role.toLowerCase().includes("ml");
  return [
    [
      "Python, SQL, and Data Handling",
      64,
      [
        ["Python syntax, functions, and OOP", 18],
        ["Pandas and NumPy workflows", 16],
        ["SQL joins, CTEs, windows, and indexing", 20],
        ["Data cleaning and feature tables", 10]
      ]
    ],
    [
      "Statistics and Experimentation",
      54,
      [
        ["Probability and distributions", 15],
        ["Hypothesis testing and confidence intervals", 14],
        ["Regression assumptions and metrics", 14],
        ["A/B testing and experiment design", 11]
      ]
    ],
    [
      aiTrack ? "Machine Learning and Deep Learning" : "Machine Learning",
      86,
      [
        ["Supervised learning pipelines", 22],
        ["Model validation and leakage prevention", 16],
        [aiTrack ? "Neural networks and transformers" : "Tree models and ensembles", 24],
        ["Model serving, monitoring, and MLOps basics", 24]
      ]
    ],
    [
      "Projects and Portfolio",
      70,
      [
        ["End-to-end problem statement and dataset", 18],
        ["Dashboard or app for model insights", 18],
        ["GitHub case study and README", 14],
        ["Resume, LinkedIn, and portfolio proof", 20]
      ]
    ],
    [
      "Interview Preparation",
      58,
      [
        ["SQL and analytics interview sets", 15],
        ["Python coding drills", 15],
        ["Project deep-dive answers", 12],
        ["Mock interviews and behavioral stories", 16]
      ]
    ]
  ];
}

function softwareCareerModules(role: string, branch?: string): ModulePlan[] {
  return [
    [
      "Programming Foundations",
      55,
      [
        [`${branch || "Core"} programming fundamentals`, 14],
        ["OOP, clean code, and testing", 14],
        ["Git, GitHub, and collaboration workflow", 10],
        ["Debugging and problem decomposition", 17]
      ]
    ],
    [
      "Data Structures and Algorithms",
      82,
      [
        ["Arrays, strings, hashing, and two pointers", 18],
        ["Stacks, queues, linked lists, and recursion", 16],
        ["Trees, graphs, heaps, and tries", 24],
        ["Dynamic programming and greedy patterns", 24]
      ]
    ],
    [
      "Core Computer Science",
      78,
      [
        ["DBMS transactions, indexing, and SQL", 18],
        ["Operating systems and concurrency", 18],
        ["Computer networks and APIs", 16],
        ["System design fundamentals", 26]
      ]
    ],
    [
      "Projects and Resume",
      66,
      [
        [`Build one ${role} portfolio project`, 24],
        ["Deploy and document production trade-offs", 16],
        ["Resume bullets and achievement metrics", 12],
        ["LinkedIn, GitHub, and referral readiness", 14]
      ]
    ],
    [
      "Interview Loop",
      52,
      [
        ["Timed coding mocks", 18],
        ["CS fundamentals revision", 12],
        ["Behavioral STAR stories", 10],
        ["Final company-specific practice", 12]
      ]
    ]
  ];
}

function webCareerModules(role: string): ModulePlan[] {
  return [
    [
      "Frontend Foundations",
      58,
      [
        ["HTML semantics and accessibility", 12],
        ["CSS layout, responsive design, and Tailwind", 16],
        ["JavaScript and TypeScript fundamentals", 18],
        ["React state, effects, and forms", 12]
      ]
    ],
    [
      "Backend and Databases",
      60,
      [
        ["Node.js and Express APIs", 16],
        ["Authentication and authorization", 12],
        ["PostgreSQL schema design and queries", 16],
        ["Caching, validation, and error handling", 16]
      ]
    ],
    [
      "Full-Stack Projects",
      82,
      [
        [`Build a production-style ${role} app`, 28],
        ["Testing, monitoring, and deployment", 18],
        ["Performance and bundle optimization", 16],
        ["Case study and portfolio write-up", 20]
      ]
    ],
    [
      "Interview Preparation",
      52,
      [
        ["JavaScript and React interview drills", 16],
        ["DSA patterns for web roles", 16],
        ["System design for web products", 10],
        ["Mock interviews and behavioral stories", 10]
      ]
    ]
  ];
}

function upscModules(): ModulePlan[] {
  return [
    ["Polity and Governance", 84, [["Constitution basics", 18], ["Parliament and executive", 18], ["Judiciary and federalism", 18], ["Governance schemes and current affairs", 30]]],
    ["History and Culture", 76, [["Ancient and medieval India", 18], ["Modern India and freedom struggle", 24], ["Art and culture", 14], ["Previous year questions", 20]]],
    ["Economy and Geography", 86, [["Indian economy fundamentals", 24], ["Budget, banking, and inflation", 18], ["Physical and Indian geography", 24], ["Maps and diagrams practice", 20]]],
    ["Environment, Science, and Current Affairs", 78, [["Environment and ecology", 24], ["Science and tech", 18], ["Monthly current affairs revision", 24], ["Prelims test series", 12]]],
    ["Mains and Essay Practice", 68, [["Answer writing drills", 22], ["Essay frameworks", 16], ["Ethics case studies", 16], ["Full-length mains mocks", 14]]]
  ];
}

function gateModules(branch?: string): ModulePlan[] {
  const core = branch?.toLowerCase().includes("computer") ? "Computer Science" : branch || "Core Engineering";
  return [
    [`${core} Core Subjects`, 110, [["Subject formula sheet", 18], ["High-weightage theory", 32], ["Numerical problem sets", 36], ["Previous year topic clusters", 24]]],
    ["Engineering Mathematics", 58, [["Linear algebra", 14], ["Calculus and differential equations", 16], ["Probability and statistics", 14], ["Discrete mathematics", 14]]],
    ["Aptitude and Reasoning", 34, [["Quant aptitude", 12], ["Verbal ability", 10], ["Reasoning sets", 12]]],
    ["Mock Test and Error Notebook", 70, [["Sectional tests", 18], ["Full mocks", 24], ["Error notebook revision", 16], ["Exam strategy refinement", 12]]]
  ];
}

function catModules(): ModulePlan[] {
  return [
    ["Quantitative Aptitude", 84, [["Arithmetic", 24], ["Algebra", 20], ["Geometry and mensuration", 18], ["Modern math and number system", 22]]],
    ["DILR", 78, [["Arrangement sets", 20], ["Games and tournaments", 16], ["Charts and tables", 20], ["Mixed timed sets", 22]]],
    ["VARC", 66, [["Reading comprehension", 28], ["Para jumbles", 12], ["Summary and odd sentence", 12], ["Vocabulary through reading", 14]]],
    ["Mock Analysis", 62, [["Weekly mocks", 24], ["Error log", 18], ["Time allocation strategy", 10], ["Revision sprints", 10]]]
  ];
}

function scienceEntranceModules(exam: string): ModulePlan[] {
  const isNeet = exam.toLowerCase().includes("neet");
  return [
    ["Physics", 92, [["Mechanics", 26], ["Electricity and magnetism", 24], ["Modern physics", 18], ["Timed numericals", 24]]],
    ["Chemistry", 88, [["Physical chemistry", 24], ["Organic chemistry", 24], ["Inorganic chemistry", 20], ["NCERT and reactions revision", 20]]],
    [isNeet ? "Biology" : "Mathematics", 96, isNeet ? [["Human physiology", 28], ["Genetics and evolution", 22], ["Ecology", 16], ["NCERT line-by-line revision", 30]] : [["Calculus", 28], ["Coordinate geometry", 22], ["Algebra", 24], ["Mock problem sets", 22]]],
    ["Mock Tests and Revision", 64, [["Chapter tests", 18], ["Full mocks", 22], ["Mistake notebook", 14], ["Final formula revision", 10]]]
  ];
}

function govtExamModules(exam: string): ModulePlan[] {
  return [
    ["Quantitative Aptitude", 72, [["Number system and simplification", 16], ["Arithmetic word problems", 24], ["Algebra and geometry", 20], ["Data interpretation", 12]]],
    ["Reasoning", 62, [["Puzzles and seating", 20], ["Syllogism and inequality", 14], ["Coding-decoding and series", 14], ["Mock reasoning sets", 14]]],
    ["English and General Awareness", 78, [["Grammar and vocabulary", 18], [`${exam} current affairs capsule`, 26], ["Static GK", 18], ["Revision quizzes", 16]]],
    ["Mock Test Strategy", 54, [["Previous year papers", 18], ["Timed mock tests", 20], ["Error notebook revision", 16]]]
  ];
}

function collegeModules(profile: UserProfile): ModulePlan[] {
  const degree = profile.collegeDegree || "College";
  const branch = profile.branch || "Core";
  return [
    [`${degree} ${branch} Core Subjects`, 80, [["Semester syllabus mapping", 16], ["High-weightage units", 24], ["Numerical and derivation practice", 22], ["Previous paper analysis", 18]]],
    ["Projects and Lab Work", 58, [["Project topic selection", 14], ["Implementation milestones", 22], ["Report and presentation", 12], ["Viva preparation", 10]]],
    ["Placement Preparation", 72, [["Aptitude drills", 18], ["DSA and coding basics", 24], ["Resume and LinkedIn", 12], ["Mock interviews", 18]]],
    ["Revision and Exams", 50, [["Weekly revision slots", 14], ["Formula sheets and notes", 12], ["Mock tests", 14], ["Final review", 10]]]
  ];
}
