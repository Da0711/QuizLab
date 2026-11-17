import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpenCheck, Clock3, Code2, Sparkles } from 'lucide-react'
import { QuizResults, QuizView } from './components/Quiz.jsx'
import { questions } from './data/questions.js'
import {
  advanceQuiz,
  confirmQuizAnswer,
  createInitialProgress,
  isValidProgress,
  selectQuizOption,
} from './quizState.js'
import './App.css'

const STORAGE_KEY = 'quizlab-javascript-quiz-v1'

function Logo() {
  return (
    <a className="brand" href="#inicio" aria-label="QuizLab, início">
      <span className="brand-icon" aria-hidden="true">
        <BookOpenCheck size={22} strokeWidth={2.2} />
      </span>
      <span>Quiz<span className="brand-accent">Lab</span></span>
    </a>
  )
}

function Header({ isLanding }) {
  return (
    <header className="site-header">
      <Logo />
      {isLanding && (
        <>
          <nav className="main-nav" aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#desafio">Desafios</a>
          </nav>
          <a className="header-link" href="#desafio">
            Explorar <ArrowRight size={16} aria-hidden="true" />
          </a>
        </>
      )}
      {!isLanding && (
        <span className="header-quiz-label">
          <Code2 size={17} aria-hidden="true" />
          Quiz de JavaScript
        </span>
      )}
    </header>
  )
}

function ChallengeCard() {
  return (
    <article className="challenge-card" id="desafio" aria-labelledby="challenge-title">
      <div className="challenge-card-top">
        <span className="challenge-icon" aria-hidden="true">
          <Code2 size={21} />
        </span>
        <span className="challenge-label">DESAFIO EM DESTAQUE</span>
        <span className="challenge-level">Iniciante</span>
      </div>

      <h2 id="challenge-title">Uma dose de JavaScript</h2>
      <p className="challenge-description">
        Leia o código, descubra o que acontece e pratique seu raciocínio.
      </p>

      <div className="code-window" aria-label="Prévia de código JavaScript">
        <div className="code-window-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <span className="code-language">javascript</span>
        </div>
        <pre>
          <code>
            <span className="code-muted">const</span> trilha = [<span className="code-string">'pensar'</span>,{'\n'}
            {'  '}<span className="code-string">'praticar'</span>, <span className="code-string">'aprender'</span>];{'\n\n'}
            <span className="code-muted">console</span>.log(trilha.length);
          </code>
        </pre>
      </div>

      <div className="challenge-card-footer">
        <span><Clock3 size={16} aria-hidden="true" /> Cerca de 5 min</span>
        <span className="challenge-topic">Lógica e código</span>
      </div>
    </article>
  )
}

function HeroSection({ onStartQuiz }) {
  return (
    <main>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            APRENDER PODE SER MAIS LEVE
          </span>
          <h1 id="hero-title">
            Conhecimento que se constrói <span>em cada resposta.</span>
          </h1>
          <p className="hero-description">
            O QuizLab transforma o aprendizado em pequenos desafios. Pratique,
            descubra o que já sabe e avance no seu ritmo.
          </p>
          <button className="primary-button" type="button" onClick={onStartQuiz}>
            Começar quiz <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p className="hero-note">Um desafio de cada vez. Sem pressão.</p>
        </div>

        <div className="hero-visual" aria-label="Prévia de um desafio de JavaScript">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-sparkle sparkle-one" aria-hidden="true">✦</div>
          <div className="visual-sparkle sparkle-two" aria-hidden="true">✧</div>
          <ChallengeCard />
          <span className="visual-caption">Curiosidade + prática = aprendizado</span>
        </div>
      </section>

      <section className="learning-strip" id="como-funciona" aria-label="Proposta do QuizLab">
        <div className="learning-strip-icon" aria-hidden="true">
          <BookOpenCheck size={22} />
        </div>
        <p>
          <strong>Aprenda fazendo.</strong> Explore conceitos, exercite seu
          raciocínio e construa confiança passo a passo.
        </p>
        <span className="learning-decoration" aria-hidden="true">✳</span>
      </section>
    </main>
  )
}

function App() {
  const [progress, setProgress] = useState(createInitialProgress)
  const [isProgressLoaded, setIsProgressLoaded] = useState(false)
  const [storageNotice, setStorageNotice] = useState('')
  const storageErrorReported = useRef(false)

  useEffect(() => {
    let restoredProgress = null
    let notice = ''

    try {
      const savedProgress = window.localStorage.getItem(STORAGE_KEY)
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress)
        if (isValidProgress(parsedProgress)) {
          restoredProgress = parsedProgress
        } else {
          console.error('O progresso salvo do quiz não possui um formato válido.')
          notice = 'O progresso salvo não é válido e foi reiniciado.'
        }
      }
    } catch (error) {
      console.error('Não foi possível recuperar o progresso salvo do quiz.', error)
      notice = 'Não foi possível recuperar o progresso salvo deste navegador.'
    }

    queueMicrotask(() => {
      if (restoredProgress) setProgress(restoredProgress)
      if (notice) setStorageNotice(notice)
      setIsProgressLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!isProgressLoaded) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (error) {
      if (!storageErrorReported.current) {
        console.error('Não foi possível salvar o progresso do quiz.', error)
        storageErrorReported.current = true
      }
      queueMicrotask(() => {
        setStorageNotice('Não foi possível salvar seu progresso neste navegador.')
      })
    }
  }, [isProgressLoaded, progress])

  function startQuiz() {
    setProgress(createInitialProgress('quiz'))
  }

  function selectOption(optionId) {
    setProgress((currentProgress) => selectQuizOption(currentProgress, optionId))
  }

  function confirmAnswer() {
    setProgress(confirmQuizAnswer)
  }

  function nextQuestion() {
    setProgress(advanceQuiz)
  }

  function restartQuiz() {
    setProgress(createInitialProgress('quiz'))
  }

  function returnToLanding() {
    setProgress(createInitialProgress())
  }

  const isLanding = progress.stage === 'landing'
  const currentQuestion = questions[progress.currentQuestionIndex]
  const currentAnswer = progress.answers[progress.currentQuestionIndex] ?? null

  return (
    <div className="app-shell" id="inicio">
      <Header isLanding={isLanding} />
      {storageNotice && (
        <p className="storage-notice" role="status">{storageNotice}</p>
      )}
      {isLanding ? (
        <HeroSection onStartQuiz={startQuiz} />
      ) : progress.stage === 'quiz' ? (
        <QuizView
          question={currentQuestion}
          currentQuestionIndex={progress.currentQuestionIndex}
          totalQuestions={questions.length}
          selectedOptionId={currentAnswer?.optionId ?? progress.selectedOptionId}
          answer={currentAnswer}
          onSelectOption={selectOption}
          onConfirmAnswer={confirmAnswer}
          onNextQuestion={nextQuestion}
        />
      ) : (
        <QuizResults
          score={progress.score}
          totalQuestions={questions.length}
          onRestart={restartQuiz}
          onReturnHome={returnToLanding}
        />
      )}
      <footer className="site-footer">
        <Logo />
        <p>Pequenos desafios. Grandes descobertas.</p>
      </footer>
    </div>
  )
}

export default App
