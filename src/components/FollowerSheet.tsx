import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, X, ExternalLink, Clipboard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getLocalSettings } from '../lib/settingsClient';



type Follower = {
  username: string;
  full_name?: string | null;
  category?: string | null;
  has_been_messaged?: boolean | null;
};

export default function FollowerSheet({
  follower,
  open,
  onOpenChange,
  onMessageSent,
}: {
  follower: Follower | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSent?: () => void;
}) {
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageSent, setMessageSent] = useState<boolean>(false);

  const prevOpenRef = useRef<boolean>(open);
  const followerUsernameRef = useRef<string | null>(follower?.username ?? null);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    followerUsernameRef.current = follower?.username ?? null;
  }, [follower?.username]);

  useEffect(() => {
    setMessageSent(Boolean(follower?.has_been_messaged));
  }, [follower?.username, follower?.has_been_messaged]);

  useEffect(() => {
    if (!open || !follower) {
      setGeneratedMessage("");
      return;
    }
    handleGenerate();
  }, [open, follower?.username]);

  const updateHasBeenMessaged = async (username: string | null) => {
    if (!username) return;
    try {
      const { error } = await supabase
        .from("followers_duplicate_new")
        .update({ has_been_messaged: true })
        .eq("username", username);

      if (error) {
        console.error("Failed to update has_been_messaged:", error);
      } else {
        console.log("Successfully updated has_been_messaged:", username);
      }
    } catch (err) {
      console.error("Error updating has_been_messaged:", err);
    }
  };

  useEffect(() => {
    const handleClose = async () => {
      const prevOpen = prevOpenRef.current;
      if (prevOpen && !open) {
        if (messageSent) {
          window.location.reload();
        }
      }
      prevOpenRef.current = open;
    };

    handleClose();
  }, [open, messageSent, onMessageSent]);

  const handleGenerate = async () => {
    if (!follower) return;

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    try {
      const settings = getLocalSettings?.() || {};
      const extraInstructions = settings.generateInstructions || '';


      const res = await fetch("http://localhost:3001/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: follower.username,
          category: follower.category || "other business",
          extraInstructions,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setGeneratedMessage(data?.message ?? "");
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("generate aborted");
      } else {
        console.error("generate error:", err);
        setGeneratedMessage("Failed to generate message.");
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };


  const handleCopyAndOpen = async () => {
    const text = generatedMessage || "";
    const instaUrl = `https://instagram.com/${follower?.username ?? ""}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setMessageSent(true);

      if (follower?.username) {
        updateHasBeenMessaged(follower.username);
      }

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("copy error:", err);

    } finally {
      if (follower?.username) {
        window.open(instaUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleOpenInstagram = () => {
    if (!follower?.username) return;
    const url = `https://instagram.com/${follower.username}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-h-full p-0 bg-white shadow-xl">
        <SheetHeader className="flex items-center justify-between px-6 py-4 border-b">
          <div className="min-w-0">
            <SheetTitle className="text-lg font-semibold text-gray-900 truncate">
              {follower?.full_name ?? follower?.username ?? "Unknown"}
            </SheetTitle>
            <div className="text-sm text-gray-500 truncate">
              {follower?.username ? `@${follower.username}` : ""}
              {follower?.category ? " • " : ""}
              <span className="inline-block align-middle">
                {follower?.category ?? ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={
                follower?.username
                  ? `https://instagram.com/${follower.username}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Instagram
            </a>

            <button
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </SheetHeader>

        <div className="px-6 py-6">
          <label className="sr-only" htmlFor="ai-message">
            AI generated message
          </label>

          <div className="relative">
            <textarea
              id="ai-message"
              className="w-full p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[240px] text-sm"
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              rows={10}
              placeholder="AI-generated message..."
              aria-busy={loading}
              disabled={loading}
            />

            {loading && (
              <div
                className="absolute inset-0 flex items-start justify-end p-3 pointer-events-none"
                aria-hidden
              >
                <div className="flex items-center gap-2 rounded bg-white/80 px-2 py-1 shadow">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeOpacity="0.2"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xs text-gray-600">Generating…</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full min-w-0">
              <div className="w-full sm:w-auto min-w-0">
                <Button
                  onClick={handleCopyAndOpen}
                  disabled={!generatedMessage || !follower?.username}
                  aria-disabled={!generatedMessage || !follower?.username}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white w-full sm:w-auto flex items-center justify-center"
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  <span className="inline-block truncate">
                    {copied ? "Copied — Opening…" : "Copy & Open Instagram"}
                  </span>
                </Button>
              </div>

              {/* Secondary button */}
              <div className="w-full sm:w-auto min-w-0">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  variant="outline"
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="truncate">
                    {loading ? "Regenerating…" : "Regenerate"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Row 2: Status Checkbox & Links */}
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={messageSent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setMessageSent(checked);
                    // update immediately when checkbox is checked
                    if (checked && follower?.username) {
                      updateHasBeenMessaged(follower.username);
                    }
                  }}
                  className="form-checkbox h-4 w-4 rounded text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700">Message sent</span>
              </label>

              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenInstagram();
                }}
                href={
                  follower?.username
                    ? `https://instagram.com/${follower.username}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                View on Instagram
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="ml-auto">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
