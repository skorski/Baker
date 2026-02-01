import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import VersionHistory from './components/VersionHistory';
import Footer from './components/Footer';
import { recipes } from './data/recipeLoader';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<RecipeList recipes={recipes} />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/history" element={<VersionHistory />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
