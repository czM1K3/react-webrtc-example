import { FC } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages";
import First from "./pages/first";
import Second from "./pages/second";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Index />} />
          <Route path="first" element={<First />} />
          <Route path="second" element={<Second />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
