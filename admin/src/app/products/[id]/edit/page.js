"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id;

  return <ProductForm isEdit={true} productId={id} />;
}
