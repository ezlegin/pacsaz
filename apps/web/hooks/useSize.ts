"use client";

import { useState } from "react";
import { DielineDimensions, Dimensions } from "@/lib/dielines/core/types";
import { DimensionKey } from "@/components/product/ProductDetails";

export function clamp(value: number, min: number) {
  if (value < min) return min;
  return value;
}

export function useSize(dimensions: DielineDimensions) {
  const { defaultDimensions, minDimensions } = dimensions;

  const [size, setSize] = useState<Dimensions>(defaultDimensions);

  const setDimension = (key: DimensionKey, value: number) => {
    setSize((prev) => ({
      ...prev,
      [key]: clamp(value, minDimensions[key]),
    }));
  };

  return {
    size,
    setDimension,
  };
}
