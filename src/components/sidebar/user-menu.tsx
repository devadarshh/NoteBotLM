"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const comingSoon = (feature: string) => {
    toast("Coming soon", {
      description: `${feature} feature is not implemented yet.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "hover:bg-sidebar-accent h-auto w-full justify-start px-2 py-2 text-left font-normal",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
          )}
        >
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:gap-0">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
              <p className="text-sidebar-foreground truncate text-xs font-medium">
                {user.name ?? "User"}
              </p>
              <p className="text-muted-foreground truncate text-[10px]">
                {user.email}
              </p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            comingSoon("Profile");
          }}
          className="cursor-pointer text-sm"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            comingSoon("Settings");
          }}
          className="cursor-pointer text-sm"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/api/auth/signout"
            className="text-destructive flex cursor-pointer items-center text-sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
