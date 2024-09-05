import playwright from "playwright";

export const getBrowser = async () => {
  const browser = await playwright.chromium.launch({
    // headless: false, 
  });

  return browser;
};
