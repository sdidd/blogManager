import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Link, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="bg-light text-dark">
      <Outlet />
    </div>
  )
}

export default App
