import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Console from './pages/Console';
import Layout from './components/Layout';

function App() {

  return (
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home></Home>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/console" element={<Console></Console>}></Route>
          </Routes>
        </Layout>
      </Router>
  )
}

export default App
