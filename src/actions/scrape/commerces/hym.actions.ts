import { DBCoupon, LogType } from "@/interfaces";
import { Browser, ElementHandle } from "playwright";
import { logger, sleep } from "../helpers";
import { autoScroll } from "@/helpers";
import { navegation } from "../validation-production";

export interface ScrapePageProps {
  browser: Browser;
  url: string;
}

export type CouponScraped = Omit<DBCoupon, "commerce" | "category">;

export const scrapeHym = async ({ browser, url }: ScrapePageProps) => {
  let products: CouponScraped[] = [];

  try {
    //* Navega a la página
    const page = await browser.newPage();
    await page.goto(url,navegation);
    await page.waitForTimeout(5000); 
    await autoScroll(page);

   
    //* Primero se cargan todos los productos que se quieren scrapear
    let count = 0;

    do {
      let button = await page.$(
        ".vtex-button bw1 ba fw5 v-mid relative pa0 lh-solid br2 min-h-small t-action--small bg-action-primary b--action-primary c-on-action-primary hover-bg-action-primary hover-b--action-primary hover-c-on-action-primary pointer " // Selector que tiene el botón para cargar más productos
      );

      if (!button) break;

      button?.click();
      await page.waitForSelector(
        ".vtex-button bw1 ba fw5 v-mid relative pa0 lh-solid br2 min-h-small t-action--small bg-action-primary b--action-primary c-on-action-primary hover-bg-action-primary hover-b--action-primary hover-c-on-action-primary pointer "
      );
      await autoScroll(page);
      count += 1;
    } while (count <= 3);

    //* Acá se obtienen
    const data = await page.$$eval("section", (articles) =>
      articles.map((article) => {
        const convertToNumber = (item: string | null) => {
          if (item) {
            const numericValue = item.replace(/[^\d]/g, "");
            return parseInt(numericValue, 10);
          } else {
            return 0;
          }
        };

        const nameElement = article.querySelector(
          "span.vtex-product-summary-2-x-productBrand"
        );

        const linkElement = article.querySelector(
          "a.vtex-product-summary-2-x-clearLink"
        );

        const imagesElements = article.querySelectorAll(
          "img.vtex-product-summary-2-x-image"
        );

        const images: string[] = [];

        imagesElements.forEach((img) => {
          if (img) {
            images.push(img.getAttribute("src")!);
          }
        });

        const priceElement = article.querySelector(
          "span.vtex-product-price-1-x-sellingPrice"
        );

        const priceWithoutDiscountElement = article.querySelector(
          "span.vtex-product-price-1-x-listPriceValue"
        );

        const discountElement = article.querySelector(
          ".vtex-store-components-3-x-discountInsideContainer"
        );

        return {
          name: nameElement ? nameElement.textContent! : "",
          url: linkElement
            ? "https://co.hm.com" + linkElement.getAttribute("href")
            : "",
          images,
          lowPrice: convertToNumber(
            priceElement ? priceElement.textContent : ""
          ),
          discountPercentage: convertToNumber(
            discountElement ? discountElement.textContent : ""
          ),
          brandName: "H&M",
          priceWithoutDiscount: convertToNumber(
            priceWithoutDiscountElement
              ? priceWithoutDiscountElement.textContent!
              : ""
          ),
          discountWithCard: 0,
        };
      })
    );

    products = data;
    console.log(data)
  } catch (error: any) {
    await logger(
      LogType.ERROR,
      error?.message ?? "No se pudo scrapear H&M",
      error
    );

    throw new Error(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    return products;
  }
}