"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

// Mock 문제 데이터 - 책별로 다른 문제 세트
const MOCK_PROBLEMS_CSAPP = [
  {
    id: 1,
    question: "What is the primary function of the CPU in a computer system?",
    options: [
      "Store data permanently",
      "Execute instructions and perform calculations",
      "Display graphics on the screen",
      "Connect to the internet",
    ],
    correctAnswer: 1,
    explanation:
      "The CPU (Central Processing Unit) is responsible for executing instructions and performing calculations. It's often called the 'brain' of the computer.",
  },
  {
    id: 2,
    question: "Which memory hierarchy level is fastest but smallest?",
    options: ["Hard Disk", "RAM", "Cache (L1)", "Secondary Storage"],
    correctAnswer: 2,
    explanation:
      "L1 Cache is the fastest memory in the hierarchy but has the smallest capacity, typically only a few KB per core.",
  },
  {
    id: 3,
    question: "What is a virtual memory page fault?",
    options: [
      "A hardware malfunction in RAM",
      "When the CPU tries to access a page not in physical memory",
      "A programming syntax error",
      "Network connection failure",
    ],
    correctAnswer: 1,
    explanation:
      "A page fault occurs when a program tries to access a page that is mapped in virtual memory but not loaded in physical RAM.",
  },
];

const MOCK_PROBLEMS_NETWORK = [
  {
    id: 1,
    question: "What does the term 'bandwidth' refer to in computer networks?",
    options: [
      "The physical width of a network cable",
      "The amount of data that can be transmitted per unit of time",
      "The number of computers in a network",
      "The distance between network nodes",
    ],
    correctAnswer: 1,
    explanation:
      "Bandwidth refers to the maximum rate of data transfer across a network path, typically measured in bits per second (bps).",
  },
  {
    id: 2,
    question:
      "Which protocol is responsible for reliable data transmission in TCP/IP?",
    options: [
      "IP (Internet Protocol)",
      "UDP (User Datagram Protocol)",
      "TCP (Transmission Control Protocol)",
      "HTTP (Hypertext Transfer Protocol)",
    ],
    correctAnswer: 2,
    explanation:
      "TCP provides reliable, ordered, and error-checked delivery of data between applications. UDP is faster but does not guarantee delivery.",
  },
  {
    id: 3,
    question: "What layer of the OSI model does a router operate at?",
    options: [
      "Physical Layer (Layer 1)",
      "Data Link Layer (Layer 2)",
      "Network Layer (Layer 3)",
      "Transport Layer (Layer 4)",
    ],
    correctAnswer: 2,
    explanation:
      "Routers operate at Layer 3 (Network Layer) where they make forwarding decisions based on IP addresses.",
  },
];

const MOCK_PROBLEMS_ALGORITHMS = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    correctAnswer: 1,
    explanation:
      "Binary search has O(log n) time complexity because it divides the search space in half with each iteration.",
  },
  {
    id: 2,
    question: "Which data structure uses LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctAnswer: 1,
    explanation:
      "Stack follows LIFO principle where the last element added is the first one to be removed. Queue uses FIFO (First In First Out).",
  },
  {
    id: 3,
    question: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
    correctAnswer: 2,
    explanation:
      "QuickSort has O(n^2) worst-case complexity when the pivot selection is poor (e.g., always picking the smallest or largest element). Average case is O(n log n).",
  },
];

const MOCK_PROBLEMS_PHYSICAL_CHEMISTRY = [
  {
    id: 1,
    question:
      "Which equation correctly relates the standard Gibbs energy change to the equilibrium constant K at temperature T?",
    options: [
      "ΔG° = −RT ln K",
      "ΔG° = RT ln K",
      "ΔG° = −kT ln K",
      "ΔG° = −R ln K",
    ],
    correctAnswer: 0,
    explanation:
      "At constant T, the thermodynamic relation is ΔG° = −RT ln K. This connects spontaneity (ΔG°) to the position of equilibrium (K).",
  },
  {
    id: 2,
    question:
      "From a Clausius–Clapeyron plot of ln p vs 1/T, the straight-line slope is −4.00×10^3 K. What is the molar enthalpy of vaporization (ΔH_vap)?",
    options: [
      "8.31 kJ mol⁻¹",
      "33.3 kJ mol⁻¹",
      "48.1 kJ mol⁻¹",
      "3.33 kJ mol⁻¹",
    ],
    correctAnswer: 1,
    explanation:
      "For ln p vs 1/T, slope = −ΔH_vap/R. Thus ΔH_vap = (4.00×10^3 K)×(8.314 J mol⁻¹ K⁻¹) ≈ 3.33×10^4 J mol⁻¹ = 33.3 kJ mol⁻¹.",
  },
  {
    id: 3,
    question:
      "For a particle of mass m confined to a 1D box of length L with infinite walls, which expression gives the allowed energy levels?",
    options: [
      "E_n = n^2 h^2 / (8mL^2)",
      "E_n = n h^2 / (8mL^2)",
      "E_n = n^2 h / (8mL)",
      "E_n = n^2 h^2 / (2mL^2)",
    ],
    correctAnswer: 0,
    explanation:
      "Quantum mechanics for the 1D infinite potential well gives E_n = n^2 h^2 / (8mL^2) with n = 1, 2, 3, … .",
  },
];

const MOCK_PROBLEMS_ORGANIC_CHEMISTRY = [
  {
    id: 1,
    question:
      "In an SN1 reaction of tert-butyl chloride in ethanol at room temperature, which kinetic rate law applies?",
    options: [
      "rate = k[tert-butyl chloride]",
      "rate = k[tert-butyl chloride][ethanol]",
      "rate = k[ethanol]",
      "rate = k[tert-butyl chloride]^2",
    ],
    correctAnswer: 0,
    explanation:
      "SN1 reactions are first-order overall because the rate-determining step is unimolecular formation of the carbocation. The nucleophile/solvent concentration does not appear in the rate law.",
  },
  {
    id: 2,
    question:
      "Which reagent converts a primary alcohol (R–CH2OH) to an aldehyde (R–CHO) without over-oxidation to the carboxylic acid?",
    options: [
      "KMnO4 (hot, basic)",
      "PCC (pyridinium chlorochromate) in CH2Cl2",
      "Jones reagent (CrO3/H2SO4, acetone)",
      "NaBH4, MeOH",
    ],
    correctAnswer: 1,
    explanation:
      "PCC is a mild, anhydrous chromium(VI) oxidant that stops at the aldehyde for primary alcohols. KMnO4 and Jones typically over-oxidize to acids; NaBH4 is a reducing agent, not an oxidant.",
  },
  {
    id: 3,
    question:
      "Which of the following species is aromatic under standard conditions?",
    options: [
      "Cyclobutadiene (C4H4)",
      "Cyclopentadienyl anion (C5H5⁻)",
      "Cyclopentadienyl cation (C5H5⁺)",
      "Cyclooctatetraene (C8H8)",
    ],
    correctAnswer: 1,
    explanation:
      "The cyclopentadienyl anion is planar, fully conjugated, and has 6 π electrons (Hückel 4n+2 with n=1), so it is aromatic. Cyclobutadiene (4 π) and the cation (4 π) are antiaromatic; cyclooctatetraene adopts a nonplanar ‘tub’ and is nonaromatic.",
  },
];

const MOCK_PROBLEMS_OSTEP = [
  {
    id: 1,
    question:
      "After a successful fork(), what does exec() do when called by the child?",
    options: [
      "Replaces the child’s address space with a new program while keeping the same PID (file descriptors remain unless marked close-on-exec).",
      "Creates a new child process to run the specified program and returns twice.",
      "Duplicates the parent’s address space again, creating a grandchild.",
      "Terminates the parent and lets the child continue with the new program.",
    ],
    correctAnswer: 0,
    explanation:
      "exec() loads a new program into the calling process, replacing its code, data, and stack. The PID is unchanged; open descriptors persist unless O_CLOEXEC is set. Typical pattern: parent calls fork(); child calls exec(); parent wait()s.",
  },
  {
    id: 2,
    question:
      "Which page-replacement algorithm can exhibit Belady’s anomaly (more frames ⇒ more page faults for some reference strings)?",
    options: ["FIFO", "LRU", "OPT (Belady’s optimal)", "CLOCK (second chance)"],
    correctAnswer: 0,
    explanation:
      "FIFO is a non-stack algorithm and can show Belady’s anomaly. LRU and OPT are stack algorithms and do not; CLOCK approximates LRU and also avoids the anomaly in practice.",
  },
  {
    id: 3,
    question:
      "In the classic MLFQ (Multi-Level Feedback Queue) scheduler described in OSTEP, what happens to a job that uses its entire time slice on a given queue?",
    options: [
      "It is demoted to a lower-priority queue.",
      "It is promoted to a higher-priority queue.",
      "It remains in the same queue with a longer time slice.",
      "It is blocked until all I/O-bound jobs finish.",
    ],
    correctAnswer: 0,
    explanation:
      "MLFQ rewards interactive jobs: if a job uses the whole slice (CPU-bound behavior), it is demoted; if it yields before the slice expires (I/O/interactive), it tends to stay or be promoted.",
  },
];

// 책 이름으로 문제 세트 매핑
const PROBLEM_SETS: Record<string, typeof MOCK_PROBLEMS_CSAPP> = {
  "Computer Systems A Programmer's Perspective": MOCK_PROBLEMS_CSAPP,
  "Computer Networks": MOCK_PROBLEMS_NETWORK,
  "Algorithms": MOCK_PROBLEMS_ALGORITHMS,
  "Physical Chemistry": MOCK_PROBLEMS_PHYSICAL_CHEMISTRY,
  "organic chem": MOCK_PROBLEMS_ORGANIC_CHEMISTRY,
  "Operating Systems - Three Easy Pieces": MOCK_PROBLEMS_OSTEP,
  // 기본값
  default: MOCK_PROBLEMS_CSAPP,
};

interface ProblemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle?: string; // 책 제목 추가
}

export function ProblemModal({
  open,
  onOpenChange,
  bookTitle,
}: ProblemModalProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 책 제목에 따라 문제 세트 선택
  const getProblems = () => {
    if (!bookTitle) return PROBLEM_SETS["default"];

    // 책 제목에 키워드가 포함되어 있으면 해당 문제 세트 반환
    for (const [key, problems] of Object.entries(PROBLEM_SETS)) {
      if (bookTitle.toLowerCase().includes(key.toLowerCase())) {
        return problems;
      }
    }

    return PROBLEM_SETS["default"];
  };

  const currentProblems = getProblems();
  const currentProblem = currentProblems[currentProblemIndex];
  const isCorrect = selectedAnswer === currentProblem.correctAnswer;

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < currentProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // 마지막 문제면 모달 닫기
      onOpenChange(false);
      // 상태 초기화
      setTimeout(() => {
        setCurrentProblemIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
      }, 300);
    }
  };

  const handleReset = () => {
    setCurrentProblemIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Practice Problem {currentProblemIndex + 1} /{" "}
            {currentProblems.length}
          </DialogTitle>
          <DialogDescription>
            {bookTitle
              ? `Test your understanding of ${bookTitle}`
              : "Test your understanding of the material"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 문제 */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {currentProblem.question}
            </h3>

            {/* 선택지 */}
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value: string) =>
                setSelectedAnswer(parseInt(value))
              }
              disabled={showResult}
            >
              {currentProblem.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    showResult
                      ? index === currentProblem.correctAnswer
                        ? "border-green-500 bg-green-50"
                        : index === selectedAnswer && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : "border-border"
                      : selectedAnswer === index
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                  {showResult && index === currentProblem.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && index === selectedAnswer && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </Card>

          {/* 결과 및 설명 */}
          {showResult && (
            <Card
              className={`p-4 ${
                isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mt-1" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-semibold mb-2 ${
                      isCorrect ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {currentProblem.explanation}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 버튼 */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>

            <div className="flex gap-2">
              {!showResult ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentProblemIndex < currentProblems.length - 1
                    ? "Next Problem"
                    : "Finish"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
