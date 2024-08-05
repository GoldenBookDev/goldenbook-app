import React, { ReactNode } from "react";
import { TamaguiProvider } from "tamagui";
import config from "../../tamagui.config";

type ProviderProps = {
  children: ReactNode;
};

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return <TamaguiProvider config={config}>{children}</TamaguiProvider>;
};
