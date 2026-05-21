// ============================================
// API Layer with Mock Data
// ============================================

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio?: string
  joinedDate: string
  status: "active" | "away" | "offline"
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  title: string
  description: string
  category: "health" | "learning" | "productivity" | "finance" | "personal"
  progress: number
  deadline: string
  status: "active" | "completed" | "paused"
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
}

export type FeedCategory =
  | "all"
  | "new_launch"
  | "offers"
  | "ai"
  | "productivity"
  | "startups"
  | "design"
  | "indie"
  | "learning"

export interface FeedItem {
  id: string
  type: "achievement" | "milestone" | "update" | "reminder" | "news" | "social"
  title: string
  description: string
  icon: string
  image?: string
  timestamp: Date
  actionUrl?: string
  source?: "hackernews" | "twitter" | "producthunt" | "aura" | "reddit"
  author?: string
  likes?: number
  comments?: number
  category?: FeedCategory
}

export interface HistoryItem {
  id: string
  action: string
  description: string
  timestamp: Date
  category: "chat" | "goal" | "activity" | "system"
}

export interface Settings {
  theme: "night" | "morning" | "evening"
  notifications: boolean
  emailUpdates: boolean
  privateMode: boolean
  language: string
  timezone: string
  wallpaper?: string
}

// ============================================
// Mock Data
// ============================================

const mockUser: User = {
  id: "user_001",
  name: "Theekshana",
  email: "theekshana@aura.ai",
  avatar: "/avatars/shadcn.jpg",
  bio: "AI enthusiast and productivity geek",
  joinedDate: "2024-01-15",
  status: "active",
}

const mockChatMessages: ChatMessage[] = [
  {
    id: "msg_001",
    role: "user",
    content: "What are the best productivity tips for remote work?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "msg_002",
    role: "assistant",
    content: "Here are some effective productivity tips for remote work:\n\n1. Create a dedicated workspace\n2. Maintain a consistent schedule\n3. Take regular breaks\n4. Minimize distractions\n5. Use time-blocking techniques\n\nWould you like me to elaborate on any of these?",
    timestamp: new Date(Date.now() - 240000),
  },
]

const mockGoals: Goal[] = [
  {
    id: "goal_001",
    title: "Learn Machine Learning",
    description: "Complete ML fundamentals course and build 3 projects",
    category: "learning",
    progress: 65,
    deadline: "2024-06-30",
    status: "active",
    tasks: [
      { id: "task_001", title: "Complete linear algebra module", completed: true },
      { id: "task_002", title: "Finish probability & statistics", completed: true },
      { id: "task_003", title: "Build neural network from scratch", completed: false },
      { id: "task_004", title: "Deploy first ML model", completed: false },
    ],
  },
  {
    id: "goal_002",
    title: "Read 12 Books",
    description: "Read one book per month across different genres",
    category: "personal",
    progress: 33,
    deadline: "2024-12-31",
    status: "active",
    tasks: [
      { id: "task_005", title: "Read Atomic Habits", completed: true },
      { id: "task_006", title: "Read Dune", completed: true },
      { id: "task_007", title: "Read The Midnight Library", completed: true },
      { id: "task_008", title: "Read 9 more books", completed: false },
    ],
  },
  {
    id: "goal_003",
    title: "Build Side Project",
    description: "Create a full-stack web application",
    category: "productivity",
    progress: 45,
    deadline: "2024-04-30",
    status: "active",
    tasks: [
      { id: "task_009", title: "Design UI/UX", completed: true },
      { id: "task_010", title: "Setup backend infrastructure", completed: true },
      { id: "task_011", title: "Implement authentication", completed: false },
      { id: "task_012", title: "Deploy to production", completed: false },
    ],
  },
  {
    id: "goal_004",
    title: "Morning Fitness Routine",
    description: "Exercise 5 days a week for better health",
    category: "health",
    progress: 80,
    deadline: "2024-12-31",
    status: "active",
    tasks: [
      { id: "task_013", title: "Monday workout", completed: true },
      { id: "task_014", title: "Wednesday workout", completed: true },
      { id: "task_015", title: "Friday workout", completed: true },
      { id: "task_016", title: "Maintain weekly schedule", completed: true },
    ],
  },
]

// ============================================
// For You Feed
// ============================================
const forYouFeedItems: FeedItem[] = [
  {
    id: "fy_001",
    type: "social",
    source: "producthunt",
    category: "new_launch",
    title: "Perplexity AI: The New Search Engine",
    description: "Revolutionary search powered by advanced LLMs. Get instant answers with citations.",
    author: "Product Hunt Community",
    icon: "🚀",
    timestamp: new Date(Date.now() - 1800000),
    likes: 2541,
    comments: 387,
    image: "https://images.unsplash.com/photo-1680783954745-3249be59e527?w=500&h=300&fit=crop",
    actionUrl: "https://www.producthunt.com",
  },
  {
    id: "fy_002",
    type: "social",
    source: "hackernews",
    category: "indie",
    title: "Show HN: I built an AI-powered productivity tool",
    description: "A lightweight CLI tool using GPT-4 to help developers write better code. Open source.",
    author: "developer_xyz",
    icon: "💻",
    timestamp: new Date(Date.now() - 5400000),
    likes: 892,
    comments: 145,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    actionUrl: "https://news.ycombinator.com",
  },
  {
    id: "fy_003",
    type: "social",
    source: "twitter",
    category: "ai",
    title: "@OpenAI: Introducing GPT-5 Preview",
    description: "Our most capable model yet — 10x faster reasoning and improved multimodal understanding.",
    author: "OpenAI",
    icon: "🤖",
    timestamp: new Date(Date.now() - 9000000),
    likes: 45230,
    comments: 8934,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=300&fit=crop",
    actionUrl: "https://twitter.com",
  },
  {
    id: "fy_004",
    type: "social",
    source: "reddit",
    category: "productivity",
    title: "Best ways to stay productive while working remotely?",
    description: "500+ engineers share their top strategies for deep work and flow state.",
    author: "r/productivity",
    icon: "💡",
    timestamp: new Date(Date.now() - 12600000),
    likes: 3421,
    comments: 512,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    actionUrl: "https://reddit.com/r/productivity",
  },
  {
    id: "fy_005",
    type: "social",
    source: "hackernews",
    category: "ai",
    title: "The state of AI in 2025: What we've learned",
    description: "A comprehensive analysis of AI progress this year. Insights from leading researchers.",
    author: "tech_writer",
    icon: "📊",
    timestamp: new Date(Date.now() - 14400000),
    likes: 1243,
    comments: 298,
    image: "https://images.unsplash.com/photo-1611701600139-0d468e20c9a1?w=500&h=300&fit=crop",
    actionUrl: "https://news.ycombinator.com",
  },
  {
    id: "fy_006",
    type: "social",
    source: "producthunt",
    category: "new_launch",
    title: "Linear 3.0: The Future of Project Management",
    description: "Completely redesigned with AI-powered roadmaps and real-time collaboration.",
    author: "Linear Team",
    icon: "📐",
    timestamp: new Date(Date.now() - 18000000),
    likes: 3102,
    comments: 654,
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=300&fit=crop",
    actionUrl: "https://www.producthunt.com",
  },
  {
    id: "fy_007",
    type: "social",
    source: "twitter",
    category: "indie",
    title: "How I hit $10k MRR as a solo founder in 6 months",
    description: "The exact growth playbook — from zero to $10k MRR building a developer tool in public.",
    author: "@levelsio",
    icon: "💰",
    timestamp: new Date(Date.now() - 21600000),
    likes: 18900,
    comments: 2341,
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=500&h=300&fit=crop",
    actionUrl: "https://twitter.com",
  },
  {
    id: "fy_008",
    type: "social",
    source: "producthunt",
    category: "offers",
    title: "Notion — 6 months free for indie hackers",
    description: "Notion's Plus plan completely free for 6 months. No credit card required. Limited time.",
    author: "Notion Team",
    icon: "🎁",
    timestamp: new Date(Date.now() - 25200000),
    likes: 9870,
    comments: 1230,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=300&fit=crop",
    actionUrl: "https://notion.so",
  },
  {
    id: "fy_009",
    type: "social",
    source: "producthunt",
    category: "design",
    title: "Framer AI: Design any website with natural language",
    description: "Describe your website in plain English and watch Framer AI build it in real-time.",
    author: "Framer Team",
    icon: "🎨",
    timestamp: new Date(Date.now() - 28800000),
    likes: 5670,
    comments: 890,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop",
    actionUrl: "https://www.producthunt.com",
  },
  {
    id: "fy_010",
    type: "social",
    source: "hackernews",
    category: "startups",
    title: "YC S25 Batch: The most AI-heavy class in history",
    description: "80% of Y Combinator's Summer 2025 batch are AI-first startups, up from 40% two years ago.",
    author: "ycombinator_news",
    icon: "🌱",
    timestamp: new Date(Date.now() - 32400000),
    likes: 2871,
    comments: 543,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop",
    actionUrl: "https://news.ycombinator.com",
  },
  {
    id: "fy_011",
    type: "social",
    source: "twitter",
    category: "productivity",
    title: "The deep work protocol that changed my output",
    description: "From scattered 10-hour days to focused 5-hour days producing 3x the output.",
    author: "@naval",
    icon: "🎯",
    timestamp: new Date(Date.now() - 36000000),
    likes: 22100,
    comments: 3100,
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=300&fit=crop",
    actionUrl: "https://twitter.com",
  },
  {
    id: "fy_012",
    type: "social",
    source: "reddit",
    category: "offers",
    title: "GitHub Copilot — Free tier now available for everyone",
    description: "2,000 completions/month free forever. No credit card. Available globally starting today.",
    author: "r/programming",
    icon: "🎉",
    timestamp: new Date(Date.now() - 39600000),
    likes: 14200,
    comments: 2100,
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&h=300&fit=crop",
    actionUrl: "https://github.com/features/copilot",
  },
]

// ============================================
// Goal Focused Feed
// ============================================
const goalFocusedFeedItems: FeedItem[] = [
  {
    id: "gf_001",
    type: "social",
    source: "hackernews",
    category: "learning",
    title: "How to learn anything 10x faster using spaced repetition",
    description: "The science of memory and how tools like Anki compress months of learning into weeks.",
    author: "learning_hacker",
    icon: "🧠",
    timestamp: new Date(Date.now() - 2700000),
    likes: 3120,
    comments: 421,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=300&fit=crop",
    actionUrl: "https://news.ycombinator.com",
  },
  {
    id: "gf_002",
    type: "social",
    source: "twitter",
    category: "productivity",
    title: "The 1% rule: How tiny daily gains compound",
    description: "Improving 1% every day means 37x better by year end. Here's the math and the method.",
    author: "@JamesClear",
    icon: "📈",
    timestamp: new Date(Date.now() - 5400000),
    likes: 31200,
    comments: 4870,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    actionUrl: "https://twitter.com",
  },
  {
    id: "gf_003",
    type: "social",
    source: "producthunt",
    category: "new_launch",
    title: "Notion AI Goals: Crush your goals with AI",
    description: "Personalized action plans that track progress and adapt as you grow.",
    author: "Notion Team",
    icon: "🎯",
    timestamp: new Date(Date.now() - 7200000),
    likes: 4320,
    comments: 768,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=300&fit=crop",
    actionUrl: "https://www.producthunt.com",
  },
  {
    id: "gf_004",
    type: "social",
    source: "reddit",
    category: "productivity",
    title: "365 days of consistent coding — here's what happened",
    description: "One developer's honest account of coding every single day for a full year.",
    author: "r/learnprogramming",
    icon: "💻",
    timestamp: new Date(Date.now() - 10800000),
    likes: 12800,
    comments: 1923,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop",
    actionUrl: "https://reddit.com/r/learnprogramming",
  },
  {
    id: "gf_005",
    type: "social",
    source: "hackernews",
    category: "indie",
    title: "Building in public: $0 to $8k MRR in 6 months",
    description: "Full breakdown of how one founder built and grew a SaaS solo, no investors, no team.",
    author: "indie_founder",
    icon: "🚀",
    timestamp: new Date(Date.now() - 14400000),
    likes: 2430,
    comments: 387,
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=500&h=300&fit=crop",
    actionUrl: "https://news.ycombinator.com",
  },
  {
    id: "gf_006",
    type: "social",
    source: "twitter",
    category: "learning",
    title: "MIT OpenCourseWare courses that changed my career",
    description: "10 free MIT courses that gave me the foundation to land a senior engineering role.",
    author: "@sirupsen",
    icon: "🎓",
    timestamp: new Date(Date.now() - 18000000),
    likes: 16700,
    comments: 2100,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&h=300&fit=crop",
    actionUrl: "https://twitter.com",
  },
  {
    id: "gf_007",
    type: "social",
    source: "producthunt",
    category: "offers",
    title: "Coursera — 1 month free on any Professional Certificate",
    description: "Full month free on any Google, Meta, or IBM Professional Certificate. No strings attached.",
    author: "Coursera Team",
    icon: "🎁",
    timestamp: new Date(Date.now() - 21600000),
    likes: 7830,
    comments: 1020,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop",
    actionUrl: "https://www.producthunt.com",
  },
  {
    id: "gf_008",
    type: "social",
    source: "reddit",
    category: "learning",
    title: "Zero to ML Engineer in 12 months — exact roadmap",
    description: "A self-taught engineer shares the resources and projects that got them hired at a top AI lab.",
    author: "r/MachineLearning",
    icon: "🤖",
    timestamp: new Date(Date.now() - 25200000),
    likes: 9870,
    comments: 1432,
    image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=500&h=300&fit=crop",
    actionUrl: "https://reddit.com/r/MachineLearning",
  },
  {
    id: "gf_009",
    type: "social",
    source: "hackernews",
    category: "productivity",
    title: "Second brain: Obsidian vs Notion vs Logseq compared",
    description: "In-depth breakdown of the three leading PKM tools and which type of thinker each suits.",
    author: "pkm_enthusiast",
    icon: "🧩",
    timestamp: new Date(Date.now() - 28800000),
    likes: 1870,
    comments: 290,
    image: "https://images.unsplash.com/photo-1546953304-5d96f43c2e94?w=500&h=300&fit=crop",
    actionUrl: "https://news.ycombinator.com",
  },
  {
    id: "gf_010",
    type: "social",
    source: "twitter",
    category: "startups",
    title: "Why I stopped chasing funding and bootstrapped",
    description: "The mindset shift that made me a better founder — and helped me build something people love.",
    author: "@DHH",
    icon: "💡",
    timestamp: new Date(Date.now() - 32400000),
    likes: 24300,
    comments: 3870,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&h=300&fit=crop",
    actionUrl: "https://twitter.com",
  },
  {
    id: "gf_011",
    type: "social",
    source: "producthunt",
    category: "new_launch",
    title: "Morgen AI: The calendar that plans your day",
    description: "Automatically schedules tasks, protects deep work time, and adjusts when plans change.",
    author: "Morgen Team",
    icon: "📅",
    timestamp: new Date(Date.now() - 36000000),
    likes: 1980,
    comments: 342,
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=500&h=300&fit=crop",
    actionUrl: "https://www.producthunt.com",
  },
  {
    id: "gf_012",
    type: "social",
    source: "reddit",
    category: "indie",
    title: "Launched my first product today — honest reflection",
    description: "4 months of building, the chaos of launch day, and what I'd do differently.",
    author: "r/EntrepreneurRideAlong",
    icon: "🌱",
    timestamp: new Date(Date.now() - 39600000),
    likes: 7230,
    comments: 1120,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop",
    actionUrl: "https://reddit.com/r/EntrepreneurRideAlong",
  },
]

const mockHistoryItems: HistoryItem[] = [
  { id: "hist_001", action: "Completed Task", description: "Completed 'Learn Python Basics' task", timestamp: new Date(Date.now() - 3600000), category: "goal" },
  { id: "hist_002", action: "Chat Session", description: "Discussed productivity techniques with Aura", timestamp: new Date(Date.now() - 5400000), category: "chat" },
  { id: "hist_003", action: "Goal Created", description: "Created new goal: Build Side Project", timestamp: new Date(Date.now() - 7200000), category: "goal" },
  { id: "hist_004", action: "Streak Updated", description: "Fitness streak increased to 15 days", timestamp: new Date(Date.now() - 86400000), category: "activity" },
  { id: "hist_005", action: "Settings Updated", description: "Changed theme to Midnight Glass", timestamp: new Date(Date.now() - 172800000), category: "system" },
]

const mockSettings: Settings = {
  theme: "night",
  notifications: true,
  emailUpdates: true,
  privateMode: false,
  language: "en",
  timezone: "UTC",
}

// ============================================
// API Functions
// ============================================

export const api = {
  user: {
    getProfile: async (): Promise<User> => new Promise((res) => setTimeout(() => res(mockUser), 300)),
    updateProfile: async (updates: Partial<User>): Promise<User> => new Promise((res) => setTimeout(() => res({ ...mockUser, ...updates }), 500)),
  },

  chat: {
    getMessages: async (): Promise<ChatMessage[]> => new Promise((res) => setTimeout(() => res(mockChatMessages), 300)),
    sendMessage: async (content: string): Promise<ChatMessage> => new Promise((res) => {
      setTimeout(() => res({ id: `msg_${Date.now()}`, role: "user", content, timestamp: new Date() }), 300)
    }),
    getAIResponse: async (_message: string): Promise<string> => {
      const responses = ["Hey Am Aura how can i help you today"]
      return new Promise((res) => setTimeout(() => res(responses[Math.floor(Math.random() * responses.length)]), 800))
    },
  },

  goals: {
    getAll: async (): Promise<Goal[]> => new Promise((res) => setTimeout(() => res(mockGoals), 300)),
    getById: async (id: string): Promise<Goal | null> => new Promise((res) => setTimeout(() => res(mockGoals.find((g) => g.id === id) || null), 300)),
    create: async (goal: Omit<Goal, "id">): Promise<Goal> => new Promise((res) => setTimeout(() => res({ ...goal, id: `goal_${Date.now()}` }), 500)),
    update: async (id: string, updates: Partial<Goal>): Promise<Goal> => new Promise((res) => {
      const goal = mockGoals.find((g) => g.id === id)
      setTimeout(() => res({ ...goal!, ...updates }), 500)
    }),
    delete: async (_id: string): Promise<boolean> => new Promise((res) => setTimeout(() => res(true), 500)),
  },

  feed: {
    getItems: async (): Promise<FeedItem[]> => new Promise((res) => setTimeout(() => {
      res([...forYouFeedItems, ...goalFocusedFeedItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }, 300)),
    getForYou: async (): Promise<FeedItem[]> => new Promise((res) => setTimeout(() => {
      res([...forYouFeedItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }, 300)),
    getGoalFocused: async (): Promise<FeedItem[]> => new Promise((res) => setTimeout(() => {
      res([...goalFocusedFeedItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }, 300)),
    getByCategory: async (category: FeedCategory): Promise<FeedItem[]> => new Promise((res) => setTimeout(() => {
      const all = [...forYouFeedItems, ...goalFocusedFeedItems]
      const filtered = category === "all" ? all : all.filter((i) => i.category === category)
      res(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }, 300)),
    getBySource: async (source: FeedItem["source"]): Promise<FeedItem[]> => new Promise((res) => setTimeout(() => {
      res([...forYouFeedItems, ...goalFocusedFeedItems].filter((i) => i.source === source))
    }, 300)),
    getByType: async (type: FeedItem["type"]): Promise<FeedItem[]> => new Promise((res) => setTimeout(() => {
      res([...forYouFeedItems, ...goalFocusedFeedItems].filter((i) => i.type === type))
    }, 300)),
  },

  history: {
    getAll: async (): Promise<HistoryItem[]> => new Promise((res) => setTimeout(() => {
      res([...mockHistoryItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }, 300)),
    getByCategory: async (category: HistoryItem["category"]): Promise<HistoryItem[]> => new Promise((res) => setTimeout(() => {
      res(mockHistoryItems.filter((i) => i.category === category))
    }, 300)),
  },

  settings: {
    get: async (): Promise<Settings> => new Promise((res) => setTimeout(() => res(mockSettings), 300)),
    update: async (updates: Partial<Settings>): Promise<Settings> => new Promise((res) => setTimeout(() => res({ ...mockSettings, ...updates }), 500)),
  },
}