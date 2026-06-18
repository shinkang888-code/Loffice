"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Redirect() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const id = params.get("id");
    router.replace(id ? `/workspace?id=${id}` : "/");
  }, [params, router]);
  return null;
}

export default function ViewerRedirect() {
  return <Suspense><Redirect /></Suspense>;
}
