import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import Footer from './components/Footer';
import type { Recipe } from './types/recipe';
import recipesData from './data/recipes.json';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<RecipeList recipes={recipesData.recipes as unknown as Recipe[]} />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
