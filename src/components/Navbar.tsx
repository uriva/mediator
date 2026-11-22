"use client";

import Link from "next/link";
import { useAuth, db } from "@/lib/instant";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, User, LogOut } from "lucide-react";

interface NavbarProps {
  onOpenCreate?: () => void;
  onOpenAuth?: () => void;
}

export function Navbar({ onOpenCreate, onOpenAuth }: NavbarProps) {
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/85 backdrop-blur-md dark:border-neutral-900 dark:bg-neutral-950/85">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white dark:bg-neutral-100 dark:text-neutral-900">
            ᐧ
          </div>
          <span className="text-base font-semibold tracking-tight lowercase">
            mediator
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {onOpenCreate && (
            <Button
              onClick={onOpenCreate}
              size="sm"
              className="h-8 gap-1.5 rounded-full bg-neutral-900 px-3.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New session</span>
            </Button>
          )}

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-900" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 text-xs font-medium outline-hidden transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                <span className="max-w-[110px] truncate sm:max-w-[180px]">
                  {user.email || "you"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl p-1">
                <DropdownMenuItem
                  onClick={() => db.auth.signOut()}
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAuth}
              className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <User className="h-3.5 w-3.5" />
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
