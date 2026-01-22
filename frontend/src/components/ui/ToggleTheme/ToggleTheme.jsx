import { useEffect, useState } from "react";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import { Sun, Moon } from 'lucide-react';  

export default function ToggleTheme() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <ToggleSwitch
      value={isLightMode}
      onChange={toggleTheme}
      onLabel="Light Mode"
      offLabel="Dark Mode"
      onIcon={<Sun size={18}/>}  
      offIcon={<Moon size={18}/>} 
      enableIcons={true}   
    />
  );
}
