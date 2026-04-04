import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SiteContentProvider } from './contexts/SiteContentContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Resume from './pages/Resume';
import Admin from './pages/Admin';
import './index.css';

function App() {
  return (
    <SiteContentProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="projects" element={<Projects />} />
              <Route path="contact" element={<Contact />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogPost />} />
              <Route path="resume" element={<Resume />} />
            </Route>
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </SiteContentProvider>
  );
}

export default App;