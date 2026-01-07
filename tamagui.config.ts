import { config as configBase } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

const config = createTamagui(configBase);

// 提供类型定义以获得更好的开发体验
type Conf = typeof config;
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
