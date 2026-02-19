import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import FollowerSheet from "@/components/FollowerSheet";
import { fetchTopFollowers } from "@/lib/followers";
import { getLocalSettings } from "../lib/settingsClient";


import {
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Star,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  ExternalLink,
  ArrowUpRight,
  Activity,
  Target,
  Zap,
  Settings,
} from "lucide-react";

export function Dashboard() {
  const [followersCount, setFollowersCount] = useState<string>("Loading...");
  const [topFollowersList, setTopFollowersList] = useState<any[]>([]);
  const [selectedFollower, setSelectedFollower] = useState<any | null>(null);
  const [ownerAccount, setOwnerAccount] = useState<string | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const stored = localStorage.getItem("accountUsername");
    if (stored) {
      setOwnerAccount(stored);
      console.log("Dashboard loaded ownerAccount from localStorage:", stored);
    } else {
      console.warn("Dashboard: no ownerAccount in localStorage");
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ownerAccount") {
        setOwnerAccount(e.newValue);
        console.log("ownerAccount changed via storage event:", e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  useEffect(() => {
    let cancelled = false;

    async function loadTopFollowers() {
      try {
        if (!ownerAccount) {
          console.warn("No selected account");
          setTopFollowersList([]);
          return;
        }

        const combined = await fetchTopFollowers(ownerAccount);
        if (!cancelled) setTopFollowersList(combined);
      } catch (err) {
        console.error("Error loading top followers:", err);
        if (!cancelled) setTopFollowersList([]);
      }
    }

    loadTopFollowers();

    return () => {
      cancelled = true;
    };
  }, [ownerAccount]);


  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case "Hot Lead":
        return "bg-red-100 text-red-800 border-red-200";
      case "Warm Lead":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cold Lead":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your Instagram CRM.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate("/admin")}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Page
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Top Lead Prospects
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Your highest potential followers for conversion
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-pink-100 to-red-100 text-red-800 border-red-200">
                <Target className="h-3 w-3 mr-1" />
                High Value
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {topFollowersList.map((follower, index) => (
                <div
                  key={follower.username}
                  className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        #{index + 1}
                      </div>
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage />
                          <AvatarFallback className="text-xs">
                            {follower.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        {follower.is_verified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <button
                          onClick={() => setSelectedFollower(follower)}
                          className="font-semibold text-gray-900 hover:underline text-left"
                          style={{ background: "transparent" }}
                        >
                          {follower.username}
                        </button>

                        <a
                          href={`https://instagram.com/${follower.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto"
                          >
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </Button>
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {follower.full_name}
                      </p>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="font-medium">
                          {follower.follower_count} followers
                        </span>
                        <span>•</span>
                        <span>•</span>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          {follower.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs font-semibold border`}>
                          {follower.priority ?? "N/A"}
                        </Badge>
                        <Badge
                          className={`text-xs border ${getLeadStatusColor(
                            follower.leadStatus
                          )}`}
                        >
                          {follower.leadStatus || "N/A"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-green-600 font-medium">
                          {follower.growth || "-"}
                        </span>
                        <span className="text-gray-500">
                          {follower.lastActivity || "-"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-gray-50 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <FollowerSheet
          follower={selectedFollower}
          open={!!selectedFollower}
          onOpenChange={(open) => {
            if (!open) setSelectedFollower(null);
          }}
          onMessageSent={() => {
            if (selectedFollower) {
              setTopFollowersList((prev) =>
                sortByPriorityDesc(
                  prev.filter((f) => f.username !== selectedFollower.username)
                )
              );
            }
          }}
        />


      </div>
    </div>
  );
}
