import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import LayoutAdmin from "./components/LayoutAdmin.jsx";
import Room from "./pages/Room.jsx";
import Statistics from "./pages/Statistis.jsx";
import BookingHistory from "./pages/BookingHistory.jsx";
import Login from "./pages/Login.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <App />,
        children: [
          {
            element: <LayoutAdmin />,
            children: [
              {
                index: true,
                element: <Room />,
              },
              {
                path: "statistics",
                element: <Statistics />,
              },
              {
                path: "bookinghistory",
                element: <BookingHistory />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  </StrictMode>
);
