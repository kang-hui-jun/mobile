import * as Icons from "@tamagui/lucide-icons";

// 建立映射表
export const IconMap = {
  E88A: Icons.Baby,
  File: Icons.File,
  E8A1: Icons.Settings,
  E046: Icons.Briefcase,
  Baby: Icons.Baby,
  E801: Icons.AArrowDown,
  E893: Icons.Activity,
  E7F1: Icons.BadgeHelp,
  A033: Icons.CalendarArrowUp,
};

export type IconName = keyof typeof IconMap;
