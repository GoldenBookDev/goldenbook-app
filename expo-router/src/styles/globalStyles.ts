// src/styles/globalStyles.ts
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF", // Fondo blanco para mejor contraste
  },
  text: {
    color: "#333333", // Color de texto oscuro para mejor legibilidad
    fontSize: 16,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    marginVertical: 8,
    borderRadius: 4,
  },
  button: {
    width: "100%",
    padding: 10,
    backgroundColor: "#007BFF",
    alignItems: "center",
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
