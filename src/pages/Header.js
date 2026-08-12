// components/Header.js
import { FiBell, FiSettings } from 'react-icons/fi';

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-white shadow-md p-4">
      <h1 className="text-lg font-bold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <FiBell size={24} />
        <FiSettings size={24} />
      </div>
    </header>
  );
};

export default Header;
