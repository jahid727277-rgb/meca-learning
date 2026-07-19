import { Course, Review } from '../types';

export const CATEGORIES = [
  'All',
  'Prompt Engineering',
  'AI Agents',
  'AI Automation',
];

export const COURSES: Course[] = [
  {
    id: 'ai-101',
    title: 'Generative AI, LLMs & Prompt Engineering Foundations',
    description: 'Master the core mechanics of Large Language Models and learn to write production-grade prompts. Deep-dive into zero-shot learning, few-shot conditioning, and reasoning chains.',
    category: 'Prompt Engineering',
    level: 'Beginner',
    rating: 4.9,
    reviewCount: 342,
    duration: '10h 15m',
    lessonsCount: 5,
    price: 49.99,
    thumbnail: 'https://res.cloudinary.com/djjhol6dg/image/upload/v1784463289/1784463216153_jtoqbe.png',
    tags: ['Prompt Engineering', 'Generative AI', 'LLMs', 'Gemini'],
    instructor: {
      name: 'Abrar Chowdhury',
      role: 'AI Research Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Abrar is a lead machine learning researcher with a focus on advanced alignment techniques, prompt reasoning, and agentic workflows.',
    },
    syllabus: [
      {
        id: 'sec-1',
        title: 'Section 1: Large Language Models Mechanics',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome & Introduction to Generative AI',
            duration: '08:24',
            type: 'video',
            videoUrl: 'https://youtu.be/KuVckV0wF9w',
            content: 'Welcome to Meca Learning! In this introductory lesson, we will cover the foundational shift from traditional software development to Generative AI. You will learn about how Large Language Models work, the concept of tokens, and the significance of context windows.'
          },
          {
            id: 'les-2',
            title: 'How LLMs Process Context & Generate Tokens',
            duration: '15:40',
            type: 'video',
            videoUrl: 'https://youtu.be/KDjqbM6WxEQ',
            content: 'Learn how transformer-based models read inputs, represent tokens numerically, and predict subsequent tokens. We will explore key hyper-parameters such as Temperature, Top-K, and Top-P, and how they control creativity and determinism.'
          },
          {
            id: 'les-3',
            title: 'Quiz: Foundational LLM Architecture',
            duration: '10:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-1-1',
                question: 'Which parameter determines the random variability or creativity of generated text responses in an LLM?',
                options: [
                  'Top-K',
                  'Context Window',
                  'Temperature',
                  'Token Limit'
                ],
                correctAnswer: 2,
              },
              {
                id: 'q-1-2',
                question: 'What is a context window in LLMs?',
                options: [
                  'The window size of the visual browser interface.',
                  'The maximum number of tokens a model can accept and process in a single API call.',
                  'The physical monitor aspect ratio.',
                  'A software program to format prompt parameters.'
                ],
                correctAnswer: 1,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-2',
        title: 'Section 2: Professional Prompt Engineering Techniques',
        lessons: [
          {
            id: 'les-4',
            title: 'Reading: Zero-Shot, Few-Shot, and Chain-of-Thought',
            duration: '12m read',
            type: 'reading',
            content: `### Structured Prompt Engineering Techniques

To extract the highest quality responses from LLMs, engineers rely on structured reasoning frameworks within prompts.

#### Core Prompting Techniques:
1. **Zero-Shot Prompting**: Presenting a task to the model without any examples. Useful for straightforward classification or general writing.
2. **Few-Shot Prompting**: Injecting structured input-output pairs inside the prompt template. This helps guide style, format, and edge-case behaviors.
3. **Chain-of-Thought (CoT)**: Instructing the model to output its step-by-step reasoning before delivering the final answer. This dramatically reduces logical errors on math, logic, and reasoning tasks.
4. **System Instructions / System Prompts**: Global rules defined at the system level that direct the persona, boundaries, and safe modes of the model.`
          },
          {
            id: 'les-5',
            title: 'Implementing Structured Output Formats (JSON/XML)',
            duration: '12:15',
            type: 'video',
            videoUrl: 'https://youtu.be/_Vu7CyQgKxw',
            content: 'To connect language models with downstream APIs and web databases, we need structured outputs. Learn to force models to return valid, parsable JSON schemas reliably.'
          }
        ],
      }
    ]
  },
  {
    id: 'ai-202',
    title: 'Building Autonomous AI Agents & Multi-Agent Systems',
    description: 'Learn to design and deploy stateful, tool-enabled autonomous agents. Understand ReAct cycles, state charts, memory orchestration, and multi-agent systems.',
    category: 'AI Agents',
    level: 'Intermediate',
    rating: 4.8,
    reviewCount: 189,
    duration: '14h 30m',
    lessonsCount: 6,
    price: 79.99,
    thumbnail: 'https://res.cloudinary.com/djjhol6dg/image/upload/v1783557260/1000263343-clean_fuquye.png',
    tags: ['AI Agents', 'LangGraph', 'Autogen', 'Function Calling'],
    instructor: {
      name: 'Samia Rahman',
      role: 'Lead AI Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: 'Samia designs and deploys next-generation AI agent collectives for enterprise automation and context-aware systems.',
    },
    syllabus: [
      {
        id: 'sec-202-1',
        title: 'Section 1: Core Agentic Architectures',
        lessons: [
          {
            id: 'les-202-1',
            title: 'Understanding the ReAct (Reasoning & Acting) Loop',
            duration: '14:20',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            content: 'We break down the foundational cycle of AI agents: Thought, Action, Observation. Learn how models decide when to use a tool and how they adapt based on tool returns.'
          },
          {
            id: 'les-202-2',
            title: 'Reading: Function Calling & Tool Binding',
            duration: '15m read',
            type: 'reading',
            content: `### Function Calling & Real-world Tool Integration

An AI agent is only as powerful as the tools it can access. Modern APIs (like Gemini API) support native **Function Calling**, which bridges language understanding with actual computational action.

#### Key Stages of Function Calling:
1.  **Tool Definition**: Declaring your local system functions (e.g., \`searchDatabase\`, \`sendEmail\`) inside the model config using JSON Schema descriptions.
2.  **Model Intent Selection**: The user submits a prompt, and the model analyzes whether a custom function should be invoked. It outputs the function name and structured arguments.
3.  **Local Execution**: Your local backend server receives this JSON response, executes the matching function, and gets the real-world result (e.g., live weather data or database outputs).
4.  **Final Synthesis**: You send the function result back to the model, and it synthesizes a natural language answer for the user.`
          },
          {
            id: 'les-202-3',
            title: 'Quiz: Tool Integration and Function Binding',
            duration: '06:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-202-1',
                question: 'During a function calling cycle, does the model execute the actual system code directly on your local servers?',
                options: [
                  'Yes, it compiles and runs your code in a remote sandbox.',
                  'No, the model only decides which function to call and with what parameters. Your own application code must execute the function.',
                  'Yes, if the model has terminal permissions.',
                  'No, function calling is only a theoretical pattern.'
                ],
                correctAnswer: 1,
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ai-303',
    title: 'AI Automation Programming & Workflow Orchestration',
    description: 'Connect AI to APIs and trigger workflows automatically. Build robust background microservices, self-healing automations, and document processors.',
    category: 'AI Automation',
    level: 'Advanced',
    rating: 4.9,
    reviewCount: 521,
    duration: '18h 45m',
    lessonsCount: 6,
    price: 99.99,
    thumbnail: 'https://res.cloudinary.com/djjhol6dg/image/upload/v1783557260/1000263336-clean_nzjfqt.png',
    tags: ['Automation', 'APIs', 'Node.js', 'Workflows', 'n8n'],
    instructor: {
      name: 'Dr. Sarah Jenkins',
      role: 'Automation System Specialist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Dr. Jenkins focuses on self-healing workflow orchestrations, asynchronous triggers, and API proxy routing for distributed agents.',
    },
    syllabus: [
      {
        id: 'sec-ai-1',
        title: 'Section 1: Automated Workflows & API Pipelines',
        lessons: [
          {
            id: 'les-ai-1',
            title: 'Foundations of Autonomous Document Pipelines',
            duration: '15:30',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            content: 'Explore how to parse files, incoming emails, and Slack triggers. We set up Webhooks, configure asynchronous event queues, and write Node.js controllers to feed context into LLMs.'
          },
          {
            id: 'les-ai-2',
            title: 'Reading: Designing Self-Healing Automated Workflows',
            duration: '12m read',
            type: 'reading',
            content: `### Designing Self-Healing AI Workflows

Automation pipelines are prone to unpredictable changes, API failures, or rate-limits. Introducing AI into automation requires specific resilience strategies.

#### Key Strategies:
1. **Fallback Chains**: Automatically falling back to alternative lightweight models if the primary model encounters rate-limits.
2. **JSON Verification Loops**: When an automation relies on JSON schema output, write validation scripts that run automatically. If validation fails, feed the error back to the model to correct its output.
3. **Structured Backoff**: Retrying API calls with exponential backoff on HTTP 429 (Too Many Requests).`
          },
          {
            id: 'les-ai-3',
            title: 'Quiz: Automation Resiliency',
            duration: '08:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-ai-1',
                question: 'What is the best way to handle a JSON parsing failure in an automated web webhook pipeline?',
                options: [
                  'Crash the entire server.',
                  'Silently ignore the error.',
                  'Capture the validation error, pass it back to the LLM with instructions to correct it, and rerun the prediction.',
                  'Manually edit the JSON file every time.'
                ],
                correctAnswer: 2,
              }
            ]
          }
        ]
      }
    ]
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Tanvir Hossain',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    comment: 'The Prompt Engineering course is excellent. The examples of zero-shot vs few-shot and XML tagging are directly applicable to my job. Outstanding material!',
    date: 'June 24, 2026'
  },
  {
    id: 'r2',
    userName: 'Sumaiya Akter',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    comment: 'The Autonomous AI Agents course is mind-blowing! Writing custom tool-binds and seeing the model reason state changes has given me a huge edge.',
    date: 'May 12, 2026'
  },
  {
    id: 'r3',
    userName: 'Imran Khan',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    comment: 'Exceptional, hands-on automation lessons. I automated my client onboarding document flow in a single afternoon using the code patterns taught here.',
    date: 'July 01, 2026'
  }
];
