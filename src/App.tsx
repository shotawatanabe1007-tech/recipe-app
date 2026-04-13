import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import PlanList from './pages/PlanList';
import AddRecipe from './pages/AddRecipe';
import RecipeDetail from './pages/RecipeDetail';
import CalendarPage from './pages/CalendarPage';
import CookingHistory from './pages/CookingHistory';
import AISuggestions from './pages/AISuggestions';
import ShoppingList from './pages/ShoppingList';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<PlanList />} />
            <Route path="/add-recipe" element={<AddRecipe />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/history" element={<CookingHistory />} />
            <Route path="/history/add" element={<CookingHistory />} />
            <Route path="/suggest" element={<AISuggestions />} />
            <Route path="/shopping" element={<ShoppingList />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
