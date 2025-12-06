"use client"

import * as React from "react"
import {
  AudioWaveform, BarChart,
  BookOpen,
  Bot,
  Command, FileBarChart,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart, Plug,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {useAuth} from "@/hooks/authContext";
import {useParams} from "next/navigation";

export function ProjectSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { id } = useParams()
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Conneczen",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Project",
        url: `/projects/${id}`,
        icon: SquareTerminal,
        items: [
          { title: "Dashboard", url: `/projects/${id}` },
          { title: "Reports", url: `/projects/${id}/reports` },
          { title: "LLM Visibility", url: `/projects/${id}/llm` },
          { title: "On-page SEO", url: `/projects/${id}/seo` },
        ],
      },
      {
        title: "Performance",
        url: `/projects/${id}/performance`,
        icon: PieChart,
        items: [
          { title: "Campaign Impact", url: `/projects/${id}/performance/campaign` },
          { title: "User Behavior", url: `/projects/${id}/performance/users` },
        ],
      },
      {
        title: "Narratives",
        url: `/projects/${id}/narratives`,
        icon: BookOpen,
        items: [
          { title: "Auto Summary", url: `/projects/${id}/narratives/summary` },
          { title: "Recommendations", url: `/projects/${id}/narratives/recommendations` },
        ],
      },
      {
        title: "Settings",
        url: `/projects/${id}/settings`,
        icon: Settings2,
        items: [
          { title: "General", url: `/projects/${id}/settings` },
          { title: "Integrations", url: `/projects/${id}/settings/integrations` },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  }
  // console.log("User111", user?.user_metadata);
  const userData = {
    name: user?.user_metadata.full_name,
    email: user?.user_metadata.email,
    avatar: user?.user_metadata.avatar_url,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
