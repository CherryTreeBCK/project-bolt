import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validateSignupToken, markTokenAsUsed } from "@/db/supabase-db";

export function TokenRedirectPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }

    async function validateToken() {
      try {
        const data = await validateSignupToken(token);
        if (!data) {
          setError("Invalid or expired token.");
          setLoading(false);
          return;
        }

        await markTokenAsUsed(token);
        localStorage.setItem("ownerAccount", data.accounts.username);
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        setError("Something went wrong validating the token.");
        setLoading(false);
      }
    }

    validateToken();
  }, [location.search, navigate]);

  if (loading) return <div>Validating token...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return null;
}
