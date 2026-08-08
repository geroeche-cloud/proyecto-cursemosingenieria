"use client";

import { ErrorDeZona } from "@/components/ui/ErrorDeZona";

export default function PanelError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDeZona {...props} volverA="/panel" etiqueta="Panel del embajador" zona="panel" />
  );
}
