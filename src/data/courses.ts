import { Course, Review } from '../types';

export const CATEGORIES = [
  'All',
  'Mechatronics',
  'Software Development',
  'Design & UI/UX',
  'Data Science & AI',
];

export const COURSES: Course[] = [
  {
    id: 'meca-101',
    title: 'Introduction to Mechatronics & Robotics',
    description: 'Master the fundamentals of combining mechanical systems, electronics, and microcontrollers to build autonomous robotic devices.',
    category: 'Mechatronics',
    level: 'Beginner',
    rating: 4.8,
    reviewCount: 342,
    duration: '14h 45m',
    lessonsCount: 8,
    price: 49.99,
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    tags: ['Robotics', 'Hardware', 'Arduino', 'Electronics'],
    instructor: {
      name: 'Dr. Sarah Jenkins',
      role: 'Associate Professor of Mechatronics',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Dr. Jenkins has over 15 years of research experience in autonomous robotics and micro-electromechanical systems (MEMS). She previously worked at NASA JPL.',
    },
    syllabus: [
      {
        id: 'sec-1',
        title: 'Section 1: Foundations & Hardware',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome & Course Overview',
            duration: '08:24',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            content: 'In this lesson, we introduce the concept of Mechatronics—the intersection of mechanical engineering, electronics, computer science, and control systems. We will review the course roadmap, project files, and the component kits needed for subsequent labs.'
          },
          {
            id: 'les-2',
            title: 'Microcontroller Basics: Arduino vs. Raspberry Pi',
            duration: '15:40',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            content: 'Choosing the right brain for your robot is critical. We discuss the key architecture, GPIO, power profiles, and practical use-cases of microcontroller units (like Arduino) versus single-board computers (like Raspberry Pi).'
          },
          {
            id: 'les-3',
            title: 'Quiz: Microcontroller Foundations',
            duration: '10:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-1-1',
                question: 'Which component is best suited for real-time sensor polling and immediate low-latency motor control?',
                options: [
                  'Single-Board Computer (e.g., Raspberry Pi 4)',
                  'Microcontroller Unit (e.g., Arduino Uno / ATmega328P)',
                  'GPU accelerator',
                  'Analog amplifier'
                ],
                correctAnswer: 1,
              },
              {
                id: 'q-1-2',
                question: 'What does GPIO stand for in microcontroller hardware?',
                options: [
                  'General Purpose Input Output',
                  'Graphical Processing Interface Object',
                  'Global Protocol Instruction Optimizer',
                  'Gear Pinion Oscillator'
                ],
                correctAnswer: 0,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-2',
        title: 'Section 2: Actuators & Sensors',
        lessons: [
          {
            id: 'les-4',
            title: 'Reading: Sensors and Transducers in Robotics',
            duration: '12m read',
            type: 'reading',
            content: `### Sensors and Transducers in Mechatronics

In any mechatronic system, sensors act as the sensory organs, gathering critical data from the physical environment. A **sensor** detects a physical quantity (like light, temperature, force, or distance) and converts it into a readable signal (often voltage).

#### Key Sensor Types:
1. **Ultrasonic Sensors (HC-SR04)**: Measures distance by emitting high-frequency sound waves and timing their reflection back.
2. **Inertial Measurement Units (IMUs)**: Employs accelerometers and gyroscopes to measure orientation, velocity, and gravitational forces.
3. **Infrared (IR) Sensors**: Frequently used for line-tracking and proximity detection.
4. **Rotary Encoders**: Attached to motors to measure shaft rotation angle and speed.

#### Transducers:
A transducer is a broader term for any device that converts energy from one form to another. All sensors are transducers, but actuators (which convert electrical signals to mechanical force) are also transducers!`
          },
          {
            id: 'les-5',
            title: 'DC Motors, Servos, and Steppers Explained',
            duration: '22:15',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            content: 'Learn how to move physical components. We cover DC motors for continuous high-speed movement, Servomotors for precise angle positioning, and Stepper motors for high-precision step-by-step translation.'
          },
          {
            id: 'les-6',
            title: 'Quiz: Motors and Sensors',
            duration: '08:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-1-3',
                question: 'Which type of motor is best suited for precision 3D printer axes where exact step angles are required without feedback sensors?',
                options: [
                  'Standard Brushed DC Motor',
                  'Servo Motor',
                  'Stepper Motor',
                  'Solenoid Actuator'
                ],
                correctAnswer: 2,
              }
            ]
          }
        ],
      },
      {
        id: 'sec-3',
        title: 'Section 3: Integration & Autonomous Control',
        lessons: [
          {
            id: 'les-7',
            title: 'Implementing PID Controllers',
            duration: '18:50',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            content: 'PID (Proportional, Integral, Derivative) feedback loops are the backbone of stable flight, motor speed regulation, and thermal controls. We break down the mathematics and write Arduino code to balance a ball on a plate.'
          },
          {
            id: 'les-8',
            title: 'Project Lab: Designing a Line-Following Autonomous Vehicle',
            duration: '25m read',
            type: 'reading',
            content: `### Capstone Project: Design a Line-Following Robot

This final lab guides you through integrating everything you have learned so far into a fully functional, self-steering line follower.

#### Hardware Checklist:
*   **Chassis**: 2-wheel drive robotic chassis with castor wheel
*   **Controller**: Arduino Nano or Uno
*   **Driver**: L298N Dual H-Bridge Motor Driver
*   **Sensor array**: 3x TCRT5000 Infrared reflective sensors
*   **Power**: 2x 18650 Li-ion batteries (7.4V total)

#### Implementation Steps:
1.  **Chassis Assembly**: Mount the DC motors and sensors. Ensure the IR sensors are positioned ~5mm above the floor.
2.  **Wiring**: Connect motor driver control pins to PWM-capable pins on your microcontroller. Wire the IR sensor analog/digital outputs to standard input pins.
3.  **The Algorithm**:
    *   If the middle sensor detects black (high reflectance/low reading): drive both motors forward.
    *   If the left sensor detects black: slow down the left motor and accelerate the right motor (steer left).
    *   If the right sensor detects black: slow down the right motor and accelerate the left motor (steer right).
4.  **PID Fine-tuning**: Introduce a simple PD (Proportional-Derivative) controller to smooth out jerky oscillations and increase top speed!`
          }
        ]
      }
    ]
  },
  {
    id: 'meca-202',
    title: 'Advanced Robotic Control Systems & Kinematics',
    description: 'Delve into the mathematics of robotic arms, inverse kinematics, trajectories, and robotic operating systems (ROS) for industrial control.',
    category: 'Mechatronics',
    level: 'Advanced',
    rating: 4.9,
    reviewCount: 189,
    duration: '18h 10m',
    lessonsCount: 6,
    price: 79.99,
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    tags: ['Kinematics', 'ROS', 'Industrial', 'Math'],
    instructor: {
      name: 'Dr. Sarah Jenkins',
      role: 'Associate Professor of Mechatronics',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Dr. Jenkins has over 15 years of research experience in autonomous robotics and micro-electromechanical systems (MEMS). She previously worked at NASA JPL.',
    },
    syllabus: [
      {
        id: 'sec-202-1',
        title: 'Section 1: Forward & Inverse Kinematics',
        lessons: [
          {
            id: 'les-202-1',
            title: 'Degrees of Freedom (DoF) and Joint Coordinates',
            duration: '14:20',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            content: 'We define revolute and prismatic joints, calculate the total degrees of freedom for planar and spatial manipulators, and set up coordinate frames for robotic links.'
          },
          {
            id: 'les-202-2',
            title: 'Reading: Denavit-Hartenberg (D-H) Parameters',
            duration: '15m read',
            type: 'reading',
            content: `### Denavit-Hartenberg (D-H) Convention

The D-H convention is the standard mathematical formula used to establish coordinate frames on links of robotic chains.

#### The Four Parameters:
1.  **Link Length ($a_i$)**: Distance along $x_i$ from the intersection of $x_i$ with $z_{i-1}$ to the origin of frame $i$.
2.  **Link Twist ($\\alpha_i$)**: Angle from $z_{i-1}$ to $z_i$ measured about $x_i$.
3.  **Link Offset ($d_i$)**: Distance along $z_{i-1}$ from the origin of frame $i-1$ to the intersection of $x_i$ with $z_{i-1}$.
4.  **Joint Angle ($\\theta_i$)**: Angle from $x_{i-1}$ to $x_i$ measured about $z_{i-1}$.

By setting up a homogenous transformation matrix for each link using these parameters, we can multiply them together to find the overall forward kinematics equation—mapping joint space to Cartesian space!`
          },
          {
            id: 'les-202-3',
            title: 'Quiz: DH Convention & DoF',
            duration: '06:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-202-1',
                question: 'How many degrees of freedom does a standard fully free rigid body have in 3D Cartesian space?',
                options: [
                  '3 DoF (translation only)',
                  '4 DoF',
                  '6 DoF (3 translation, 3 rotation)',
                  '8 DoF'
                ],
                correctAnswer: 2,
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'soft-101',
    title: 'Modern Fullstack Web Development with React',
    description: 'Build robust, responsive web applications from scratch. Covers state management, component architecture, APIs, and modern CSS frameworks.',
    category: 'Software Development',
    level: 'Intermediate',
    rating: 4.7,
    reviewCount: 1245,
    duration: '22h 30m',
    lessonsCount: 12,
    price: 59.99,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    tags: ['React', 'TypeScript', 'Tailwind', 'NodeJS'],
    instructor: {
      name: 'Marcus Sterling',
      role: 'Principal Engineer at DevGrid',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Marcus has spent a decade building massive scalable web apps for Fortune 500 tech companies. He loves teaching clean code and component reusability.',
    },
    syllabus: [
      {
        id: 'sec-soft-1',
        title: 'Section 1: Modern React & Hooks',
        lessons: [
          {
            id: 'les-soft-1',
            title: 'React Fundamentals & JSX Rendering',
            duration: '11:10',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            content: 'We review virtual DOM, component lifecycles, and how JSX compiled down to raw React elements. You will create your first simple counter and lists.'
          },
          {
            id: 'les-soft-2',
            title: 'Mastering useState and useEffect',
            duration: '21:05',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            content: 'Deep dive into state synchronization, state batches, and scheduling side effects. We outline the crucial rules of the dependency array to prevent infinite re-renders.'
          },
          {
            id: 'les-soft-3',
            title: 'Quiz: State and Effects',
            duration: '07:00',
            type: 'quiz',
            quiz: [
              {
                id: 'q-soft-1',
                question: 'What happens if you omit the dependency array in a useEffect hook?',
                options: [
                  'The effect runs only once when the component mounts.',
                  'The effect runs on every single render of the component.',
                  'The effect never runs.',
                  'The compiler throws a syntax error.'
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
    id: 'design-101',
    title: 'Mastering Design Systems & Tailwind CSS',
    description: 'Learn the principles of professional digital product design. Build customized typography systems, color scales, layouts, and reusable component libraries.',
    category: 'Design & UI/UX',
    level: 'Beginner',
    rating: 4.9,
    reviewCount: 412,
    duration: '10h 15m',
    lessonsCount: 5,
    price: 39.99,
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=800',
    tags: ['UI Design', 'Figma', 'Tailwind', 'Typography'],
    instructor: {
      name: 'Elena Rostova',
      role: 'Creative Director & UX Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: 'Elena is an award-winning interface designer who believes that typography is 95% of digital design. She has consulted for top fintech and consumer brands.',
    },
    syllabus: [
      {
        id: 'sec-des-1',
        title: 'Section 1: The Anatomy of a Design System',
        lessons: [
          {
            id: 'les-des-1',
            title: 'Typography Hierarchies and Grid Scales',
            duration: '12:45',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            content: 'Elena breaks down standard typographic scale ratios, tracking (letter-spacing), line-heights, and vertical rhythm. Discover how to create grids that breathe.'
          },
          {
            id: 'les-des-2',
            title: 'Designing with Tailwind: Custom Themes and Configurations',
            duration: '18:10',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            content: 'We show how to utilize Tailwind v4 themes, declare custom color variables, set up responsive prefixes, and extend utility boundaries elegantly without inline bloating.'
          },
          {
            id: 'les-des-3',
            title: 'Reading: Light Accents and Dark Balance',
            duration: '8m read',
            type: 'reading',
            content: `### Styling with White Backgrounds and Light Accents

High-end professional websites (like Stripe, Vercel, and modern SaaS providers) often prefer a **minimalist, high-contrast light layout**. This focuses attention purely on the content, typography, and beautiful data.

#### Key Principles:
1.  **Off-White Surfaces**: Absolute white (\`#ffffff\`) is excellent for cards, but using a very subtle off-white (like \`#f9fafb\` or \`#f8fafc\`) for the viewport background adds elegant depth and reduces eye strain.
2.  **Sophisticated Accents**: Use highly saturated accent colors (like our custom vibrant crimson or light red) *sparingly*. This means buttons, status badges, active borders, and highlight numbers should sport the color, while body text and margins should remain charcoal gray/neutral black.
3.  **Deliberate Shadows**: Use soft, diffused, translucent shadows (\`shadow-sm\` or custom \`rgba(0,0,0,0.03)\`) rather than harsh default dark borders to define cards and containers.`
          }
        ]
      }
    ]
  },
  {
    id: 'ai-303',
    title: 'Python for Artificial Intelligence & Neural Networks',
    description: 'Dive deep into supervised and unsupervised learning. Build, train, and optimize your own multi-layer neural networks from scratch using PyTorch.',
    category: 'Data Science & AI',
    level: 'Advanced',
    rating: 4.6,
    reviewCount: 928,
    duration: '20h 50m',
    lessonsCount: 15,
    price: 89.99,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    tags: ['Python', 'PyTorch', 'Neural Networks', 'Machine Learning'],
    instructor: {
      name: 'Marcus Sterling',
      role: 'Principal Engineer at DevGrid',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Marcus has spent a decade building massive scalable web apps for Fortune 500 tech companies. He loves teaching clean code and component reusability.',
    },
    syllabus: [
      {
        id: 'sec-ai-1',
        title: 'Section 1: Linear Regression & Gradient Descent',
        lessons: [
          {
            id: 'les-ai-1',
            title: 'Mathematical Foundations of Cost Functions',
            duration: '15:30',
            type: 'video',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            content: 'We explain the Mean Squared Error (MSE) cost function, partial derivatives, and how the learning rate controls step sizes down the error surface.'
          }
        ]
      }
    ]
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Alex Chen',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    comment: 'The Mechatronics course is incredible. The hands-on line follower lab actually worked perfectly on my hardware! Very clean explanations.',
    date: 'June 24, 2026'
  },
  {
    id: 'r2',
    userName: 'Jessica Kim',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    comment: 'Elena Rostova’s Design Systems module transformed the way I think about typography. Best explanation of responsive spacing I have ever seen.',
    date: 'May 12, 2026'
  },
  {
    id: 'r3',
    userName: 'David Miller',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    rating: 4,
    comment: 'Super high-quality video content and quizzes. The React state management section really cleared up my understanding of concurrent renders.',
    date: 'July 01, 2026'
  }
];
