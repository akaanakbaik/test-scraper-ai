export const detectLanguage = code => {
  const text = String(code || '')

  let jsScore = 0
  let pyScore = 0
  let esmScore = 0
  let cjsScore = 0

  if (/\bimport\s+[\w{}\s,*]+\s+from\s+['"]/.test(text)) esmScore += 4
  if (/\bexport\s+(default|const|async|function|class)/.test(text)) esmScore += 4
  if (/\brequire\s*\(/.test(text)) cjsScore += 5
  if (/\bmodule\.exports\b/.test(text)) cjsScore += 4
  if (/\bexports\./.test(text)) cjsScore += 3
  if (/\bconst\b|\blet\b|\bvar\b/.test(text)) jsScore += 2
  if (/\basync\s+function\b|\bfunction\s+\w+\s*\(/.test(text)) jsScore += 2
  if (/=>/.test(text)) jsScore += 2
  if (/\bconsole\.log\s*\(/.test(text)) jsScore += 2
  if (/\baxios\b|\bcheerio\b|\bfetch\s*\(/.test(text)) jsScore += 2
  if (/\bimport\s+[a-zA-Z_][\w]*(\s+as\s+\w+)?/.test(text)) pyScore += 3
  if (/\bfrom\s+[a-zA-Z_][\w.]*\s+import\b/.test(text)) pyScore += 3
  if (/^\s*def\s+\w+\s*\(/m.test(text)) pyScore += 5
  if (/^\s*async\s+def\s+\w+\s*\(/m.test(text)) pyScore += 5
  if (/\bprint\s*\(/.test(text)) pyScore += 2
  if (/\brequests\b|\bbs4\b|\baiohttp\b|\bhttpx\b/.test(text)) pyScore += 3
  if (/:\s*\n\s{2,}\S/.test(text)) pyScore += 2

  const jsTotal = jsScore + esmScore + cjsScore
  const pyTotal = pyScore

  if (pyTotal > jsTotal) {
    return {
      language: 'python',
      module: 'python',
      confidence: Math.min(99, 55 + pyTotal * 5)
    }
  }

  if (esmScore > cjsScore) {
    return {
      language: 'javascript',
      module: 'esm',
      confidence: Math.min(99, 60 + esmScore * 6 + jsScore * 3)
    }
  }

  return {
    language: 'javascript',
    module: 'cjs',
    confidence: Math.min(99, 60 + cjsScore * 6 + jsScore * 3)
  }
}