import './App.css'
import { MenuView } from './components/MenuView'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">Меню</h1>
      </header>

      <main className="main">
        <MenuView />
      </main>
    </div>
  )
}

export default App
