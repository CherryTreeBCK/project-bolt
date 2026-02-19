import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, data } from "react-router-dom";
import { Clipboard, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

export default function FollowerView() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followerData, setFollowerData] = useState<any | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string>("");

  useEffect(() => {
    if (!username) return;

    let mounted = true;
    const fetchFollower = async (username: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("followers_duplicate_new")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (error) throw error;
        if (mounted) setFollowerData(data ?? null);
      } catch (err) {
        console.error("Failed to fetch follower:", err);
        if (mounted) setFollowerData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFollower(username);

    return () => {
      mounted = false;
    };
  }, [username]);

  useEffect(() => {
    if (!followerData) return;
    handleGenerate();
  }, [followerData]);

  const handleGenerate = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/generate-message", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: followerData.username,
          category: followerData.category || "other business",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setGeneratedMessage(data.message);
    } catch (err) {
      console.error(err);
      setGeneratedMessage("Failed to generate message");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!username) return <div className="p-6">No username specified.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-8 bg-gradient-to-b from-slate-50 to-white flex flex-col items-center">
            <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              {followerData?.profile_pic_url ? (
                <img
                  src={`/api/proxy-avatar?url=${encodeURIComponent(
                    followerData.profile_pic_url
                  )}`}
                  alt={followerData.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-500">
                  {followerData?.full_name
                    ? followerData.full_name[0]
                    : followerData?.username[0]}
                </div>
              )}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-gray-900">
              {followerData?.full_name ?? followerData?.username}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              @{followerData?.username}
            </p>

            <div className="mt-4 flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                {followerData?.category ?? "Other business"}
              </span>

              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-gray-400 hover:underline"
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="md:w-2/3 p-8">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-gray-700">
                AI Outreach Message
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerate}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-2"
                  title="Generate message"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-Generate
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm flex items-center gap-2"
                  title="Copy message"
                >
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <textarea
                value={generatedMessage}
                readOnly
                rows={10}
                className="w-full p-4 rounded-xl border border-gray-200 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <strong>Category:</strong>{" "}
              {followerData?.category ?? "Other business"} •{" "}
              <strong className="ml-2">Source:</strong>{" "}
              {followerData?.profile_pic_url ? "Instagram" : "Manual/Unknown"}
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Tip: Press{" "}
                <span className="px-2 py-1 bg-gray-100 rounded">Generate</span>{" "}
                to get a message for the current category.
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-500">Loading...</div>
      )}
    </div>
  );
}
