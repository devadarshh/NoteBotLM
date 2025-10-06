"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useToast } from "@/components/ui/use-toast";
// import { useToast } from "@/components/ui/use-toast";
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
  // Using direct sonner toast here to avoid wrapper type inference issues with strict lint rules

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
            "relative h-auto w-full justify-start py-2.5 pl-2 pr-7 text-left font-normal",
            "rounded-md text-sm text-gray-700 transition-colors duration-150",
            "hover:bg-blue-50 hover:ring-1 hover:ring-blue-200",
            "data-[state=open]:bg-blue-50 data-[state=open]:text-gray-900 data-[state=open]:ring-1 data-[state=open]:ring-blue-200",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pr-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40",
          )}
        >
          <div className="flex items-center space-x-3 group-data-[collapsible=icon]:space-x-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="bg-gray-200 text-xs text-gray-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-medium text-gray-900">
                {user.name ?? "User"}
              </div>
              <div className="truncate text-[11px] leading-snug text-gray-500">
                {user.email}
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            comingSoon("Profile");
          }}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            comingSoon("Settings");
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/api/auth/signout"
            className="flex cursor-pointer items-center text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
