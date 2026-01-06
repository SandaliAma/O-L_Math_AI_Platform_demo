import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mathAPI } from "../../apis/generate_quiz"; // Import the API we created
import { useTranslation } from "../../hooks/useTranslation";

const MathQuizTaking = ({ user }) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [timeSpent, setTimeSpent] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSolution, setShowSolution] = useState({});
  
  // Generation options
  const [topic, setTopic] = useState("වාරික ගණනය");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(3);
  const [topics, setTopics] = useState([]);
  
  // Refs
  const questionStartTime = useRef(null);
  const mathContainerRef = useRef(null);
  const inputRefs = useRef({});

  // Fetch available topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showLanguageDropdown &&
        !event.target.closest(". language-dropdown-container")
      ) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLanguageDropdown]);

  // Track time when question changes
  useEffect(() => {
    if (quiz && quiz. questions && quiz.questions. length > 0) {
      questionStartTime.current = Date.now();
    }
  }, [currentQuestion, quiz]);

  const fetchTopics = async () => {
    try {
      const response = await mathAPI.getTopics();
      setTopics(response.topics || []);
    } catch (err) {
      console.error("Error fetching topics:", err);
      // Use default topics
      setTopics([
        { sinhala: "වාරික ගණනය", english: "Installments" },
        { sinhala: "සරල පොලිය", english: "Simple Interest" },
        { sinhala:  "ලාභ හානි", english: "Profit & Loss" },
      ]);
    }
  };

  const generateQuiz = async () => {
    setGenerating(true);
    setError("");
    
    try {
      const response = await mathAPI.generateQuestions({
        topic,
        difficulty,
        numQuestions,
      });

      if (response. success) {
        // Parse questions and create answer structure
        const parsedQuestions = response.questions.map((q) => ({
          ... q,
          steps: parseSteps(q. solution),
        }));

        setQuiz({
          ... response,
          questions: parsedQuestions,
        });

        // Initialize answers array with empty step answers
        const initialAnswers = parsedQuestions.map((q) => ({
          stepAnswers: q.steps.map(() => ""),
          finalAnswer: "",
          timeSpent: 0,
        }));
        setAnswers(initialAnswers);
        setCurrentQuestion(0);
        setMarkedQuestions(new Set());
        setTimeSpent({});
        setShowSolution({});
        questionStartTime.current = Date.now();
      } else {
        setError("Failed to generate questions");
      }
    } catch (err) {
      console. error("Error generating quiz:", err);
      setError(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  // Parse solution string into steps
  const parseSteps = (solution) => {
    if (!solution) return [];
    
    const lines = solution.split("\n").filter((line) => line.trim());
    const steps = [];
    let currentStep = null;

    for (const line of lines) {
      // Check if this is a step header (පියවර)
      if (line.includes("පියවර") || line.match(/^step\s*\d+/i)) {
        if (currentStep) {
          steps.push(currentStep);
        }
        currentStep = {
          header: line. trim(),
          description: "",
          calculation: "",
          answer: "",
        };
      } else if (currentStep) {
        // Check if line contains calculation with equals sign
        if (line.includes("=")) {
          const parts = line.split("=");
          if (parts.length >= 2) {
            currentStep.description = parts[0]. trim();
            currentStep.answer = parts. slice(1).join("=").trim();
            currentStep.calculation = line.trim();
          }
        } else {
          // Add to description
          currentStep. description += (currentStep.description ?  " " : "") + line.trim();
        }
      }
    }

    if (currentStep) {
      steps. push(currentStep);
    }

    return steps;
  };

  // Handle input change for a step
  const handleStepInputChange = (stepIndex, value) => {
    const newAnswers = [... answers];
    if (newAnswers[currentQuestion]) {
      newAnswers[currentQuestion]. stepAnswers[stepIndex] = value;
      setAnswers(newAnswers);
    }
  };

  // Handle final answer change
  const handleFinalAnswerChange = (value) => {
    const newAnswers = [...answers];
    if (newAnswers[currentQuestion]) {
      newAnswers[currentQuestion].finalAnswer = value;
      setAnswers(newAnswers);
    }
  };

  // Insert mathematical notation at cursor position
  const insertNotation = (stepIndex, notation) => {
    const inputKey = `step-${currentQuestion}-${stepIndex}`;
    const input = inputRefs. current[inputKey];
    
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const currentValue = answers[currentQuestion]?.stepAnswers[stepIndex] || "";
      const newValue = currentValue. substring(0, start) + notation + currentValue.substring(end);
      
      handleStepInputChange(stepIndex, newValue);
      
      // Set cursor position after inserted notation
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + notation.length, start + notation.length);
      }, 0);
    }
  };

  // Insert notation for final answer
  const insertFinalNotation = (notation) => {
    const input = inputRefs. current["final-answer"];
    
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const currentValue = answers[currentQuestion]?. finalAnswer || "";
      const newValue = currentValue.substring(0, start) + notation + currentValue. substring(end);
      
      handleFinalAnswerChange(newValue);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + notation.length, start + notation.length);
      }, 0);
    }
  };

  const saveTimeForCurrentQuestion = () => {
    if (questionStartTime.current && answers[currentQuestion]) {
      const time = Math.floor((Date. now() - questionStartTime.current) / 1000);
      const newAnswers = [...answers];
      newAnswers[currentQuestion].timeSpent += time;
      setAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      saveTimeForCurrentQuestion();
      setCurrentQuestion(currentQuestion + 1);
      questionStartTime.current = Date.now();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      saveTimeForCurrentQuestion();
      setCurrentQuestion(currentQuestion - 1);
      questionStartTime.current = Date.now();
    }
  };

  const handleMarkForReview = () => {
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked. add(currentQuestion);
    }
    setMarkedQuestions(newMarked);
    handleNext();
  };

  const handleClearAnswer = () => {
    if (quiz && answers[currentQuestion]) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = {
        stepAnswers: quiz.questions[currentQuestion].steps.map(() => ""),
        finalAnswer: "",
        timeSpent:  answers[currentQuestion].timeSpent,
      };
      setAnswers(newAnswers);
    }
  };

  const handleQuestionClick = (index) => {
    saveTimeForCurrentQuestion();
    setCurrentQuestion(index);
    questionStartTime.current = Date.now();
  };

  const toggleShowSolution = (questionIndex) => {
    setShowSolution((prev) => ({
      ...prev,
      [questionIndex]:  !prev[questionIndex],
    }));
  };

  const handleFinish = async () => {
    if (! window.confirm(t("quiz.areYouSure") || "Are you sure you want to finish?")) {
      return;
    }

    setSubmitting(true);
    saveTimeForCurrentQuestion();

    // Calculate results
    const results = answers.map((answer, idx) => {
      const question = quiz.questions[idx];
      return {
        question:  question.question,
        userStepAnswers: answer.stepAnswers,
        userFinalAnswer: answer.finalAnswer,
        correctAnswer: question.answer,
        solution: question.solution,
        timeSpent: answer.timeSpent,
      };
    });

    console.log("Quiz Results:", results);
    
    // For now, show all solutions
    const allSolutions = {};
    quiz.questions.forEach((_, idx) => {
      allSolutions[idx] = true;
    });
    setShowSolution(allSolutions);
    setSubmitting(false);

    // Navigate to results or show results modal
    // navigate("/quiz/results", { state: { results } });
  };

  // Get question status for navigation grid
  const getQuestionStatus = (index) => {
    if (index === currentQuestion) return "current";
    if (markedQuestions.has(index)) return "marked";
    
    const answer = answers[index];
    if (answer) {
      const hasStepAnswers = answer.stepAnswers.some((a) => a.trim() !== "");
      const hasFinalAnswer = answer.finalAnswer.trim() !== "";
      if (hasStepAnswers || hasFinalAnswer) return "answered";
    }
    return "unanswered";
  };

  // Mathematical notation buttons
  const mathNotations = [
    { symbol: "+", label: "+" },
    { symbol: "-", label:  "-" },
    { symbol: "×", label: "×" },
    { symbol: "÷", label: "÷" },
    { symbol: "%", label: "%" },
    { symbol: "=", label: "=" },
    { symbol: "(", label: "(" },
    { symbol: ")", label: ")" },
    { symbol: "රු.", label: "රු." },
    { symbol: ",", label: "," },
  ];

  // Render generation form if no quiz
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-md">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center space-x-4">
                <a href="/dashboard" className="hover:text-blue-200">Home</a>
                <span className="font-semibold">සිංහල ගණිත ප්‍රශ්න</span>
              </div>
            </div>
          </div>
        </header>

        {/* Generation Form */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              සිංහල ගණිත ප්‍රශ්න ජනකය
            </h1>
            <h2 className="text-lg text-gray-600 mb-6 text-center">
              Sinhala Math Question Generator
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  විෂය මාතෘකාව (Topic)
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus: ring-blue-500"
                  disabled={generating}
                >
                  {topics.map((t, idx) => (
                    <option key={idx} value={t.sinhala}>
                      {t.sinhala} ({t.english})
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  අපහසුතා මට්ටම (Difficulty)
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={generating}
                >
                  <option value="easy">පහසු (Easy)</option>
                  <option value="medium">මධ්‍යම (Medium)</option>
                  <option value="hard">අපහසු (Hard)</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ප්‍රශ්න ගණන (Number of Questions)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={generating}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQuiz}
                disabled={generating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors"
              >
                {generating ?  (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating... 
                  </span>
                ) : (
                  "ප්‍රශ්න ජනනය කරන්න (Generate Questions)"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const answeredCount = answers.filter(
    (a) => a && (a.stepAnswers. some((s) => s.trim()) || a.finalAnswer.trim())
  ).length;
  const markedCount = markedQuestions.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto">
              <a href="/dashboard" className="hover:text-blue-200 whitespace-nowrap">
                Home
              </a>
              <span className="font-semibold whitespace-nowrap">
                {quiz.topic} - {quiz.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <div className="relative language-dropdown-container">
                <button
                  onClick={() => setShowLanguageDropdown(! showLanguageDropdown)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm flex items-center"
                >
                  {currentLanguage === "en" ? "English" : "සිංහල"} ▾
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                    <button
                      onClick={() => {
                        changeLanguage("en");
                        setShowLanguageDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        changeLanguage("si");
                        setShowLanguageDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    >
                      සිංහල
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row max-w-full">
        {/* Left Content Area */}
        <div className="flex-1 bg-white p-4 sm:p-6 lg:p-8">
          {/* Question Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              ප්‍රශ්නය {currentQuestion + 1} / {quiz. questions.length}
            </h2>
            <span className="text-sm text-gray-500">
              {quiz.mock_mode && "(Mock Mode)"}
            </span>
          </div>

          {/* Question Text */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div ref={mathContainerRef} className="text-lg text-gray-800 leading-relaxed">
              {question.question}
            </div>
          </div>

          {/* Step-by-Step Input Fields */}
          <div className="space-y-4 mb-6">
            <h3 className="text-md font-semibold text-gray-700">
              විසඳුම ලියන්න (Write your solution):
            </h3>

            {question.steps.map((step, stepIndex) => (
              <div key={stepIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Step Header */}
                <div className="text-sm font-medium text-blue-600 mb-2">
                  {step.header}
                </div>

                {/* Step Description and Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Description (left side of equals) */}
                  {step.description && (
                    <div className="text-gray-700 font-medium min-w-fit">
                      {step.description} =
                    </div>
                  )}

                  {/* Input Field */}
                  <div className="flex-1">
                    <input
                      ref={(el) => (inputRefs.current[`step-${currentQuestion}-${stepIndex}`] = el)}
                      type="text"
                      value={currentAnswer?. stepAnswers[stepIndex] || ""}
                      onChange={(e) => handleStepInputChange(stepIndex, e. target.value)}
                      placeholder="පිළිතුර ලියන්න..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      dir="auto"
                    />
                  </div>

                  {/* Math Notation Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {mathNotations.map((notation) => (
                      <button
                        key={notation.symbol}
                        type="button"
                        onClick={() => insertNotation(stepIndex, notation. symbol)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium transition-colors min-w-[32px]"
                        title={notation.label}
                      >
                        {notation.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show correct answer if solution is visible */}
                {showSolution[currentQuestion] && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded">
                    නිවැරදි පිළිතුර:  {step.answer}
                  </div>
                )}
              </div>
            ))}

            {/* Final Answer */}
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-400">
              <div className="text-md font-semibold text-gray-700 mb-2">
                අවසාන පිළිතුර (Final Answer):
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1">
                  <input
                    ref={(el) => (inputRefs.current["final-answer"] = el)}
                    type="text"
                    value={currentAnswer?.finalAnswer || ""}
                    onChange={(e) => handleFinalAnswerChange(e.target.value)}
                    placeholder="අවසාන පිළිතුර ලියන්න..."
                    className="w-full px-3 py-2 border-2 border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus: ring-yellow-500 focus:border-transparent text-lg font-medium"
                    dir="auto"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {mathNotations.map((notation) => (
                    <button
                      key={`final-${notation.symbol}`}
                      type="button"
                      onClick={() => insertFinalNotation(notation. symbol)}
                      className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-gray-700 rounded text-sm font-medium transition-colors min-w-[32px]"
                      title={notation.label}
                    >
                      {notation.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show correct final answer if solution is visible */}
              {showSolution[currentQuestion] && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                  නිවැරදි පිළිතුර: {question.answer}
                </div>
              )}
            </div>
          </div>

          {/* Show/Hide Solution Button */}
          <div className="mb-4">
            <button
              onClick={() => toggleShowSolution(currentQuestion)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              {showSolution[currentQuestion] ? "විසඳුම සඟවන්න (Hide Solution)" : "විසඳුම බලන්න (Show Solution)"}
            </button>
          </div>

          {/* Full Solution Display */}
          {showSolution[currentQuestion] && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-700 mb-2">සම්පූර්ණ විසඳුම: </h4>
              <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                {question.solution}
              </pre>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-green-600 hover: bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium text-sm"
            >
              ◀ පෙර ප්‍රශ්නය
            </button>
            <button
              onClick={handleMarkForReview}
              className="px-4 py-2 bg-blue-600 hover: bg-blue-700 text-white rounded font-medium text-sm"
            >
              සලකුණු කර ඊළඟට
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === quiz. questions.length - 1}
              className="px-4 py-2 bg-green-600 hover: bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium text-sm"
            >
              ඊළඟ ප්‍රශ්නය ▶
            </button>
            <button
              onClick={handleClearAnswer}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium text-sm"
            >
              පිළිතුරු මකන්න
            </button>
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded font-medium text-sm"
            >
              {submitting ? "Submitting..." : "අවසන් කරන්න"}
            </button>
            <button
              onClick={() => setQuiz(null)}
              className="px-4 py-2 bg-red-500 hover: bg-red-600 text-white rounded font-medium text-sm"
            >
              නව ප්‍රශ්න
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 bg-gray-100 p-4 sm:p-6 border-l border-gray-200">
          {/* Quiz Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              ප්‍රශ්නාවලිය තොරතුරු
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>මාතෘකාව: {quiz.topic}</div>
              <div>අපහසුතාව: {quiz.difficulty}</div>
              <div>ප්‍රශ්න ගණන: {quiz.count}</div>
              {quiz.generation_time_seconds && (
                <div>ජනනය කාලය: {quiz.generation_time_seconds}s</div>
              )}
            </div>
          </div>

          {/* Question Navigation Grid */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              ප්‍රශ්න සංචාලනය
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz. questions.map((_, index) => {
                const status = getQuestionStatus(index);
                const bgColor =
                  status === "current"
                    ? "bg-blue-600 text-white ring-2 ring-blue-800"
                    :  status === "marked"
                    ? "bg-purple-500 text-white"
                    : status === "answered"
                    ?  "bg-green-500 text-white"
                    : "bg-gray-400 text-white";

                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium hover:opacity-80 transition-all ${bgColor}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">සලකුණු</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                <span>වත්මන් ප්‍රශ්නය</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>පිළිතුරු දුන්</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span>සලකුණු කළ</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                <span>පිළිතුරු නොදුන්</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">සාරාංශය</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">පිළිතුරු දුන්:</span>
                <span className="font-medium">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">සලකුණු කළ:</span>
                <span className="font-medium">{markedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ඉතිරි: </span>
                <span className="font-medium">{quiz.questions.length - answeredCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-2 text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathQuizTaking;