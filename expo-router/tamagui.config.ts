import { createFont } from "@tamagui/core";
import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/themes";
import { createTamagui } from "tamagui";

const bodyFont = createFont({
  family: "Inter",
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 22,
    7: 24,
    8: 26,
    9: 28,
    10: 30,
  },
  lineHeight: {
    1: 1.2,
    2: 1.3,
    3: 1.4,
    4: 1.5,
    5: 1.6,
    6: 1.7,
    7: 1.8,
    8: 1.9,
    9: 2.0,
    10: 2.1,
  },
  weight: {
    1: "300",
    2: "400",
    3: "500",
    4: "600",
    5: "700",
  },
  letterSpacing: {
    1: 0,
    2: 0.5,
    3: 1,
    4: 1.5,
    5: 2,
  },
  transform: {
    1: "none",
    2: "capitalize",
    3: "uppercase",
    4: "lowercase",
  },
  face: {
    300: { normal: "Inter-Light", italic: "Inter-LightItalic" },
    400: { normal: "Inter-Regular", italic: "Inter-Italic" },
    500: { normal: "Inter-Medium", italic: "Inter-MediumItalic" },
    600: { normal: "Inter-SemiBold", italic: "Inter-SemiBoldItalic" },
    700: { normal: "Inter-Bold", italic: "Inter-BoldItalic" },
  },
});

const config = createTamagui({
  themes,
  tokens,
  shorthands,
  fonts: {
    body: bodyFont,
  },
});

export default config;
