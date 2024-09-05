import { DBCoupon, LogType } from "@/interfaces";
import { Browser } from "playwright";
import { logger } from "../helpers";
import { autoScroll } from "@/helpers";
import { navegation } from '../validation-production';

export interface ScrapePageProps {
  browser: Browser;
  url: string;
}

export type CouponScraped = Omit<DBCoupon, "commerce" | "category">;

export const scrapeExito = async ({ browser, url }: ScrapePageProps) => {
  let products: CouponScraped[] = [];
  
  try {

    //* Navega a la página
    const page = await browser.newPage();
    await page.goto(url, navegation);

    //* Obtener botón para cargar más productos
    await page.waitForSelector(".Pagination_nextPreviousLink__f7_2J");
    for (let i = 0; i < 4; i++) {
      await autoScroll(page);

      const data = await page.$$eval("article", (articles) =>
        articles.map((article: Element) => {
          const convertToNumber = (item: string | null | undefined) => {
            if (item) {
              const numericValue = item.replace(/[^\d]/g, "");
              return parseInt(numericValue, 10);
            } else {
              return 0;
            }
          };

          const linkElement = article.querySelector(
            ".productCard_productLinkInfo__It3J2"
          ) as HTMLAnchorElement;
          let linkHref = "";
          if (linkElement) {
            linkHref = linkElement.href;
          }

          const img = article.querySelector('img[src*="exitocol.vtexassets.com"]');

          let imgURL = "";
          if (img) {
            imgURL = img.getAttribute("src") ?? "";
          }

          const priceWithDiscount = article.querySelector(
            ".ProductPrice_container__price__XmMWA"
          );
          const priceWithoutDiscount = article.querySelector(
            ".priceSection_container-promotion_price-dashed__FJ7nI"
          );
          const priceWithCard = article.querySelector(".price_fs-price__7Y_0s");
          const discount = article.querySelector(
            'span[data-percentage="true"]'
          );
          const brandName = article.querySelector(
            ".BrandName_BrandNameTitle__Ain0w"
          );
          const title = article.querySelector(
            ".styles_name__qQJiK"
          )

          const body: CouponScraped = {
            name: title?.textContent!,
            url: linkHref,
            images: imgURL ? [imgURL] : [],
            lowPrice: convertToNumber(priceWithDiscount?.textContent),
            discountWithCard: convertToNumber(priceWithCard?.textContent),
            discountPercentage: convertToNumber(discount?.textContent),
            brandName: brandName?.textContent,
            priceWithoutDiscount: convertToNumber(
              priceWithoutDiscount?.textContent
            ),
          };
          return body;
        })
      );

      products = products.concat(data);

      const nextButton = await page.$('button[aria-label="Próxima Pagina"]');

      if (nextButton) {
        await nextButton.dispatchEvent("click");
      } else {
        break;
      }
    }

    
      // const nextButton = await page.$$('button[aria-label="Próxima Pagina"]');
      // const lastButton = nextButton.pop()

      // if (lastButton) {
      //   await lastButton.dispatchEvent("click");
      // } else {
      //   break;
      // }
      // }

    if (!products.length)
      throw new Error("No se encontraron productos en el scrapeo");

  } catch (error: any) {
    console.log(error)
    await logger(
      LogType.ERROR,
      error?.message ?? "No se pudo scrapear Exito",
      error
    );

    throw new Error(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    return products;
  }
};