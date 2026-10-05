import { Outlet } from 'react-router-dom';
import { Header } from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Header />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

