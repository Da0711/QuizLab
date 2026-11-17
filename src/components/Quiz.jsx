import { ArrowRight, CheckCircle2, Home, RotateCcw, XCircle } from 'lucide-react'

function QuizProgress({ currentQuestionIndex, totalQuestions }) {
  const progressValue = currentQuestionIndex + 1
  const progressPercentage = Math.round((progressValue / totalQuestions) * 100)

  return (
    <div className="quiz-progress">
      <div className="quiz-progress-label">
        <span>Pergunta {progressValue} de {totalQuestions}</span>
        <span>{progressPercentage}%</span>
      </div>
      <div
        className="quiz-progress-track"
        role="progressbar"
        aria-label="Progresso do quiz"
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-valuenow={progressValue}
      >
        <span style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>
  )
}

function AnswerOption({
  option,
  question,
  selectedOptionId,
  isConfirmed,
  onSelect,
}) {
  const isSelected = selectedOptionId === option.id
  const isCorrectOption = option.id === question.correctOptionId
  const resultClass = isConfirmed
    ? isCorrectOption
      ? ' answer-option-correct'
      : isSelected
        ? ' answer-option-incorrect'
        : ''
    : ''

  return (
    <label className={`answer-option${isSelected ? ' answer-option-selected' : ''}${resultClass}`}>
      <input
        type="radio"
        name={`answer-${question.id}`}
        value={option.id}
        checked={isSelected}
        disabled={isConfirmed}
        onChange={() => onSelect(option.id)}
      />
      <span className="answer-option-marker" aria-hidden="true" />
      <span className="answer-option-text">{option.text}</span>
    </label>
  )
}

function AnswerFeedback({ question, answer }) {
  const isCorrect = answer.isCorrect
  const correctOption = question.options.find(
    (option) => option.id === question.correctOptionId,
  )

  return (
    <div
      className={`answer-feedback${isCorrect ? ' answer-feedback-correct' : ' answer-feedback-incorrect'}`}
      role="status"
      aria-live="polite"
    >
      <div className="answer-feedback-title">
        {isCorrect
          ? <CheckCircle2 size={20} aria-hidden="true" />
          : <XCircle size={20} aria-hidden="true" />}
        <strong>{isCorrect ? 'Resposta correta!' : 'Resposta incorreta'}</strong>
      </div>
      {!isCorrect && (
        <p className="answer-correct-option">
          A alternativa correta é: <strong>{correctOption.text}</strong>
        </p>
      )}
      <p>{question.explanation}</p>
    </div>
  )
}

export function QuizView({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedOptionId,
  answer,
  onSelectOption,
  onConfirmAnswer,
  onNextQuestion,
}) {
  const isConfirmed = Boolean(answer)

  return (
    <main className="quiz-main">
      <QuizProgress
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />
      <section className="quiz-card" aria-labelledby="question-title">
        <p className="quiz-kicker">DESAFIO DE JAVASCRIPT</p>
        <h1 id="question-title">{question.prompt}</h1>
        <pre className="quiz-code"><code>{question.code}</code></pre>

        <fieldset className="answer-list" disabled={isConfirmed}>
          <legend className="visually-hidden">Escolha uma alternativa</legend>
          {question.options.map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              question={question}
              selectedOptionId={selectedOptionId}
              isConfirmed={isConfirmed}
              onSelect={onSelectOption}
            />
          ))}
        </fieldset>

        {isConfirmed && <AnswerFeedback question={question} answer={answer} />}

        {!isConfirmed ? (
          <button
            className="primary-button quiz-action-button"
            type="button"
            disabled={!selectedOptionId}
            onClick={onConfirmAnswer}
          >
            Confirmar resposta <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            className="primary-button quiz-action-button"
            type="button"
            onClick={onNextQuestion}
          >
            {currentQuestionIndex === totalQuestions - 1
              ? 'Ver resultado'
              : 'Próxima pergunta'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </section>
    </main>
  )
}

export function QuizResults({ score, totalQuestions, onRestart, onReturnHome }) {
  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <main className="quiz-main">
      <section className="results-card" aria-labelledby="results-title">
        <div className="results-icon" aria-hidden="true">
          <CheckCircle2 size={30} />
        </div>
        <p className="quiz-kicker">QUIZ CONCLUÍDO</p>
        <h1 id="results-title">Mandou bem por chegar até aqui!</h1>
        <p className="results-description">
          Cada pergunta é uma oportunidade de aprender. Veja como foi seu resultado:
        </p>

        <div className="results-summary">
          <div className="result-stat">
            <span className="result-stat-value">{score}/{totalQuestions}</span>
            <span className="result-stat-label">Pontuação</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{score} de {totalQuestions}</span>
            <span className="result-stat-label">Acertos</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{percentage}%</span>
            <span className="result-stat-label">Aproveitamento</span>
          </div>
        </div>

        <button
          className="primary-button quiz-action-button"
          type="button"
          onClick={onRestart}
        >
          <RotateCcw size={17} aria-hidden="true" />
          Refazer quiz
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={onReturnHome}
        >
          <Home size={17} aria-hidden="true" />
          Voltar para o início
        </button>
      </section>
    </main>
  )
}
