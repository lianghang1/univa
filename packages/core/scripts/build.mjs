import { execSync } from 'node:child_process'
import { cpSync } from 'node:fs'

// 执行 tsup 构建
execSync('tsup', { stdio: 'inherit' })

// 复制 global.d.ts 到 dist
cpSync('src/global.d.ts', 'dist/global.d.ts')

console.log('[build] 已复制 global.d.ts 到 dist')
