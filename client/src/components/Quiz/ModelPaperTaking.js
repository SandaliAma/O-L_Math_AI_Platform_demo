import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";

// ==================== HARDCODED MODEL PAPER DATA ====================
const MODEL_PAPER_DATA = {
  title: "සාමාන්‍ය පෙළ ගණිතය - ආදර්ශ ප්‍රශ්න පත්‍රය 2024",
  titleEnglish: "O/L Mathematics - Model Paper 2024",
  duration: 180,
  totalMarks: 100,
  year: 2024,
  instructions: [
    "සියලුම ප්‍රශ්නවලට පිළිතුරු සපයන්න / Answer all questions",
    "සෑම පියවරක්ම පැහැදිලිව ලියන්න / Show all working steps",
    "අවසාන පිළිතුරු වලට ඒකක ඇතුළත් කරන්න / Include units in final answers",
    "කැල්කියුලේටර භාවිතය තහනම් / Calculator not allowed"
  ],
  sections: [
    // SECTION 1: INSTALLMENTS
    {
      id: "installments",
      name: "කොටස I - වාරික ගණනය",
      nameEnglish: "Section I - Installments",
      marks: 20,
      icon: "💰",
      color: "blue",
      questions: [
        {
          id: 1,
          question: "රු. 120,000 වටිනා ශීතකරණයක් මසකට රු. 11,000 බැගින් වාරික 12 කින් ගෙවීමට තීරණය කළේය.  මුළු ගෙවන මුදල, පොලිය සහ පොලී අනුපාතය ගණනය කරන්න.",
          marks: 10,
          difficulty: "medium",
          guidelines: {
            title: "වාරික ගණනය - මූලික සූත්‍ර",
            titleEnglish: "Installment Calculations - Basic Formulas",
            concept: "වාරික ක්‍රමයට භාණ්ඩ මිල දී ගැනීමේදී මුල් මිලට වඩා වැඩි මුදලක් ගෙවීමට සිදු වේ.",
            rules: [
              { rule: "මුළු ගෙවන මුදල = මාසික වාරිකය × වාරික ගණන", ruleEnglish: "Total Payment = Monthly Installment × Number of Installments", formula: "T = I × n" },
              { rule: "පොලිය = මුළු ගෙවන මුදල - මුල් මිල", ruleEnglish: "Interest = Total Payment - Cash Price", formula: "Interest = T - P" },
              { rule: "පොලී අනුපාතය = (පොලිය / මුල් මිල) × 100%", ruleEnglish: "Interest Rate = (Interest / Cash Price) × 100%", formula: "R = (I/P) × 100%" }
            ],
            tips: ["පළමුව මුළු ගෙවන මුදල ගණනය කරන්න", "පොලිය ගණනය කිරීමට මුල් මිල අඩු කරන්න", "ඒකක (රු., %) නිවැරදිව ලියන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description: "මුළු ගෙවන මුදල ගණනය කිරීම", calculation: "මුළු ගෙවන මුදල = මාසික වාරිකය × වාරික ගණන", working: "= රු. 11,000 × 12", answer: "= රු. 132,000" },
              { stepNumber: 2, description: "පොලිය ගණනය කිරීම", calculation: "පොලිය = මුළු ගෙවන මුදල - මුල් මිල", working: "= රු. 132,000 - රු. 120,000", answer: "= රු. 12,000" },
              { stepNumber: 3, description: "පොලී අනුපාතය ගණනය කිරීම", calculation: "පොලී අනුපාතය = (පොලිය / මුල් මිල) × 100%", working: "= (රු. 12,000 / රු. 120,000) × 100%", answer: "= 10%" }
            ],
            finalAnswer: "මුළු ගෙවන මුදල = රු. 132,000, පොලිය = රු. 12,000, පොලී අනුපාතය = 10%"
          },
          options: [
            { label: "A", value: "මුළු මුදල = රු. 132,000, පොලිය = රු. 12,000, අනුපාතය = 10%", isCorrect: true },
            { label: "B", value:  "මුළු මුදල = රු. 130,000, පොලිය = රු. 10,000, අනුපාතය = 8%", isCorrect: false },
            { label:  "C", value: "මුළු මුදල = රු. 132,000, පොලිය = රු. 12,000, අනුපාතය = 12%", isCorrect: false },
            { label: "D", value: "මුළු මුදල = රු. 134,000, පොලිය = රු.  14,000, අනුපාතය = 10%", isCorrect: false }
          ]
        },
        {
          id: 2,
          question:  "රු. 200,000 වටිනා මෝටර් සයිකලයක් සඳහා රු. 50,000 ක් මුලින් ගෙවා ඉතිරිය මාස 20 කින් වාරික ලෙස ගෙවනු ලැබේ. මුළු පොලිය රු. 18,000 නම් මාසික වාරිකය කොපමණද?",
          marks: 10,
          difficulty: "hard",
          guidelines: {
            title: "මූලික ගෙවීම් සහිත වාරික ගණනය",
            titleEnglish: "Installments with Down Payment",
            concept: "මූලික ගෙවීමක් ඇති විට, පොලිය ගණනය කරන්නේ ඉතිරි ණය මුදල මත පමණි.",
            rules: [
              { rule: "ණය මුදල = මුළු මිල - මූලික ගෙවීම", ruleEnglish:  "Loan Amount = Total Price - Down Payment", formula: "L = P - D" },
              { rule:  "මුළු වාරික ගෙවීම = ණය මුදල + පොලිය", ruleEnglish:  "Total Installment = Loan + Interest", formula: "T = L + I" },
              { rule:  "මාසික වාරිකය = මුළු වාරික ගෙවීම / වාරික ගණන", ruleEnglish:  "Monthly Installment = Total / Number of months", formula: "M = T / n" }
            ],
            tips: ["මූලික ගෙවීම අඩු කර ණය මුදල සොයන්න", "පොලිය එකතු කර මුළු වාරික ගෙවීම සොයන්න", "මාස ගණනින් බෙදන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description: "ණය මුදල ගණනය කිරීම", calculation: "ණය මුදල = මුළු මිල - මූලික ගෙවීම", working: "= රු. 200,000 - රු. 50,000", answer: "= රු. 150,000" },
              { stepNumber: 2, description: "මුළු වාරික ගෙවීම ගණනය කිරීම", calculation: "මුළු වාරික ගෙවීම = ණය මුදල + පොලිය", working: "= රු. 150,000 + රු. 18,000", answer: "= රු. 168,000" },
              { stepNumber: 3, description: "මාසික වාරිකය ගණනය කිරීම", calculation: "මාසික වාරිකය = මුළු වාරික ගෙවීම / වාරික ගණන", working: "= රු. 168,000 / 20", answer: "= රු. 8,400" }
            ],
            finalAnswer: "මාසික වාරිකය = රු. 8,400"
          },
          options: [
            { label:  "A", value: "රු. 8,400", isCorrect: true },
            { label: "B", value:  "රු. 8,000", isCorrect: false },
            { label: "C", value: "රු. 9,000", isCorrect: false },
            { label: "D", value: "රු. 7,500", isCorrect: false }
          ]
        }
      ]
    },

    // SECTION 2: SIMPLE INTEREST
    {
      id: "simple-interest",
      name: "කොටස II - සරල පොලිය",
      nameEnglish: "Section II - Simple Interest",
      marks: 20,
      icon: "🏦",
      color: "green",
      questions: [
        {
          id: 3,
          question: "රු. 75,000 ක මුදලක් වාර්ෂික 8% සරල පොලී අනුපාතයකට වසර 4 ක් සඳහා බැංකුවක තැන්පත් කළේය. පොලිය සහ මුළු මුදල ගණනය කරන්න.",
          marks: 10,
          difficulty: "easy",
          guidelines: {
            title: "සරල පොලිය - මූලික සූත්‍රය",
            titleEnglish: "Simple Interest - Basic Formula",
            concept: "සරල පොලිය යනු මූලධනය මත පමණක් ගණනය කරන පොලියයි.",
            rules: [
              { rule: "සරල පොලිය (I) = (මූලධනය × අනුපාතය × කාලය) / 100", ruleEnglish: "Simple Interest (I) = (P × R × T) / 100", formula: "I = PRT/100" },
              { rule:  "මුළු මුදල (A) = මූලධනය + පොලිය", ruleEnglish: "Amount (A) = Principal + Interest", formula: "A = P + I" }
            ],
            tips: ["කාලය වසර වලින් තිබිය යුතුය", "මාස දී ඇත්නම් 12 න් බෙදන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description:  "දත්ත හඳුනා ගැනීම", calculation: "P = රු. 75,000, R = 8%, T = 4 වසර", working: "", answer: "" },
              { stepNumber: 2, description: "සරල පොලිය ගණනය කිරීම", calculation: "I = (P × R × T) / 100", working: "= (රු. 75,000 × 8 × 4) / 100", answer: "= රු. 24,000" },
              { stepNumber: 3, description: "මුළු මුදල ගණනය කිරීම", calculation: "A = P + I", working:  "= රු. 75,000 + රු. 24,000", answer: "= රු. 99,000" }
            ],
            finalAnswer:  "පොලිය = රු. 24,000, මුළු මුදල = රු. 99,000"
          },
          options: [
            { label: "A", value: "පොලිය = රු. 24,000, මුළු මුදල = රු. 99,000", isCorrect: true },
            { label: "B", value: "පොලිය = රු. 20,000, මුළු මුදල = රු. 95,000", isCorrect: false },
            { label: "C", value: "පොලිය = රු. 28,000, මුළු මුදල = රු. 103,000", isCorrect: false },
            { label: "D", value: "පොලිය = රු. 22,000, මුළු මුදල = රු. 97,000", isCorrect: false }
          ]
        },
        {
          id: 4,
          question: "යම් මුදලක් වාර්ෂික 10% සරල පොලී අනුපාතයකට වසර 3 කින් රු. 91,000 දක්වා වැඩි විය. මූලධනය සොයන්න.",
          marks: 10,
          difficulty:  "medium",
          guidelines: {
            title: "මූලධනය සෙවීම",
            titleEnglish: "Finding Principal from Amount",
            concept: "මුළු මුදල දන්නා විට, සූත්‍රය ප්‍රතිසංවිධානය කර මූලධනය සොයා ගත හැ���.",
            rules: [
              { rule: "A = P(1 + RT/100) සූත්‍රයෙන්", ruleEnglish: "From A = P(1 + RT/100)", formula: "P = A / (1 + RT/100)" }
            ],
            tips: ["පළමුව (1 + RT/100) ගණනය කරන්න", "A එම අගයෙන් බෙදන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description:  "දත්ත හඳුනා ගැනීම", calculation: "A = රු. 91,000, R = 10%, T = 3 වසර", working: "", answer: "" },
              { stepNumber: 2, description: "සූත්‍රය යෙදීම", calculation: "A = P(1 + RT/100)", working: "91,000 = P(1 + 10×3/100) = P(1.3)", answer: "" },
              { stepNumber: 3, description: "P සඳහා විසඳීම", calculation: "P = A / 1.3", working: "= රු. 91,000 / 1.3", answer: "= රු. 70,000" }
            ],
            finalAnswer: "මූලධනය = රු. 70,000"
          },
          options: [
            { label: "A", value: "රු. 70,000", isCorrect: true },
            { label: "B", value: "රු. 65,000", isCorrect: false },
            { label: "C", value:  "රු. 75,000", isCorrect: false },
            { label: "D", value: "රු. 72,000", isCorrect: false }
          ]
        }
      ]
    },

    // SECTION 3: RATIOS
    {
      id:  "ratios",
      name:  "කොටස III - අනුපාත",
      nameEnglish:  "Section III - Ratios",
      marks: 20,
      icon: "⚖️",
      color:  "purple",
      questions: [
        {
          id: 5,
          question: "A සහ B අතර මුදල් බෙදා ගත්තේ 3:5 අනුපාතයෙනි. B ට A ට වඩා රු. 4,000 ක් වැඩි නම්, A ට ලැබුණු මුදල කොපමණද?",
          marks: 10,
          difficulty: "medium",
          guidelines: {
            title: "අනුපාත - වෙනස භාවිතා කර ගණනය",
            titleEnglish: "Ratios - Using Difference",
            concept: "අනුපාතවල වෙනස සහ සැබෑ වෙනස දන්නා විට, එක් කොටසක අගය සොයාගත හැක.",
            rules: [
              { rule: "අනුපාත වෙනස = B කොටස් - A කොටස්", ruleEnglish: "Ratio Difference = B parts - A parts", formula: "වෙනස = 5 - 3 = 2 කොටස්" },
              { rule: "එක් කොටසක අගය = සැබෑ වෙනස / අනුපාත වෙනස", ruleEnglish: "Value of one part = Actual difference / Ratio difference", formula: "1 කොටස = 4,000 / 2" },
              { rule: "A ගේ මුදල = A කොටස් × එක් කොටසක අගය", ruleEnglish: "A's amount = A's parts × Value per part", formula: "A = 3 × රු. 2,000" }
            ],
            tips: ["අනුපාතවල වෙනස ගණනය කරන්න", "එක් කොටසක අගය සොයන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description:  "අනුපාත වෙනස ගණනය කිරීම", calculation: "B කොටස් - A කොටස්", working: "= 5 - 3", answer: "= 2 කොටස්" },
              { stepNumber:  2, description: "එක් කොටසක අගය සෙවීම", calculation: "2 කොටස් = රු. 4,000", working: "1 කොටසක් = රු. 4,000 / 2", answer: "= රු. 2,000" },
              { stepNumber: 3, description: "A ගේ මුදල ගණනය කිරීම", calculation: "A = 3 කොටස් × රු. 2,000", working: "= 3 × රු. 2,000", answer: "= රු. 6,000" }
            ],
            finalAnswer: "A ට ලැබුණු මුදල = රු. 6,000"
          },
          options: [
            { label: "A", value: "රු. 6,000", isCorrect: true },
            { label: "B", value: "රු. 8,000", isCorrect: false },
            { label: "C", value: "රු. 5,000", isCorrect: false },
            { label: "D", value: "රු. 10,000", isCorrect: false }
          ]
        },
        {
          id: 6,
          question: "තුන් දෙනෙකු අතර මුදලක් 2:3:5 අනුපාතයෙන් බෙදා ගත්හ. මුළු මුදල රු. 50,000 නම්, එක් එක් අයට ලැබුණු මුදල් සොයන්න.",
          marks: 10,
          difficulty: "medium",
          guidelines: {
            title:  "අනුපාත - මුළු එක භාවිතා කර බෙදීම",
            titleEnglish: "Ratios - Division Using Total",
            concept: "මුළු මුදල සහ අනුපාතය දන්නා විට, මුළු කොටස් ගණන මගින් බෙදා එක් කොටසක අගය සොයාගත හැක.",
            rules: [
              { rule: "මුළු කොටස් = සියලු අනුපාත එකතුව", ruleEnglish: "Total parts = Sum of all ratios", formula: "මුළු කොටස් = 2 + 3 + 5 = 10" },
              { rule: "එක් කොටසක අගය = මුළු මුදල / මුළු කොටස්", ruleEnglish: "Value per part = Total / Total parts", formula: "1 කොටස = 50,000 / 10" }
            ],
            tips: ["පළමුව මුළු කොටස් ගණනය කරන්න", "සියලු මුදල් එකතු කර පරීක්ෂා කරන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description: "මුළු කොටස් ගණනය කිරීම", calculation: "මුළු කොටස් = 2 + 3 + 5", working: "", answer: "= 10 කොටස්" },
              { stepNumber:  2, description: "එක් කොටසක අගය සෙවීම", calculation: "1 කොටසක් = මුළු මුදල / මුළු කොටස්", working: "= රු. 50,000 / 10", answer: "= රු. 5,000" },
              { stepNumber: 3, description: "එක් එක් අයට ලැබුණු මුදල", calculation: "පළමු අය = 2 × රු. 5,000 = රු. 10,000", working: "දෙවන අය = 3 × රු. 5,000 = රු. 15,000", answer: "තුන්වන අය = 5 × රු. 5,000 = රු. 25,000" }
            ],
            finalAnswer:  "පළමු අය = රු. 10,000, දෙවන අය = රු. 15,000, තුන්වන අය = රු. 25,000"
          },
          options: [
            { label: "A", value: "රු. 10,000, රු. 15,000, රු. 25,000", isCorrect: true },
            { label: "B", value: "රු. 15,000, රු. 15,000, රු. 20,000", isCorrect: false },
            { label: "C", value: "රු. 8,000, රු. 12,000, රු. 30,000", isCorrect: false },
            { label: "D", value: "රු. 12,000, රු. 18,000, රු. 20,000", isCorrect: false }
          ]
        }
      ]
    },

    // SECTION 4: EQUATIONS
    {
      id: "equations",
      name: "කොටස IV - සමීකරණ",
      nameEnglish: "Section IV - Equations",
      marks: 20,
      icon: "🔢",
      color: "orange",
      questions: [
        {
          id: 7,
          question: "3x + 7 = 22 සමීකරණය විසඳා x හි අගය සොයන්න.",
          marks: 5,
          difficulty: "easy",
          guidelines: {
            title: "එක් විචල්‍යයක සරල සමීකරණ",
            titleEnglish: "Simple Linear Equations",
            concept: "සමීකරණයක් විසඳීමේදී, විචල්‍යය එක් පැත්තකට සහ නියතයන් අනෙක් පැත්තට ගෙන යන්න.",
            rules: [
              { rule: "සමීකරණයේ දෙපැත්තටම සමාන මෙහෙයුම් කළ හැක", ruleEnglish:  "Same operations can be applied to both sides", formula: "ax + b = c ⟹ x = (c-b)/a" }
            ],
            tips: ["නියත පද පළමුව අනෙක් පැත්තට ගෙන යන්න", "x හි සංගුණකයෙන් බෙදන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description: "නියත පදය අනෙක් පැත්තට ගෙනයාම", calculation: "3x + 7 = 22", working:  "3x = 22 - 7", answer: "3x = 15" },
              { stepNumber: 2, description: "x සඳහා විසඳීම", calculation: "x = 15 / 3", working: "", answer: "x = 5" }
            ],
            finalAnswer:  "x = 5"
          },
          options: [
            { label: "A", value:  "x = 5", isCorrect: true },
            { label: "B", value: "x = 6", isCorrect: false },
            { label: "C", value: "x = 4", isCorrect: false },
            { label: "D", value: "x = 7", isCorrect: false }
          ]
        },
        {
          id: 8,
          question: "2(x - 3) + 5 = 3x - 7 සමීකරණය විසඳන්න.",
          marks: 8,
          difficulty: "medium",
          guidelines: {
            title: "වරහන් සහිත සමීකරණ",
            titleEnglish: "Equations with Brackets",
            concept: "වරහන් සහිත සමීකරණ විසඳීමේදී පළමුව වරහන් විවෘත කළ යුතුය.",
            rules: [
              { rule: "පළමුව වරහන් විවෘත කරන්න", ruleEnglish:  "First expand the brackets", formula: "a(x + b) = ax + ab" },
              { rule: "x පද එකතු කරන්න", ruleEnglish: "Collect x terms", formula: "" }
            ],
            tips:  ["වරහන් විවෘත කිරීමේදී සෘණ ලකුණු ගැන සැලකිලිමත් වන්න"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description: "වරහන් විවෘත කිරීම", calculation: "2(x - 3) + 5 = 3x - 7", working: "2x - 6 + 5 = 3x - 7", answer: "2x - 1 = 3x - 7" },
              { stepNumber: 2, description: "x පද එකතු කිරීම", calculation: "2x - 3x = -7 + 1", working: "-x = -6", answer: "" },
              { stepNumber: 3, description: "x සඳහා විසඳීම", calculation: "x = 6", working: "", answer: "x = 6" }
            ],
            finalAnswer: "x = 6"
          },
          options: [
            { label: "A", value: "x = 6", isCorrect:  true },
            { label: "B", value: "x = 4", isCorrect: false },
            { label: "C", value: "x = -6", isCorrect: false },
            { label: "D", value: "x = 8", isCorrect: false }
          ]
        },
        {
          id: 9,
          question: "සංඛ්‍යා දෙකක එකතුව 45 කි.  එක් සංඛ්‍යාව අනෙකට වඩා 9 කින් වැඩි නම්, එම සංඛ්‍යා දෙක සොයන්න.",
          marks: 7,
          difficulty: "medium",
          guidelines: {
            title: "වචන ගැටලු - සමීකරණ සැකසීම",
            titleEnglish: "Word Problems - Setting Up Equations",
            concept: "වචන ගැටලුවක් විසඳීමට පළමුව නොදන්නා අගයන් සඳහා විචල්‍යයන් නියම කරන්න.",
            rules: [
              { rule: "කුඩා සංඛ්‍යාව x ලෙස ගන්න", ruleEnglish: "Let smaller number be x", formula: "" },
              { rule: "වැඩි සංඛ්‍යාව x + 9 වේ", ruleEnglish:  "Larger number = x + 9", formula: "" }
            ],
            tips:  ["නොදන්නා දෙයට විචල්‍යයක් යොදන්න"]
          },
          solution: {
            steps:  [
              { stepNumber: 1, description: "විචල්‍යයන් නියම කිරීම", calculation: "කුඩා සංඛ්‍යාව = x", working: "වැඩි සංඛ්‍යාව = x + 9", answer: "" },
              { stepNumber: 2, description: "සමීකරණය සැකසීම", calculation:  "x + (x + 9) = 45", working: "2x + 9 = 45", answer:  "2x = 36" },
              { stepNumber: 3, description: "සංඛ්‍යා සෙවීම", calculation: "x = 18", working: "කුඩා සංඛ්‍යාව = 18", answer: "වැඩි සංඛ්‍යාව = 27" }
            ],
            finalAnswer: "සංඛ්‍යා දෙක:  18 සහ 27"
          },
          options: [
            { label: "A", value: "18 සහ 27", isCorrect:  true },
            { label: "B", value: "20 සහ 25", isCorrect: false },
            { label:  "C", value: "15 සහ 30", isCorrect: false },
            { label: "D", value: "16 සහ 29", isCorrect: false }
          ]
        }
      ]
    },

    // SECTION 5: PROFIT & LOSS
    {
      id: "profit-loss",
      name: "කොටස V - ලාභ හානි",
      nameEnglish:  "Section V - Profit & Loss",
      marks: 20,
      icon: "📊",
      color: "red",
      questions: [
        {
          id: 10,
          question: "වෙළෙන්දෙකු රු. 4,500 කට මිල දී ගත් භාණ්ඩයක් 25% ලාභයක් ලැබෙන පරිදි විකුණා ඇත. විකුණුම් මිල කොපමණද?",
          marks: 8,
          difficulty: "easy",
          guidelines: {
            title: "ලාභ ගණනය",
            titleEnglish: "Profit Calculations",
            concept: "ලාභය යනු ව��කුණුම් මිල සහ මිල දී ගත් මිල අතර ධනාත්මක වෙනසයි.",
            rules: [
              { rule: "ලාභය = (ලාභ % / 100) × මිල දී ගත් මිල", ruleEnglish: "Profit = (Profit % / 100) × Cost Price", formula: "P = (L% × CP) / 100" },
              { rule: "විකුණුම් මිල = මිල දී ගත් මිල + ලාභය", ruleEnglish: "Selling Price = Cost Price + Profit", formula: "SP = CP + P" }
            ],
            tips: ["ලාභ ප්‍රතිශතය CP මත ගණනය වේ"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description:  "ලාභය ගණනය කිරීම", calculation: "ලාභය = (25/100) × රු. 4,500", working: "= 0.25 × රු. 4,500", answer: "= රු. 1,125" },
              { stepNumber:  2, description: "විකුණුම් මිල ගණනය කිරීම", calculation: "විකුණුම් මිල = මිල දී ගත් මිල + ලාභය", working: "= රු. 4,500 + රු. 1,125", answer: "= රු. 5,625" }
            ],
            finalAnswer:  "විකුණුම් මිල = රු. 5,625"
          },
          options: [
            { label: "A", value: "රු. 5,625", isCorrect: true },
            { label: "B", value: "රු. 5,500", isCorrect: false },
            { label: "C", value: "රු. 5,400", isCorrect: false },
            { label: "D", value: "රු. 5,750", isCorrect: false }
          ]
        },
        {
          id: 11,
          question: "භාණ්ඩයක් රු. 3,200 කට මිල දී ගෙන රු. 2,880 කට විකුණන ලදී. හානි ප්‍රතිශතය ගණනය කරන්��.",
          marks: 7,
          difficulty: "medium",
          guidelines: {
            title: "හානි ප්‍රතිශතය ගණනය",
            titleEnglish: "Loss Percentage Calculation",
            concept: "විකුණුම් මිල මිල දී ගත් මිලට වඩා අඩු නම් හානියක් වේ.",
            rules: [
              { rule: "හානිය = මිල දී ගත් මිල - විකුණුම් මිල", ruleEnglish: "Loss = Cost Price - Selling Price", formula: "L = CP - SP" },
              { rule:  "හානි % = (හානිය / මිල දී ගත් මිල) × 100", ruleEnglish: "Loss % = (Loss / Cost Price) × 100", formula: "L% = (L/CP) × 100" }
            ],
            tips: ["SP < CP නම් හානියක්"]
          },
          solution: {
            steps: [
              { stepNumber: 1, description:  "හානිය ගණනය කිරීම", calculation: "හානිය = මිල ��ී ගත් මිල - විකුණුම් මිල", working: "= රු. 3,200 - රු. 2,880", answer: "= රු. 320" },
              { stepNumber:  2, description: "හානි ප්‍රතිශතය ගණනය කිරීම", calculation: "හානි % = (හානිය / මිල දී ගත් මිල) × 100", working: "= (රු. 320 / රු. 3,200) × 100", answer: "= 10%" }
            ],
            finalAnswer: "හානි ප්‍රතිශතය = 10%"
          },
          options: [
            { label: "A", value: "10%", isCorrect: true },
            { label: "B", value: "8%", isCorrect: false },
            { label: "C", value: "12%", isCorrect: false },
            { label: "D", value: "15%", isCorrect: false }
          ]
        },
        {
          id: 12,
          question: "වෙළෙන්දෙකු භාණ්ඩයක් 15% ලාභයකට විකුණූ විට රු. 6,900 ක් ලැබුණි. මිල දී ගත් මිල කොපමණද?",
          marks:  5,
          difficulty: "medium",
          guidelines: {
            title: "මිල දී ගත් මිල සෙවීම",
            titleEnglish: "Finding Cost Price",
            concept: "විකුණුම් මිල සහ ලාභ ප්‍රතිශතය දන්නා විට, මිල දී ගත් මිල ගණනය කළ හැක.",
            rules: [
              { rule: "SP = CP × (100 + L%) / 100 සූත්‍රයෙන්", ruleEnglish: "From SP = CP × (100 + P%) / 100", formula: "CP = SP × 100 / (100 + L%)" }
            ],
            tips: ["ලාභ % එකතු කර 100 + L% ගන්න"]
          },
          solution:  {
            steps: [
              { stepNumber: 1, description: "සූත්‍රය යෙදීම", calculation: "CP = SP × 100 / (100 + ලාභ %)", working: "= රු. 6,900 × 100 / 115", answer: "" },
              { stepNumber: 2, description: "ගණනය කිරීම", calculation: "CP = රු. 690,000 / 115", working: "", answer: "= රු. 6,000" }
            ],
            finalAnswer: "මිල දී ගත් මිල = රු. 6,000"
          },
          options:  [
            { label: "A", value: "රු. 6,000", isCorrect: true },
            { label: "B", value: "රු. 5,800", isCorrect: false },
            { label: "C", value: "රු. 6,200", isCorrect: false },
            { label: "D", value: "රු. 5,500", isCorrect: false }
          ]
        }
      ]
    }
  ]
};

// ==================== COMPONENT STATE AND HELPERS ====================
const ModelPaperTaking = ({ user }) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const navigate = useNavigate();

  // State
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showGuidelines, setShowGuidelines] = useState({});
  const [showSolution, setShowSolution] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(MODEL_PAPER_DATA.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Refs
  const timerRef = useRef(null);
  const inputRefs = useRef({});

  // Timer effect
  useEffect(() => {
    if (! isSubmitted && ! showInstructions && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isSubmitted, showInstructions]);

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLanguageDropdown && !e. target.closest(". language-dropdown-container")) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguageDropdown]);

  // Helper functions
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => MODEL_PAPER_DATA.sections[currentSection]?.questions[currentQuestion];

  const getAllQuestions = () => {
    const questions = [];
    MODEL_PAPER_DATA.sections. forEach((section, sIdx) => {
      section.questions.forEach((q, qIdx) => {
        questions.push({ ...q, sectionIndex: sIdx, questionIndex: qIdx, sectionName: section.name, sectionColor: section.color });
      });
    });
    return questions;
  };

  const handleOptionSelect = (questionId, optionLabel) => {
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleStepAnswer = (questionId, stepIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        steps: { ...(prev[questionId]?.steps || {}), [stepIndex]: value }
      }
    }));
  };

  const handleFinalAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ... prev[questionId], finalAnswer:  value }
    }));
  };

  const toggleGuidelines = (questionId) => {
    setShowGuidelines(prev => ({ ...prev, [questionId]: ! prev[questionId] }));
    if (!showGuidelines[questionId]) {
      setShowSolution(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const toggleSolution = (questionId) => {
    setShowSolution(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    if (!showSolution[questionId]) {
      setShowGuidelines(prev => ({ ... prev, [questionId]: false }));
    }
  };

  const handleNext = () => {
    const section = MODEL_PAPER_DATA. sections[currentSection];
    if (currentQuestion < section.questions. length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < MODEL_PAPER_DATA.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(MODEL_PAPER_DATA.sections[currentSection - 1].questions.length - 1);
    }
  };

  const handleQuestionJump = (sectionIdx, questionIdx) => {
    setCurrentSection(sectionIdx);
    setCurrentQuestion(questionIdx);
  };

  const handleMarkForReview = () => {
    const questionId = getCurrentQuestion()?.id;
    const newMarked = new Set(markedQuestions);
    newMarked.has(questionId) ? newMarked.delete(questionId) : newMarked.add(questionId);
    setMarkedQuestions(newMarked);
  };

  const handleSubmit = (auto = false) => {
    if (! isSubmitted) {
      const msg = auto ? "කාලය අවසන්!  Time's up!" : "ඔබට විභාගය අවසන් කිරීමට අවශ්‍යද? ";
      if (auto || window.confirm(msg)) {
        setIsSubmitted(true);
        clearInterval(timerRef.current);
        const allSolutions = {};
        getAllQuestions().forEach(q => { allSolutions[q.id] = true; });
        setShowSolution(allSolutions);
      }
    }
  };

  const calculateScore = () => {
    let correct = 0, total = 0, totalMarks = 0, obtainedMarks = 0;
    const sectionScores = {};

    MODEL_PAPER_DATA. sections.forEach(section => {
      let sc = 0, st = 0, sm = 0, so = 0;
      section.questions.forEach(q => {
        total++; st++; totalMarks += q.marks; sm += q.marks;
        const correctOpt = q.options.find(o => o.isCorrect);
        if (selectedOptions[q.id] === correctOpt?. label) {
          correct++; sc++; obtainedMarks += q.marks; so += q.marks;
        }
      });
      sectionScores[section.id] = { correct:  sc, total: st, marks: sm, obtained: so, percentage: sm > 0 ? (so / sm) * 100 : 0 };
    });

    return { correct, total, totalMarks, obtainedMarks, percentage: totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0, sectionScores };
  };

  const getQuestionStatus = (questionId) => {
    if (markedQuestions.has(questionId)) return 'marked';
    if (selectedOptions[questionId] || answers[questionId]?.finalAnswer) return 'answered';
    return 'unanswered';
  };

  const mathNotations = [
    { symbol: "+", label: "+" }, { symbol: "-", label: "-" }, { symbol: "×", label: "×" },
    { symbol: "÷", label: "÷" }, { symbol: "%", label: "%" }, { symbol: "=", label: "=" },
    { symbol: "රු.", label: "රු." }, { symbol: "(", label: "(" }, { symbol: ")", label: ")" }
  ];

  const insertNotation = (inputKey, notation) => {
    const input = inputRefs.current[inputKey];
    if (input) {
      const start = input.selectionStart;
      const newValue = input.value. substring(0, start) + notation + input.value.substring(input. selectionEnd);
      if (inputKey. startsWith('step-')) {
        const [, qId, sIdx] = inputKey.split('-');
        handleStepAnswer(parseInt(qId), parseInt(sIdx), newValue);
      } else if (inputKey.startsWith('final-')) {
        handleFinalAnswer(parseInt(inputKey.split('-')[1]), newValue);
      }
      setTimeout(() => { input.focus(); input.setSelectionRange(start + notation.length, start + notation. length); }, 0);
    }
  };

  const question = getCurrentQuestion();
  const allQuestions = getAllQuestions();

  // CONTINUED IN PART 2... 
    // ==================== INSTRUCTIONS SCREEN ====================
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{MODEL_PAPER_DATA.title}</h1>
            <p className="text-gray-600">{MODEL_PAPER_DATA.titleEnglish}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{MODEL_PAPER_DATA. duration}</div>
              <div className="text-sm text-gray-600">විනාඩි / Minutes</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{MODEL_PAPER_DATA.totalMarks}</div>
              <div className="text-sm text-gray-600">මුළු ලකුණු / Marks</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{allQuestions.length}</div>
              <div className="text-sm text-gray-600">ප්‍රශ්න / Questions</div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 උපදෙස් / Instructions: </h3>
            <ul className="space-y-2">
              {MODEL_PAPER_DATA.instructions.map((inst, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>{inst}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">📚 කොටස් / Sections:</h3>
            <div className="space-y-2">
              {MODEL_PAPER_DATA.sections.map((section, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span>{section.icon} {section.name}</span>
                  <span className="text-gray-600">{section.questions.length} ප්‍රශ්න • {section.marks} ලකුණු</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowInstructions(false)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-lg transition-all"
          >
            විභාගය ආරම්භ කරන්න / Start Exam 🚀
          </button>
        </div>
      </div>
    );
  }

  // ==================== RESULTS SCREEN ====================
  if (isSubmitted) {
    const score = calculateScore();
    const getGrade = (pct) => {
      if (pct >= 75) return { grade: 'A', color: 'green', label: 'විශිෂ්ට / Excellent' };
      if (pct >= 65) return { grade: 'B', color: 'blue', label: 'ඉතා හොඳ / Very Good' };
      if (pct >= 55) return { grade: 'C', color: 'yellow', label: 'හොඳ / Good' };
      if (pct >= 35) return { grade: 'S', color: 'orange', label: 'සාමාන්‍ය / Satisfactory' };
      return { grade: 'F', color:  'red', label: 'අසමත් / Fail' };
    };
    const gradeInfo = getGrade(score.percentage);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-md">
          <div className="max-w-full mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">📋 {MODEL_PAPER_DATA.title}</span>
              <span className="text-lg font-bold">✅ විභාගය අවසන්</span>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Score Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">🎯 ඔබේ ප්‍රතිඵල / Your Results</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{score.correct}</div>
                <div className="text-sm text-gray-600">නිවැරදි / Correct</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-600">{score.total}</div>
                <div className="text-sm text-gray-600">මුළු / Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{score.obtainedMarks}/{score.totalMarks}</div>
                <div className="text-sm text-gray-600">ලකුණු / Marks</div>
              </div>
              <div className={`rounded-lg p-4 text-center bg-${gradeInfo.color}-100`}>
                <div className={`text-3xl font-bold text-${gradeInfo.color}-600`}>{score.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">ප්‍රතිශතය</div>
              </div>
            </div>

            {/* Grade Display */}
            <div className="text-center mb-6">
              <div className={`inline-block text-6xl font-bold px-8 py-4 rounded-full bg-${gradeInfo.color}-500 text-white`}>
                {gradeInfo.grade}
              </div>
              <p className="mt-2 text-gray-600">{gradeInfo.label}</p>
            </div>

            {/* Section Breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">📊 කොටස් අනුව ප්‍රතිඵල / Section Breakdown: </h3>
              <div className="space-y-2">
                {MODEL_PAPER_DATA.sections.map(section => {
                  const ss = score.sectionScores[section. id];
                  return (
                    <div key={section. id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{section.icon} {section.name. split(' - ')[1]}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{ss.correct}/{ss.total} ප්‍රශ්න</span>
                        <span className="text-sm font-medium">{ss.obtained}/{ss.marks} ලකුණු</span>
                        <span className={`px-2 py-1 rounded text-sm font-bold ${ss.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {ss.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/quiz/generate')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                🏠 මුල් පිටුවට / Home
              </button>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                🔄 නැවත උත්සාහ කරන්න / Retry
              </button>
            </div>
          </div>

          {/* Detailed Answers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 සවිස්තර පිළිතුරු / Detailed Answers</h3>
            {MODEL_PAPER_DATA.sections. map((section, sIdx) => (
              <div key={sIdx} className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">{section.icon} {section.name}</h4>
                {section.questions.map((q) => {
                  const userAns = selectedOptions[q.id];
                  const correctOpt = q.options.find(o => o.isCorrect);
                  const isCorrect = userAns === correctOpt?.label;

                  return (
                    <div key={q.id} className={`mb-4 p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' :  'border-red-300 bg-red-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">Q{q.id}:  {q.question. substring(0, 100)}...</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {isCorrect ? '✓ නිවැරදි' : '✗ වැරදි'}
                        </span>
                      </div>
                                            <div className="text-sm space-y-1 mb-3">
                        <div>
                          <span className="text-gray-600">ඔබේ පිළිතුර:  </span>
                          <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                            {userAns ?  `${userAns}) ${q.options.find(o => o.label === userAns)?.value}` : 'පිළිතුරු දී නැත'}
                          </span>
                        </div>
                        {! isCorrect && (
                          <div>
                            <span className="text-gray-600">නිවැරදි පිළිතුර: </span>
                            <span className="text-green-700 font-medium">{correctOpt?.label}) {correctOpt?.value}</span>
                          </div>
                        )}
                      </div>

                      {/* Solution Display */}
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h5 className="font-medium text-blue-700 mb-2">📖 විසඳුම / Solution:</h5>
                        {q.solution. steps.map((step, idx) => (
                          <div key={idx} className="text-sm mb-2 pl-4 border-l-2 border-blue-300">
                            <div className="font-medium text-blue-600">පියවර {step.stepNumber}:  {step.description}</div>
                            {step.calculation && <div className="text-gray-700">{step.calculation}</div>}
                            {step.working && <div className="text-gray-600">{step.working}</div>}
                            {step.answer && <div className="font-medium text-gray-800">{step.answer}</div>}
                          </div>
                        ))}
                        <div className="mt-2 p-2 bg-green-100 rounded">
                          <span className="font-bold text-green-800">අවසාන පිළිත��ර: </span>
                          <span className="text-green-700">{q.solution.finalAnswer}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN EXAM SCREEN ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/quiz/generate')} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                ← Back
              </button>
              <div>
                <div className="font-bold text-sm md:text-base">{MODEL_PAPER_DATA. title}</div>
                <div className="text-xs text-purple-200 hidden md:block">{MODEL_PAPER_DATA.titleEnglish}</div>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-xl font-bold">{formatTime(timeRemaining)}</span>
            </div>

            {/* Language Dropdown */}
            <div className="relative language-dropdown-container">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
              >
                {currentLanguage === "en" ? "EN" : "සිං"} ▾
              </button>
              {showLanguageDropdown && (
                <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
                  <button onClick={() => { changeLanguage("en"); setShowLanguageDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700">English</button>
                  <button onClick={() => { changeLanguage("si"); setShowLanguageDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700">සිංහල</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex overflow-x-auto space-x-1 py-2">
            {MODEL_PAPER_DATA.sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSection(idx); setCurrentQuestion(0); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                  currentSection === idx ?  'bg-purple-600 text-white' :  'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{section. icon}</span>
                <span className="hidden sm:inline">{section.name. split(' - ')[1]}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left - Question Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {question && (
            <>
              {/* Question Header */}
              <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ප්‍රශ්නය {question.id}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                      ලකුණු:  {question.marks}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {question.difficulty === 'easy' ? 'පහසු' : question.difficulty === 'medium' ? 'මධ්‍යම' : 'අපහසු'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleGuidelines(question.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showGuidelines[question.id] ? 'bg-blue-600 text-white' :  'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      📖 මාර්ගෝපදේශ
                    </button>
                    <button
                      onClick={() => toggleSolution(question.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showSolution[question.id] ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      💡 විසඳුම
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-lg text-gray-800 leading-relaxed p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-l-4 border-purple-500">
                  {question.question}
                </div>
              </div>

              {/* Guidelines Panel */}
              {showGuidelines[question.id] && (
                <div className="bg-blue-50 rounded-xl shadow-md p-6 mb-4 border-2 border-blue-200 animate-fadeIn">
                  <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center">
                    <span className="mr-2">📖</span>
                    {question.guidelines. title}
                  </h3>
                  <p className="text-sm text-blue-600 mb-4">{question.guidelines.titleEnglish}</p>

                  {/* Concept */}
                  <div className="bg-white p-3 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-700 mb-1">💡 සංකල්පය / Concept:</h4>
                    <p className="text-sm text-gray-600">{question.guidelines.concept}</p>
                  </div>

                  {/* Rules */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold text-blue-700">📐 සූත්‍ර / Formulas:</h4>
                    {question.guidelines.rules.map((rule, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="font-medium text-gray-800">{rule. rule}</div>
                        <div className="text-sm text-gray-500 italic">{rule.ruleEnglish}</div>
                        {rule.formula && (
                          <div className="mt-1 font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                            {rule.formula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 උපදෙස් / Tips:</h4>
                    <ul className="space-y-1">
                      {question.guidelines. tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-yellow-500 mr-2">✓</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Solution Panel */}
              {showSolution[question.id] && (
                <div className="bg-green-50 rounded-xl shadow-md p-6 mb-4 border-2 border-green-200 animate-fadeIn">
                  <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    සම්පූර්ණ විසඳුම / Complete Solution
                  </h3>

                  <div className="space-y-4">
                    {question.solution.steps.map((step, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                        <div className="font-bold text-green-700 mb-2">
                          පියවර {step.stepNumber}: {step.description}
                        </div>
                        <div className="text-gray-700 space-y-1 font-mono">
                          {step.calculation && <div>{step. calculation}</div>}
                          {step.working && <div className="text-gray-600">{step.working}</div>}
                          {step.answer && <div className="font-bold text-green-800">{step.answer}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <span className="font-bold text-green-800">🎯 අවසාන පිළිතුර:  </span>
                    <span className="text-green-900 font-medium">{question.solution.finalAnswer}</span>
                  </div>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                <h4 className="font-semibold text-gray-700 mb-4">🔘 පිළිතුර තෝරන්න / Select Answer:</h4>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label
                      key={option.label}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOptions[question.id] === option.label
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.label}
                        checked={selectedOptions[question.id] === option. label}
                        onChange={() => handleOptionSelect(question.id, option.label)}
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-3 flex items-center">
                        <span className="font-bold text-purple-600 mr-3 w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full">
                          {option.label}
                        </span>
                        <span className="text-gray-800">{option.value}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Space */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                <h4 className="font-semibold text-gray-700 mb-4">📝 ගණනය කිරීමේ ඉඩ / Working Space:</h4>

                {question.solution.steps.map((step, idx) => (
                  <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-600 mb-2">
                      පියවර {step.stepNumber}: {step.description}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <input
                          ref={(el) => inputRefs.current[`step-${question.id}-${idx}`] = el}
                          type="text"
                          value={answers[question.id]?. steps?.[idx] || ''}
                          onChange={(e) => handleStepAnswer(question.id, idx, e.target.value)}
                          placeholder="ඔබේ ගණනය ලියන්න..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          dir="auto"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mathNotations. slice(0, 7).map((n) => (
                          <button
                            key={n. symbol}
                            onClick={() => insertNotation(`step-${question.id}-${idx}`, n.symbol)}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium text-sm min-w-[36px]"
                          >
                            {n.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Final Answer Input */}
                <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <div className="font-semibold text-gray-700 mb-2">🎯 අවසාන පිළිතුර / Final Answer:</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <input
                        ref={(el) => inputRefs.current[`final-${question.id}`] = el}
                        type="text"
                        value={answers[question.id]?.finalAnswer || ''}
                        onChange={(e) => handleFinalAnswer(question.id, e.target.value)}
                        placeholder="අවසාන පිළිතුර ලියන්න..."
                        className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-lg"
                        dir="auto"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mathNotations.map((n) => (
                        <button
                          key={n.symbol}
                          onClick={() => insertNotation(`final-${question.id}`, n.symbol)}
                          className="px-3 py-2 bg-yellow-200 hover:bg-yellow-300 text-gray-700 rounded font-medium text-sm min-w-[36px]"
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentSection === 0 && currentQuestion === 0}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  ◀ පෙර / Prev
                </button>
                <button
                  onClick={handleMarkForReview}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    markedQuestions.has(question.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  🔖 {markedQuestions.has(question.id) ? 'සලකුණු ඉවත්' : 'සලකුණු කරන්න'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentSection === MODEL_PAPER_DATA.sections. length - 1 && currentQuestion === MODEL_PAPER_DATA.sections[currentSection].questions.length - 1}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  ඊළඟ / Next ▶
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  📤 අවසන් කරන්න / Submit
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar - Question Navigation */}
        <div className="w-full lg:w-80 bg-white border-l p-4 sm:p-6">
          {/* Paper Info */}
          <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">📋 ප්‍රශ්න පත්‍ර තොරතුරු</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>මුළු ලකුණු: </span>
                <span className="font-medium">{MODEL_PAPER_DATA.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span>මුළු ප්‍රශ්න:</span>
                <span className="font-medium">{allQuestions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>කොටස්:</span>
                <span className="font-medium">{MODEL_PAPER_DATA.sections.length}</span>
              </div>
            </div>
          </div>

          {/* Question Navigation by Section */}
          {MODEL_PAPER_DATA.sections.map((section, sIdx) => (
            <div key={section.id} className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">{section.icon}</span>
                {section. name. split(' - ')[1]}
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {section.questions.map((q, qIdx) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = currentSection === sIdx && currentQuestion === qIdx;

                  return (
                    <button
                      key={q. id}
                      onClick={() => handleQuestionJump(sIdx, qIdx)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                          : status === 'marked'
                          ? 'bg-orange-500 text-white'
                          : status === 'answered'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">සලකුණු / Legend:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
                <span>වත්මන් / Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>පිළිතුරු දුන් / Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span>සලකුණු කළ / Marked</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <span>පිළිතුරු නොදුන් / Unanswered</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">සාරාංශය / Summary:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">✓ පිළිතුරු දුන්: </span>
                <span className="font-medium">{Object.keys(selectedOptions).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">🔖 සලකුණු කළ:</span>
                <span className="font-medium">{markedQuestions.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">○ ඉතිරි: </span>
                <span className="font-medium">{allQuestions.length - Object.keys(selectedOptions).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPaperTaking;