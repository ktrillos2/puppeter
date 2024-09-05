"use client";

import { useState } from "react";
import {
  couponLayout1,
  couponLayout2,
  couponLayout3,
  couponLayout4,
} from "@/helpers";
import { Card, CardFooter, Divider, Image } from "@nextui-org/react";
import { Coupon, CouponLayout } from "@/interfaces";
import { CouponImageEditor } from "./CouponImageEditor";
import { useToTransparentImage } from "@/hooks";

const LAYOUTS: CouponLayout[] = [
  {
    name: "Plantilla 1",
    layout: couponLayout1,
    size: { width: "993px", height: "550px" },
    image: "/coupons/layouts/layout-1.png",
  },
  {
    name: "Plantilla 2",
    layout: couponLayout2,
    size: { width: "1240px", height: "610px" },
    image: "/coupons/layouts/layout-2.png",
  },
  {
    name: "Plantilla 3",
    layout: couponLayout3,
    size: { width: "993px", height: "550px" },
    image: "/coupons/layouts/layout-3.png",
  },
  {
    name: "Plantilla 4",
    layout: couponLayout4,
    size: { width: "993px", height: "550px" },
    image: "/coupons/layouts/layout-4.png",
  },
];

interface Props {
  coupon: Coupon & { _id: string };
}

export const SelectLayout: React.FC<Props> = ({ coupon }) => {
  const [selectedLayout, setSelectedLayout] = useState<CouponLayout | null>(
    null
  );

  const { displayImage, isLoading: transparentIsLoading } =
    useToTransparentImage(coupon.images[0]);

  const clearSelection = () => setSelectedLayout(null);

  if (!selectedLayout) {
    return (
      <div className="grid gap-3">
        <h2 className="text-xl md:text-2xl font-bold">
          Selecciona una plantilla para crear el cupón
        </h2>
        <Divider />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAYOUTS.map((layout) => (
            <Card
              isPressable
              key={layout.name}
              onClick={() => setSelectedLayout(layout)}
            >
              <Image
                src={layout.image}
                alt={layout.name}
                width="100%"
                height="auto"
                className="rounded-b-none"
              />
              <CardFooter className="">
                <small>{layout.name}</small>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <CouponImageEditor
      displayImage={displayImage}
      transparentIsLoading={transparentIsLoading}
      coupon={coupon}
      selectedLayout={selectedLayout}
      clearSelection={clearSelection}
    />
  );
};

export default SelectLayout;
