import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(appRoot, '.verification')
await mkdir(outDir, { recursive: true })

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '7100', '--strictPort'], {
  cwd: appRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', (chunk) => { serverLog += chunk.toString() })
server.stderr.on('data', (chunk) => { serverLog += chunk.toString() })

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:7100/')
      if (response.ok) return
    } catch { /* Vite is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Vite did not start.\n${serverLog}`)
}

const errors = []
const notFound = []
let browser
try {
  await waitForServer()
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') { errors.push(message.text()); console.error('BROWSER:', message.text()) } })
  page.on('pageerror', (error) => { errors.push(error.message); console.error('PAGE:', error.message) })
  page.on('response', (response) => { if (response.status() === 404) notFound.push(response.url()) })

  await page.goto('http://127.0.0.1:7100/#/', { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(outDir, 'home-desktop.png') })
  assert.equal(await page.locator('h1').innerText(), '在分数之前，\n先听见自己。')

  await page.getByRole('link', { name: '入径' }).click()
  await page.waitForURL('**/#/discover')
  await page.screenshot({ path: path.join(outDir, 'discover-desktop.png') })
  for (let step = 0; step < 3; step += 1) {
    await page.locator('.quick-answers button').first().click()
    await page.waitForTimeout(650)
  }
  await page.getByRole('button', { name: '这像我，记下' }).click()
  await page.getByRole('link', { name: '看见三种五年' }).click()
  await page.waitForURL('**/#/paths')
  await page.getByRole('tab', { name: /路径 · 另一条路/ }).click()
  await page.getByRole('button', { name: '我试过了，记录感受' }).click()
  await page.getByLabel('实际体验和想象相比，哪里不一样？').fill('偏差出现时我反而很想继续调下去，过程比成品更吸引我。')
  await page.getByRole('button', { name: '记下这次体验' }).click()
  await page.screenshot({ path: path.join(outDir, 'paths-desktop.png'), fullPage: true })
  assert.equal(await page.locator('.task-complete').count(), 1)

  await page.getByRole('link', { name: '带着这条路，去看专业' }).click()
  await page.waitForURL('**/#/majors')
  const cs = page.locator('.major-item').filter({ has: page.getByRole('heading', { name: '计算机科学与技术', exact: true }) })
  await cs.getByRole('button', { name: '收进探索清单' }).click()
  await page.getByPlaceholder('搜索专业或学习内容').fill('自动化')
  assert.equal(await page.locator('.major-item').count(), 1)
  await page.getByPlaceholder('搜索专业或学习内容').fill('')
  await page.screenshot({ path: path.join(outDir, 'majors-desktop.png'), fullPage: true })
  await page.getByRole('link', { name: '连接分数与现实约束' }).click()
  await page.waitForURL('**/#/admission')

  await page.getByLabel('高考分数').fill('800')
  await page.getByRole('button', { name: '核对约束，准备衔接' }).click()
  assert.equal(await page.locator('#score-error').innerText(), '请输入 0–750 之间的分数')
  await page.getByLabel('高考分数').fill('612')
  await page.getByRole('button', { name: '核对约束，准备衔接' }).click()
  assert.equal(await page.getByRole('link', { name: '打开现有志愿决策台' }).getAttribute('href'), 'https://gaokao.dawnchasing.com')
  await page.screenshot({ path: path.join(outDir, 'admission-desktop.png'), fullPage: true })

  const metrics = await page.evaluate(() => ({
    resources: performance.getEntriesByType('resource').length,
    transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
  }))
  assert.equal(metrics.horizontalOverflow, false)

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  const mobile = await mobileContext.newPage()
  mobile.on('console', (message) => { if (message.type() === 'error') errors.push(`mobile: ${message.text()}`) })
  mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
  mobile.on('response', (response) => { if (response.status() === 404) notFound.push(response.url()) })
  await mobile.goto('http://127.0.0.1:7100/#/', { waitUntil: 'networkidle' })
  await mobile.screenshot({ path: path.join(outDir, 'home-mobile.png') })
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false)
  await mobile.getByRole('link', { name: '入径' }).click()
  await mobile.screenshot({ path: path.join(outDir, 'discover-mobile.png'), fullPage: true })
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false)
  assert.equal(await mobile.locator('.mobile-nav').isVisible(), true)
  await mobileContext.close()

  assert.deepEqual(errors, [], `Console errors: ${errors.join('\n')}`)
  assert.deepEqual(notFound, [], `404 responses: ${notFound.join('\n')}`)
  console.log(JSON.stringify({ ok: true, metrics, consoleErrors: errors.length, notFound: notFound.length, screenshots: outDir }, null, 2))
  await context.close()
} finally {
  if (browser) await browser.close()
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 2000)
    timer.unref()
    server.once('exit', () => { clearTimeout(timer); resolve() })
    server.kill('SIGTERM')
  })
}
