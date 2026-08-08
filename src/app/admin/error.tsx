"use client";

import { ErrorDeZona } from "@/components/ui/ErrorDeZona";

export default function AdminError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDeZona {...props} volverA="/admin" etiqueta="Administración" zona="admin" />
  );
}
