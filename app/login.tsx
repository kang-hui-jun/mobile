import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/store";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login({
        mobilePhone: "18720240117",
        password: "123456",
        device: "iPhone",
        appvver: "no version",
        organizationId: "000-423d05b2-06e2-4a2b-a6d6-f1b024ceaf7f",
      });
      router.replace("/");
    } catch (error) {}
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <ThemedText type="defaultSemiBold">login</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
