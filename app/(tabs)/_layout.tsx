import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/store";
import { Pressable } from "react-native";
import { CalendarCheck, UserRoundMinus } from "@tamagui/lucide-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "首页",
          headerTitle: "首页",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
          // 自定义左侧按钮
          headerLeft: () => (
            <Pressable
              onPress={() => console.log("Left Clicked")}
              style={{ marginLeft: 15 }}
            >
              <IconSymbol name="person.circle" size={24} color="#000" />
            </Pressable>
          ),
          // 自定义右侧按钮
          headerRight: () => (
            <Pressable
              onPress={() => console.log("Right Clicked")}
              style={{ marginRight: 15 }}
            >
              <IconSymbol name="bell" size={24} color="#000" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="application"
        options={{
          tabBarLabel: "应用",
          headerTitle: "应用",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="app" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          tabBarLabel: "代办",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            // <IconSymbol size={24} name="paperplane.fill" color={color} />
            <CalendarCheck size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          tabBarLabel: "我的",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            // <IconSymbol size={24} name="paperplane.fill" color={color} />
            <UserRoundMinus size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
