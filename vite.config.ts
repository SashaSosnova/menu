import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function recoveredStatePlugin(): Plugin {
  const file = path.resolve('recovered-menu-state.json')
  return {
    name: 'recovered-menu-state',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/recovered-menu-state.json' && url !== '/menu/recovered-menu-state.json') {
          next()
          return
        }
        if (!fs.existsSync(file)) {
          next()
          return
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: '/menu/',
  plugins: [react(), recoveredStatePlugin()],
})
