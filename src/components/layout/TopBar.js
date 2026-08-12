// components/layout/TopBar.jsx
import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import CalendarDropdown from "@/components/ui/CalendarDropdown";
import NotificationsDropdown from "@/components/ui/NotificationsDropdown";
import UserGuideDropdown from "@/components/ui/UserGuideDropdown";
import SupportDropdown from "@/components/ui/SupportDropdown";
import SearchSection from "../ui/SearchSection";
import Button from "../ui/Button";
import { useRouter } from "next/router";
export default function TopBar() {
  const { isOpen } = useSidebar();
  const leftOffset = isOpen ? "16rem" : "4rem";
const router = useRouter();

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between
                 bg-[#F2F1FB] px-4 py-2 shadow-md transition-all duration-300 z-20"
      style={{ marginLeft: leftOffset }}
    >
      <div className="flex items-center">
        <Button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 shadow-sm text-sm font-medium"
        >
          Go to Dashboard
        </Button>
      </div>

      {/* <div className="flex-1 pr-4">
        <SearchSection
          placeholder="Global Search…"
          className="text-[#050038] hover:text-[#2B245C] cursor-pointer"
        />
      </div> */}

      {/* Wrap all icons in a single container that drives `color` */}
      <div className="flex items-center space-x-4 ">
        <CalendarDropdown className="text-[#050038] hover:text-[#2B245C] cursor-pointer" />
        {/* <NotificationsDropdown className="text-[#050038] hover:text-[#2B245C] cursor-pointer" /> */}
        {/* <UserGuideDropdown className="text-[#050038] hover:text-[#2B245C] cursor-pointer" />
        <SupportDropdown className="text-[#050038] hover:text-[#2B245C] cursor-pointer" /> */}
      </div>
    </header>
  );
}
