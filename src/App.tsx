import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'


function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <div className="text-3xl font-bold text-blue-500">
        Tailwind is bloody working!!
      </div>
      <button onClick={() => setCount(count + 1)}>
        Clicking this adds 1, Try it: {count}
      </button>

      <img src="https://cataas.com/cat" alt="Random Cat" />
    </main>
  )
}

export default App
