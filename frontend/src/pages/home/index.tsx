import { Link } from "react-router";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Leave Management System
      </h1>
      <p className="text-lg mb-8">Make you leave here</p>
      <Link
        to="/dashboard"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Get Started
      </Link>
    </div>
  );
};

export default Home;
