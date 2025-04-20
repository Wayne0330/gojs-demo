import { Routes, Route, Link } from "react-router-dom";
import B from "./pages/A";
import A from "./pages/B";

function App() {
  return (
    <div>
      <nav>
        <Link to="/A">A</Link> | <Link to="/B">B</Link>
      </nav>
      <Routes>
        <Route path="/A" element={<A />} />
        <Route path="/B" element={<B />} />
      </Routes>
    </div>
  );
}

export default App;
