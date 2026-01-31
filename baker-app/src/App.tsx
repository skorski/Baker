import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import type { Recipe } from './types/recipe';
import recipesData from './data/recipes.json';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50">
        <Routes>
          <Route path="/" element={<RecipeList recipes={recipesData.recipes as Recipe[]} />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
