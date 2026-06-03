import { useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  Sparkles,
  Compass,
  PenSquare,
  BarChart3,
  Users,
  Trophy,
  Phone,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";

import logo from "../../assets/logo.png";

const NavListComponent = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Dummy states
  const isLogin = false;

  const notificationMenuRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = 3;

  const toggle = () => {};
  const handelLogout = () => {
    console.log("logout");
  };

  const getLinkClass = (isActive: boolean) =>
    `group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.18)]"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    }`;

  const getMobileLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
    }`;

  const navLinks = [
    {
      label: "HOME",
      path: "/",
      icon: Sparkles,
    },
    {
      label: "EXPLORE",
      path: "/explore",
      icon: Compass,
    },
    {
      label: "INSPIRING",
      path: "/story-inspiration",
      icon: PenSquare,
    },
    {
      label: "ANALYTICS",
      path: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: "COLLAB",
      path: "/collab",
      icon: Users,
    },
    {
      label: "LEADERBOARD",
      path: "/leaderboard",
      icon: Trophy,
    },
    {
      label: "CONTACT",
      path: "/contact-us",
      icon: Phone,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
      {/* Premium top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[78px] items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-10">

            {/* Logo */}
            <Link
              to="/"
              className="group relative flex items-center"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />

              <img
                src={logo}
                alt="StorySpark AI"
                className="relative h-10 w-auto object-contain transition duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    getLinkClass(isActive)
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={15}
                        className={`transition ${
                          isActive
                            ? "text-blue-400"
                            : "text-slate-500 group-hover:text-blue-400"
                        }`}
                      />

                      <span>{item.label}</span>

                      {/* active indicator */}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-[6px] h-[2px] rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center gap-2">

              {/* Help */}
              <button
                type="button"
                aria-label="Help Center"
                onClick={() => navigate("/help-center")}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
              >
                <HelpCircle
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />
              </button>

              {/* Notifications */}
              <div
                className="relative"
                ref={notificationMenuRef}
              >
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={toggle}
                  className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Bell
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-12"
                  />

                  {unreadCount > 0 && (
                    <>
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />

                      <span className="absolute right-0 top-0 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
                        {unreadCount}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Theme */}
              <button className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-300">
                <Moon
                  size={18}
                  className="transition-transform duration-500 group-hover:rotate-12"
                />
              </button>

              {/* Auth Buttons */}
              {isLogin ? (
                <button
                  onClick={handelLogout}
                  className="ml-2 inline-flex h-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-5 text-sm font-semibold text-red-300 transition-all duration-300 hover:bg-red-500/20"
                >
                  Logout
                </button>
              ) : (
                <div className="ml-2 flex items-center gap-2">

                  <Link to="/login">
                    <button className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-white">
                      Login
                    </button>
                  </Link>

                  <Link to="/signup">
                    <button className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/40">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <button
              type="button"
              aria-label={menuOpen ? "Close Menu" : "Open Menu"}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300"
            >
              {menuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="xl:hidden pb-5 animate-in fade-in slide-in-from-top-4 duration-300">

            <div className="mt-2 rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-2xl">

              <div className="flex flex-col gap-2">

                {navLinks.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      getMobileLinkClass(isActive)
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={17}
                          className={
                            isActive
                              ? "text-blue-400"
                              : "text-slate-500"
                          }
                        />

                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}

                <div className="mt-3 grid grid-cols-2 gap-2">

                  <Link to="/login">
                    <button className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-slate-300">
                      Login
                    </button>
                  </Link>

                  <Link to="/signup">
                    <button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 text-sm font-semibold text-white">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { isLoggedIn, removeUserInfo } from "../../services/auth.service";
import ThemeToggle from "../theme/theme_toggle.component";

const NavListComponent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const handleLogout = () => {
    removeUserInfo();
    setLoggedIn(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "text-white bg-slate-800/70"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0B1120]/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
        to="/"
        className="text-lg font-bold text-slate-800 dark:text-white"
        onClick={(e) => {
          if (window.location.pathname === "/") {
            e.preventDefault();

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }}
      >
        Spark-Story-AI
      </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/story-inspiration" className={linkClass}>
            Stories
          </NavLink>
          <NavLink to="/community" className={linkClass}>
            Community
          </NavLink>
          {loggedIn && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Login
            </Link>
          )}

          <button
            className="rounded-md px-2 py-1 text-slate-700 lg:hidden dark:text-slate-200"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="space-y-1 border-t border-slate-200/70 px-4 py-3 dark:border-white/10">
              <NavLink to="/" end className={linkClass}>Home</NavLink>
              <NavLink to="/explore" className={linkClass}>Explore</NavLink>
              <NavLink to="/story-inspiration" className={linkClass}>Stories</NavLink>
              <NavLink to="/community" className={linkClass}>Community</NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavListComponent;