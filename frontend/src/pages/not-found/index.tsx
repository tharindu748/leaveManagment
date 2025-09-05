import { Link } from "react-router";

const NotFound = () => {
  return (
    <>
      <h1 className="text-5xl text-center mt-20">404 Page Not Found</h1>
      <Link className="text-center mx-auto block mt-5 text-blue-600" to="/">
        Back to homepage
      </Link>
    </>
  );
};

export default NotFound;
