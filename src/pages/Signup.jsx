import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validateSignupToken, markTokenAsUsed } from "../db/supabase-db.js";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [status, setStatus] = useState("Checking token...");
  const [tokenProcessing, setTokenProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus(null);
      return;
    }

    const processedKey = `processed_token_${token}`;
    if (sessionStorage.getItem(processedKey)) {
      console.log("Token already processed in this tab:", token);
      const existing = localStorage.getItem("tokenAccess");
      if (existing === "true") {
        navigate("/", { replace: true });
        return;
      }
    }

    (async () => {
      setTokenProcessing(true);
      setStatus("Validating token...");
      try {
        const info = await validateSignupToken(token);
        if (!info) {
          console.warn("Token invalid or expired:", token);
          setStatus("Invalid or expired token.");
          setTokenProcessing(false);
          return;
        }

        try {
          await markTokenAsUsed(token);
          console.log("Token marked as used:", token);
        } catch (err) {
          console.warn("Failed to mark token as used (continuing):", err);
        }

        try {
          if (info.accountUUID) {
            localStorage.setItem("accountUUID", String(info.accountUUID));
            console.log("Saved accountUUID:", info.accountUUID);
          }
          if (info.username) {
            localStorage.setItem("accountUsername", String(info.username).replace(/^\@/, ""));
            console.log("Saved accountUsername:", info.username);
          }
          localStorage.setItem("tokenAccess", "true");
        } catch (err) {
          console.warn("Failed to persist token-derived info to localStorage", err);
        }

        try {
          sessionStorage.setItem(processedKey, "true");
        } catch (err) {
        }

        navigate("/", { replace: true });
      } catch (err) {
        console.error("Error validating token:", err);
        setStatus("Error validating token.");
      } finally {
        setTokenProcessing(false);
      }
    })();
  }, [location.search, navigate]);

  if (tokenProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Validating link…</h2>
          <p className="text-sm text-gray-600 mb-2">{status}</p>
          <p className="text-xs text-gray-400">If valid you'll be redirected automatically.</p>
        </div>
      </div>
    );
  }

  return null;
}
