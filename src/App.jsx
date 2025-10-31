import { Outlet } from 'react-router-dom'
import "react-toastify/dist/ReactToastify.css";
import 'antd/dist/reset.css';

function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default App;