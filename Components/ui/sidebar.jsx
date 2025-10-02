import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarProvider = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

const Sidebar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-64 h-screen", className)}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, asChild = false, children, ...props }, ref) => {
  if (asChild) {
    // Se asChild, retornar apenas os children sem wrapper
    return <>{children}</>
  }
  
  return (
    <button
      ref={ref}
      className={cn("w-full text-left", className)}
      {...props}
    >
      {children}
    </button>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("inline-flex items-center justify-center", className)}
    {...props}
  >
    ☰
  </button>
))
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} 