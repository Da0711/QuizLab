import { questions } from './data/questions.js'

export function createInitialProgress(stage = 'landing') {
  return {
    stage,
    currentQuestionIndex: 0,
    selectedOptionId: null,
    answers: [],
    score: 0,
  }
}

export function isValidProgress(progress) {
  if (!progress || typeof progress !== 'object') return false
  if (!['landing', 'quiz', 'results'].includes(progress.stage)) return false
  if (
    !Number.isInteger(progress.currentQuestionIndex)
    || progress.currentQuestionIndex < 0
    || progress.currentQuestionIndex >= questions.length
  ) return false
  if (!Array.isArray(progress.answers) || progress.answers.length > questions.length) {
    return false
  }
  if (!Number.isInteger(progress.score) || progress.score < 0) return false

  const answersAreValid = progress.answers.every((answer, index) => {
    if (!answer || typeof answer !== 'object') return false

    const question = questions[index]
    const selectedOption = question.options.find(
      (option) => option.id === answer.optionId,
    )

    return (
      answer.questionId === question.id
      && typeof answer.isCorrect === 'boolean'
      && Boolean(selectedOption)
      && answer.isCorrect === (answer.optionId === question.correctOptionId)
    )
  })

  if (!answersAreValid) return false

  const calculatedScore = progress.answers.filter((answer) => answer.isCorrect).length
  if (progress.score !== calculatedScore) return false

  if (
    progress.selectedOptionId !== null
    && !questions[progress.currentQuestionIndex].options.some(
      (option) => option.id === progress.selectedOptionId,
    )
  ) return false

  if (progress.stage === 'landing') {
    return (
      progress.currentQuestionIndex === 0
      && progress.selectedOptionId === null
      && progress.answers.length === 0
    )
  }

  if (progress.stage === 'quiz') {
    const confirmedCurrentAnswer = progress.answers.length === progress.currentQuestionIndex + 1

    return (
      progress.answers.length >= progress.currentQuestionIndex
      && progress.answers.length <= progress.currentQuestionIndex + 1
      && (
        !confirmedCurrentAnswer
        || progress.answers[progress.currentQuestionIndex].optionId === progress.selectedOptionId
      )
    )
  }

  return (
    progress.currentQuestionIndex === questions.length - 1
    && progress.answers.length === questions.length
  )
}

export function selectQuizOption(progress, optionId) {
  if (
    progress.stage !== 'quiz'
    || progress.answers[progress.currentQuestionIndex]
  ) return progress

  const currentQuestion = questions[progress.currentQuestionIndex]
  if (!currentQuestion.options.some((option) => option.id === optionId)) {
    return progress
  }

  return { ...progress, selectedOptionId: optionId }
}

export function confirmQuizAnswer(progress) {
  const currentQuestion = questions[progress.currentQuestionIndex]
  if (
    progress.stage !== 'quiz'
    || progress.answers[progress.currentQuestionIndex]
    || !progress.selectedOptionId
  ) return progress

  const isCorrect = progress.selectedOptionId === currentQuestion.correctOptionId
  return {
    ...progress,
    answers: [
      ...progress.answers,
      {
        questionId: currentQuestion.id,
        optionId: progress.selectedOptionId,
        isCorrect,
      },
    ],
    score: progress.score + (isCorrect ? 1 : 0),
  }
}

export function advanceQuiz(progress) {
  const answer = progress.answers[progress.currentQuestionIndex]
  if (progress.stage !== 'quiz' || !answer) return progress

  if (progress.currentQuestionIndex === questions.length - 1) {
    return { ...progress, stage: 'results' }
  }

  return {
    ...progress,
    currentQuestionIndex: progress.currentQuestionIndex + 1,
    selectedOptionId: null,
  }
}
