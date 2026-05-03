import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AuthNavButtonProps = {
  className?: string;
};

export const AuthNavButton = ({ className = "" }: AuthNavButtonProps) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <Link
      to={isLoggedIn ? "/profile" : "/login"}
      className={className}
      aria-label={isLoggedIn ? "Profile" : "Login/Signup"}
    >
      {isLoggedIn ? "PROFILE" : "LOGIN/SIGNUP"}
    </Link>
  );
};
