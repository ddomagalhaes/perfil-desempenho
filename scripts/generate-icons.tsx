import { writeFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

const HERO_GREEN = "#2d6a4f";

function Mark({ size, padding }: { size: number; padding: number }) {
  const inner = size - padding * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: HERO_GREEN,
      }}
    >
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.4}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v17M3.5 12h17" opacity="0.45" />
        <circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none" />
      </svg>
    </div>
  );
}

async function renderPng(node: React.ReactElement, size: number, outPath: string) {
  const response = new ImageResponse(node, { width: size, height: size });
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outPath, buffer);
  console.log("Gerado:", outPath);
}

async function main() {
  await renderPng(<Mark size={192} padding={28} />, 192, "public/icon-192.png");
  await renderPng(<Mark size={512} padding={76} />, 512, "public/icon-512.png");
  // Ícone "maskable": o SO pode recortar até uma zona segura central de 80%,
  // por isso o motivo tem de ter mais respiro à volta do que os ícones normais.
  await renderPng(<Mark size={512} padding={128} />, 512, "public/icon-maskable-512.png");
  // Vai para app/, não public/ — é a convenção de ficheiro do Next para o
  // apple-touch-icon (só app/**/* é reconhecido automaticamente).
  await renderPng(<Mark size={180} padding={26} />, 180, "app/apple-icon.png");
}

main();
