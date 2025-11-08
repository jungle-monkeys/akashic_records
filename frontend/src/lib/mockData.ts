import { Textbook } from "@/types/Textbook";

// Mock textbook database
export const mockTextbooks: Textbook[] = [
  {
    id: "1",
    title: "Learning Web Development with React and TypeScript",
    author: "John Smith",
    description: "A comprehensive guide to modern web development using React and TypeScript. Learn best practices and build real-world applications.",
    pdfUrl: "/testpdf.pdf",
    language: "English",
    level: "Intermediate",
    subject: "Web Development",
    tags: ["React", "TypeScript", "JavaScript", "Frontend", "Web"],
    rating: 4.5,
    reviewCount: 123,
    initialPage: 1,
    highlights: [],
  },
  {
    id: "2",
    title: "Introduction to Machine Learning",
    author: "Jane Doe",
    description: "Start your journey into machine learning with practical examples and clear explanations. Perfect for beginners.",
    pdfUrl: "/ttttt.pdf",
    language: "English",
    level: "Beginner",
    subject: "Machine Learning",
    tags: ["AI", "ML", "Python", "Data Science", "Deep Learning"],
    rating: 4.7,
    reviewCount: 256,
    initialPage: 1,
    highlights: [],
  },
  {
    id: "3",
    title: "Advanced Python Programming",
    author: "Robert Johnson",
    description: "Master advanced Python concepts including decorators, generators, context managers, and more.",
    pdfUrl: "/ttttt.pdf",
    language: "English",
    level: "Advanced",
    subject: "Programming",
    tags: ["Python", "Programming", "Advanced", "Software Engineering"],
    rating: 4.3,
    reviewCount: 89,
    initialPage: 1,
    highlights: [],
  },
  {
    id: "4",
    title: "Full Stack Web Development Bootcamp",
    author: "Sarah Williams",
    description: "Learn to build complete web applications from frontend to backend, including databases and deployment.",
    pdfUrl: "/ttttt.pdf",
    language: "English",
    level: "Intermediate",
    subject: "Web Development",
    tags: ["Full Stack", "Node.js", "React", "MongoDB", "Express"],
    rating: 4.6,
    reviewCount: 345,
    initialPage: 14,
    highlights: [
      {
        page: 15,
        x: 100,
        y: 200,
        width: 300,
        height: 50,

      }
    ],
  },
  {
    id: "5",
    title: "Data Structures and Algorithms in JavaScript",
    author: "Michael Brown",
    description: "Essential data structures and algorithms explained with JavaScript examples. Prepare for technical interviews.",
    pdfUrl: "/testpdf.pdf",
    language: "English",
    level: "Intermediate",
    subject: "Computer Science",
    tags: ["Algorithms", "Data Structures", "JavaScript", "Interview Prep"],
    rating: 4.8,
    reviewCount: 512,
    initialPage: 21,
    highlights: [
      {
        page: 20,
        x: 200,
        y: 300,
        width: 100,
        height: 100,

      }
    ],
  },
  {
    id: "6",
    title: "Deep Learning with PyTorch",
    author: "Emily Chen",
    description: "Build neural networks and deep learning models using PyTorch. Includes computer vision and NLP projects.",
    pdfUrl: "/ttttt.pdf",
    language: "English",
    level: "Advanced",
    subject: "Machine Learning",
    tags: ["Deep Learning", "PyTorch", "Neural Networks", "AI", "Python"],
    rating: 4.4,
    reviewCount: 178,
    initialPage: 1,
    highlights: [],
  },
  {
    id: "7",
    title: "JavaScript: The Complete Guide",
    author: "David Lee",
    description: "From basics to advanced concepts, master JavaScript with this comprehensive guide. Includes ES6+ features.",
    pdfUrl: "/ttttt.pdf",
    language: "English",
    level: "Beginner",
    subject: "Programming",
    tags: ["JavaScript", "ES6", "Web Development", "Programming Basics"],
    rating: 4.6,
    reviewCount: 678,
    initialPage: 1,
    highlights: [],
  },
  {
    id: "8",
    title: "Building RESTful APIs with Node.js",
    author: "Lisa Anderson",
    description: "Learn to design and implement scalable RESTful APIs using Node.js, Express, and MongoDB.",
    pdfUrl: "/ttttt.pdf",
    language: "English",
    level: "Intermediate",
    subject: "Backend Development",
    tags: ["API", "Node.js", "Express", "REST", "Backend"],
    rating: 4.5,
    reviewCount: 234,
    initialPage: 1,
    highlights: [],
  },
];

// Simple keyword matching function
export function searchTextbooks(keywords: string[]): Textbook[] {
  if (keywords.length === 0) return [];

  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  return mockTextbooks.filter((book) => {
    const searchableText = `
      ${book.title}
      ${book.description}
      ${book.subject}
      ${book.tags.join(" ")}
    `.toLowerCase();

    return lowerKeywords.some((keyword) => searchableText.includes(keyword));
  });
}
