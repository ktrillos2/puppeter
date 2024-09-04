"use server";
import { commerceActions } from "@/actions";
import { CommerceSlugs } from "@/enums";
import { getBrowser, saveCoupons } from "./helpers";
import {
  exitoActions,
  metroActions,
  koajActions,
  hymActions,
  alkomprarActions,
  telegramActions,
} from "./commerces";
import { CouponScraped } from "./commerces/exito.actions";
import { DBCoupon } from "@/interfaces";

export const scrapeCommerceByCategory = async (
  commerceId: string,
  categoryId: string
): Promise<number> => {
  const commerce = await commerceActions.getCommerceById(commerceId);
  if (!commerce) throw new Error("El comercio seleccionado no existe");

  const { url, queries, slug } = commerce;

  const path = commerce?.categories.find(
    (e) => e.category === categoryId
  )?.path;

  let scrapUrl = `${url}/${path}/${queries}`;

  const browser = await getBrowser();

  const scraperProps = {
    browser,
    url: scrapUrl,
  };

  let products: CouponScraped[] = [];

  switch (slug) {
    case CommerceSlugs.EXITO:
      products = await exitoActions.scrapeExito(scraperProps);
      break;
    case CommerceSlugs.METRO:
      products = await metroActions.scrapeMetro(scraperProps);
      break;
    case CommerceSlugs.KOAJ:
      products = await koajActions.scrapeKoaj(scraperProps);
      break;
    case CommerceSlugs.HYM:
      products = await hymActions.scrapeHym(scraperProps);
      break;
    case CommerceSlugs.ALKOMPRAR:
      products = await alkomprarActions.scrapeAlkomprar(scraperProps);
      break;
    case CommerceSlugs.TELEGRAM:
      products = await telegramActions.scrapeTelegram(scraperProps);
      break;
    default:
      throw new Error("No hay acciones para este comercio");
  }

  const parsedProducts: DBCoupon[] = products.map((e) => ({
    ...e,
    commerce: commerceId,
    category: categoryId,
  }));

  const filteredProducts = Array.from(
    new Set(parsedProducts.map((div: DBCoupon) => JSON.stringify(div)))
  )
    .map((div: string) => JSON.parse(div) as DBCoupon)
    .filter(
      ({ priceWithoutDiscount, discountPercentage }) =>
        priceWithoutDiscount || discountPercentage
    );

  await saveCoupons({
    categoryId,
    commerceId,
    data: filteredProducts,
  });

  const totalProducts = filteredProducts.length;

  if (!totalProducts)
    throw new Error("No se encontraron productos en el scrapeo");

  return totalProducts;
};
