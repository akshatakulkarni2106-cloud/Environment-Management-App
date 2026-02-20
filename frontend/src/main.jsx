import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css'
import Start from "./components/start"
import Acc from "./components/acc"
import Campaign from "./components/campaign";
import Home from "./components/home"
import Leaderboard from "./components/leaderboard";
import Post from "./components/post";
import Profile from "./components/profile";
import Newacc from "./components/newacc"
import CreateAcc from "./components/createacc";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Start />,
  },
  {
    path:"/createacc",
    element:<CreateAcc/>
  },
  {
    path:"/acc",
    element:<Acc/>,
  },
  {
    path:"/newacc",
    element:<Newacc/>,
  },
  {
    path:"/acc/home",
    element:<Home/>,
  },
  {
    path:"/acc/home/post",
    element:<Post/>,
  },
  {
    path:"/acc/home/campaign",
    element:<Campaign/>,
  },
  {
    path:"/acc/home/leaderboard",
    element:<Leaderboard/>,
  },
  {
    path:"/acc/home/profile",
    element:<Profile/>
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
