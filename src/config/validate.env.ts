import dotenv from "dotenv";

export const validateEnv = (requiredProps: any) => {
  dotenv.config();
  let isEnvValid = true;

  for (let prop in requiredProps) {
    if (!process.env[prop]) {
      console.log(`Env ${prop} prop is missing.`);
      isEnvValid = false;
    }
  }

  return isEnvValid;
};
