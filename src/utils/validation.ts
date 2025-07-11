
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Longitud mínima de 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
  // Acepta cualquier carácter especial (no solo letras, números y espacios)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\W]{8,}$/;
  return passwordRegex.test(password);
};

export const getPasswordRequirements = (t: (key: string) => string): string => {
  return t('auth.passwordRequirements');
};