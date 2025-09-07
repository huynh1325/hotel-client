import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx'
import LayoutAdmin from './components/LayoutAdmin.jsx';
import Room from './pages/Room.jsx';
import Statistics from './pages/Statistis.jsx';
import BookingHistory from './pages/BookingHistory.jsx';

const router = createBrowserRouter([
  {
    path: "/",
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
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
