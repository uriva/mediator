"use client";

import Link from "next/link";
import { useAuth, db } from "@/lib/instant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, ShieldCheck, User, LogOut } from "lucide-react";

interface NavbarProps {
  onOpenCreate?: () => void;
  onOpenAuth?: () => void;
}

export function Navbar({ onOpenCreate, onOpenAuth }: NavbarProps) {
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shadow-2xs">
            <span className="text-xl">⚖️</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-foreground tracking-tight flex items-center gap-1.5">
              Mediator
              <Badge
                variant="outline"
                className="text-[10px] font-sans font-medium px-1.5 py-0 border-primary/30 text-primary bg-primary/5"
              >
                AI Assisted
              </Badge>
            </span>
            <span className="text-[11px] text-muted-foreground font-medium -mt-0.5 tracking-wide">
              Serene Dispute Resolution
            </span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3">
          {onOpenCreate && (
            <Button
              onClick={onOpenCreate}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs rounded-xl text-xs sm:text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Dispute</span>
            </Button>
          )}

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl border border-border/80 px-2.5 h-8 gap-2 text-xs font-medium hover:bg-muted transition-colors cursor-pointer outline-hidden">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="max-w-[120px] truncate sm:max-w-[200px]">
                  {user.email || "Active User"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                <DropdownMenuItem
                  onClick={() => db.auth.signOut()}
                  className="text-destructive focus:text-destructive gap-2 text-xs cursor-pointer rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAuth}
              className="rounded-xl border-border/80 gap-2 text-xs font-medium"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
