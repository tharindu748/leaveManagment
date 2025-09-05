import { LoginForm } from "../components/login-form";
import { Link } from "react-router";

function Login() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="#"
          className="flex items-center text-center gap-1 self-center font-bold text-3xl"
        >
          Leave Management System
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
