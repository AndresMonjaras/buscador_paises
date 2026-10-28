import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

const contenedorRaiz = document.getElementById('root')
const raiz = createRoot(contenedorRaiz)

raiz.render(
  <App />
)
