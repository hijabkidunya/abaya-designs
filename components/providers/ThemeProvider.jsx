"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setTheme } from "@/lib/features/theme/themeSlice"

export default function ThemeProvider({ children }) {
  const theme = useSelector((state) => state.theme.mode)
  const dispatch = useDispatch()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    dispatch(setTheme(savedTheme))
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return <>{children}</>
}
