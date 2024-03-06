import {useState} from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "../AuthPage/AuthPage";
import PlantPage from "../PlantPage/PlantPage";
import RecPage from "../RecPage/RecPage";
import UserPage from "../UserPage/UserPage";
import NavBar from "../../components/NavBar/NavBar";
import HomePage from "../HomePage/HomePage";
import { getUser } from '../../utilities/users-service';
import './App.css';

export default function App() {
  const [user, setUser] = useState(getUser());
  return (
    <main className="App">
      <>
      <NavBar user={user} setUser={setUser}/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:id" element={<UserPage />} />
        <Route path="/user/:id/rec" element={<RecPage />} />
        <Route path="/plant/:plantId" element={<RecPage />} />
        <Route path="/auth" element={<AuthPage setUser={setUser}/>} />
      </Routes>
      </>
    </main>
  );
}
