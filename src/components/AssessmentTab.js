import React, { useState } from "react";

// Mock data for demonstration
const mockEnrollments = [
  {
    course: { id: "c1", title: "Math 101", instructor: "Dr. Smith", signatureUrl: "/signature.png" },
    modules: [
      { id: "m1", title: "Algebra", quiz: { id: "q1", title: "Algebra Quiz", duration: 2, questions: [
        { question: "2+2=?", options: ["3", "4", "5", "6"], correct: 1 }
      ] } }
    ],
    quizStatus: { "q1": { status: "Not Attempted", submission: null, result: null } }
  }
];

export default function StudentAssessmentTab({ enrollments = mockEnrollments }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Start quiz
  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers(Array(quiz.questions.length).fill(null));
    setTimeLeft(quiz.duration * 60);
    setSubmitted(false);
    // Start timer
    if (timer) clearInterval(timer);
    const t = setInterval(() => setTimeLeft(tl => {
      if (tl <= 1) {
        clearInterval(t);
        handleSubmitQuiz();
        return 0;
      }
      return tl - 1;
    }), 1000);
    setTimer(t);
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    if (timer) clearInterval(timer);
    setSubmitted(true);
    setActiveQuiz(null);
    // In real app, send answers to backend here
  };

  // Render
  return (
    <div style={{ padding: 24 }}>
      <h2>📝 Assessments</h2>
      {activeQuiz ? (
        <div>
          <h3>{activeQuiz.title}</h3>
          <div>Time Left: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</div>
          <form onSubmit={e => { e.preventDefault(); handleSubmitQuiz(); }}>
            {activeQuiz.questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <div><b>Q{idx+1}:</b> {q.question}</div>
                {q.options.map((opt, oidx) => (
                  <label key={oidx} style={{ display: "block" }}>
                    <input
                      type="radio"
                      name={`q${idx}`}
                      value={oidx}
                      checked={answers[idx] === oidx}
                      onChange={() => setAnswers(ans => {
                        const a = [...ans];
                        a[idx] = oidx;
                        return a;
                      })}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}
            <button type="submit" className="btn-primary">Submit Quiz</button>
          </form>
        </div>
      ) : (
        <div>
          {enrollments.map((enr, i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <h3>{enr.course.title}</h3>
              {enr.modules.map((mod, j) => (
                <div key={mod.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                  <div><b>Module:</b> {mod.title}</div>
                  {mod.quiz && (
                    <div>
                      <div><b>Quiz:</b> {mod.quiz.title}</div>
                      <div>
                        <b>Status:</b> {enr.quizStatus[mod.quiz.id]?.status}
                        {enr.quizStatus[mod.quiz.id]?.status === "Not Attempted" && !submitted && (
                          <button style={{ marginLeft: 16 }} onClick={() => handleStartQuiz(mod.quiz)}>Start Quiz</button>
                        )}
                        {submitted && (
                          <span style={{ color: "#764ba2", marginLeft: 16 }}>
                            Your quiz has been submitted. Wait for instructor evaluation.
                          </span>
                        )}
                        {/* After result published */}
                        {enr.quizStatus[mod.quiz.id]?.status === "Result Published" && (
                          <div style={{ marginTop: 8 }}>
                            <div><b>Score:</b> {enr.quizStatus[mod.quiz.id].result.score}</div>
                            <div><b>Feedback:</b> {enr.quizStatus[mod.quiz.id].result.feedback}</div>
                            <div><b>Points Earned:</b> {enr.quizStatus[mod.quiz.id].result.points}</div>
                            {/* Optionally show correct/wrong answers */}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* Certificate download if all modules/quizzes complete */}
              {enr.modules.every(mod => enr.quizStatus[mod.quiz?.id]?.status === "Result Published") && (
                <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 12 }}>
                  <h4>🎓 Certificate Available</h4>
                  <a
                    href={`/certificates/${enr.course.id}.pdf`}
                    download
                    className="btn-primary"
                  >
                    Download Certificate ({enr.course.title})
                  </a>
                  <div>
                    <img src={enr.course.signatureUrl} alt="Instructor Signature" style={{ height: 40, marginTop: 8 }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 