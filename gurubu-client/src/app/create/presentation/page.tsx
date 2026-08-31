"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CreatePresentation = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/presentation/dashboard');
  }, [router]);

  return null;
};

export default CreatePresentation;
