/**
 * Home screen
 *
 * Default Expo Router landing view. Feature routes belong under `screens/`.
 */

import { Text, View } from "react-native";

/** Placeholder home content using semantic theme tokens. */
export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans text-xl text-foreground">
        Edit src/app/index.tsx to edit this screen.
      </Text>
    </View>
  );
}
