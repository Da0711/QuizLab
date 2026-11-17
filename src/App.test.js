import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createServer } from 'vite'
import { questions } from './data/questions.js'
import {
  advanceQuiz,
  confirmQuizAnswer,
  createInitialProgress,
  isValidProgress,
  selectQuizOption,
} from './quizState.js'

function createTestRuntimePlugin() {
  return {
    name: 'test-react-runtime',
    enforce: 'pre',
    resolveId(source) {
      return source === 'virtual:test-react-runtime' ? '\0test-react-runtime' : null
    },
    load(id) {
      return id === '\0test-react-runtime'
        ? "import React from 'react'; import * as ReactDOMServer from 'react-dom/server'; export { React, ReactDOMServer }"
        : null
    },
  }
}

test('landing page presents the Portuguese QuizLab JavaScript challenge', async () => {
  const server = await createServer({
    plugins: [
      createTestRuntimePlugin(),
      {
        name: 'test-css-mock',
        enforce: 'pre',
        resolveId(source) {
          return source.endsWith('.css') ? '\0test-css' : null
        },
        load(id) {
          return id === '\0test-css' ? 'export default {}' : null
        },
      },
    ],
  })

  try {
    const { React, ReactDOMServer } = await server.ssrLoadModule('virtual:test-react-runtime')
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(App))

    assert.match(markup, /QuizLab/)
    assert.match(markup, /Conhecimento que se constrói/)
    assert.match(markup, /Começar quiz/)
    assert.match(markup, /<button[^>]*class="primary-button"[^>]*type="button"/)
    assert.match(markup, /Uma dose de JavaScript/)
    assert.match(markup, /console/)
  } finally {
    await server.close()
  }
})

test('document declares Brazilian Portuguese', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /<html lang="pt-BR">/)
})

test('JavaScript quiz has ten questions with four valid options each', () => {
  assert.equal(questions.length, 10)

  for (const question of questions) {
    assert.equal(question.options.length, 4)
    assert.equal(new Set(question.options.map((option) => option.id)).size, 4)
    assert.ok(question.options.some((option) => option.id === question.correctOptionId))
    assert.ok(question.explanation)
  }
})

test('quiz state enforces one answer, scores it once, and completes all questions', () => {
  const firstQuestion = questions[0]
  const initialProgress = createInitialProgress('quiz')
  const unselectedProgress = advanceQuiz(initialProgress)
  const selectedProgress = selectQuizOption(initialProgress, 'a')
  const changedSelection = selectQuizOption(selectedProgress, firstQuestion.correctOptionId)
  const confirmedProgress = confirmQuizAnswer(changedSelection)
  const nextProgress = advanceQuiz(confirmedProgress)

  assert.strictEqual(unselectedProgress, initialProgress)
  assert.equal(confirmedProgress.score, 1)
  assert.equal(confirmedProgress.answers.length, 1)
  assert.strictEqual(confirmQuizAnswer(confirmedProgress), confirmedProgress)
  assert.equal(nextProgress.currentQuestionIndex, 1)
  assert.equal(nextProgress.selectedOptionId, null)

  let completedProgress = createInitialProgress('quiz')
  for (const question of questions) {
    completedProgress = selectQuizOption(completedProgress, question.correctOptionId)
    completedProgress = confirmQuizAnswer(completedProgress)
    completedProgress = advanceQuiz(completedProgress)
  }

  assert.equal(completedProgress.stage, 'results')
  assert.equal(completedProgress.score, questions.length)
  assert.equal(isValidProgress(completedProgress), true)
  assert.equal(isValidProgress({ ...completedProgress, score: 0 }), false)
})

test('quiz and results views render feedback and the final score', async () => {
  const server = await createServer({
    plugins: [createTestRuntimePlugin()],
  })

  try {
    const { React, ReactDOMServer } = await server.ssrLoadModule('virtual:test-react-runtime')
    const { QuizResults, QuizView } = await server.ssrLoadModule('/src/components/Quiz.jsx')
    const question = questions[0]
    const quizMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(QuizView, {
      question,
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      selectedOptionId: 'a',
      answer: { questionId: question.id, optionId: 'a', isCorrect: false },
      onSelectOption() {},
      onConfirmAnswer() {},
      onNextQuestion() {},
    }))
    const resultsMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(QuizResults, {
      score: 7,
      totalQuestions: questions.length,
      onRestart() {},
      onReturnHome() {},
    }))

    assert.match(quizMarkup, /Pergunta 1 de 10/)
    assert.match(quizMarkup, /role="progressbar"/)
    assert.equal((quizMarkup.match(/type="radio"/g) ?? []).length, 4)
    assert.match(quizMarkup, /Resposta incorreta/)
    assert.match(quizMarkup, /A propriedade length informa quantos itens existem no array/)
    assert.match(quizMarkup, /A alternativa correta é: <strong>3<\/strong>/)
    assert.match(resultsMarkup, /7\/10/)
    assert.match(resultsMarkup, /7 de 10/)
    assert.match(resultsMarkup, /70%/)
    assert.match(resultsMarkup, /Refazer quiz/)
  } finally {
    await server.close()
  }
})
