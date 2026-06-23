"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GraduationCap, LayoutDashboard, Users, ChevronRight, Menu, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50" : "bg-transparent border-transparent"
      )}
    >
      <div className="w-full max-w-[1440px] mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
            <GraduationCap size={20} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-gray-900">EduOps</span>
        </Link>

        {/* Desktop Nav - Hidden on mobile, visible on md and up */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-1 lg:gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-slate-100/50 cursor-pointer text-sm lg:text-base font-semibold text-slate-700")}>
                  <Link href="/tinh-nang">Tính năng</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100/50 cursor-pointer text-sm lg:text-base")}>
                  <Link href="/doi-tuong">Mô hình</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100/50 cursor-pointer text-sm lg:text-base")}>
                  <Link href="/blog">Kiến thức</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Button variant="ghost" className="hover:bg-gray-100/50 text-gray-700 text-sm lg:text-base">
            Đăng nhập
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all rounded-full px-4 lg:px-6 text-sm lg:text-base">
            Dùng thử
            <ChevronRight size={16} className="ml-1 hidden lg:inline-block" />
          </Button>
        </div>

        {/* Mobile Hamburger Menu (visible below md) */}
        <div className="md:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-900">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] bg-white p-6 shadow-2xl flex flex-col border-l-0">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                    <GraduationCap size={22} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-gray-900">EduOps</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden -mx-2 px-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 px-3">Menu Chính</h4>
                  
                  <Link href="/tinh-nang" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-base font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 p-3 rounded-2xl transition-all group">
                    <div className="bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 p-2.5 rounded-xl transition-colors">
                      <LayoutDashboard size={20} />
                    </div>
                    Bảng tính năng
                  </Link>
                  
                  <Link href="/doi-tuong" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-base font-semibold text-gray-700 hover:text-orange-700 hover:bg-orange-50 p-3 rounded-2xl transition-all group">
                    <div className="bg-gray-100 group-hover:bg-orange-100 text-gray-500 group-hover:text-orange-600 p-2.5 rounded-xl transition-colors">
                      <Target size={20} />
                    </div>
                    Giải pháp mô hình
                  </Link>
                  
                  <Link href="/blog" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-base font-semibold text-gray-700 hover:text-purple-700 hover:bg-purple-50 p-3 rounded-2xl transition-all group">
                    <div className="bg-gray-100 group-hover:bg-purple-100 text-gray-500 group-hover:text-purple-600 p-2.5 rounded-xl transition-colors">
                      <BookOpen size={20} />
                    </div>
                    Thư viện kiến thức
                  </Link>
                </div>
                
                <div className="mt-auto pt-8 pb-4">
                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Sẵn sàng bứt phá?</h4>
                    <p className="text-sm text-gray-500 mb-4">Trải nghiệm toàn bộ tính năng cao cấp miễn phí trong 14 ngày.</p>
                    <Button className="w-full justify-center h-12 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all">
                      Dùng thử ngay
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="w-full justify-center h-12 text-base font-medium rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                    Đăng nhập tài khoản
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50 group",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">{icon}</div>}
            <div>
              <div className="text-sm font-semibold leading-none text-gray-900 mb-1">{title}</div>
              <p className="line-clamp-2 text-xs leading-snug text-gray-500">
                {children}
              </p>
            </div>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
