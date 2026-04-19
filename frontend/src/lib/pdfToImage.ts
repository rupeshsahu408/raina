export async function pdfToImageBlob(file: File): Promise<Blob> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = Math.min(pdf.numPages, 5);

  const pageCanvases: HTMLCanvasElement[] = [];
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    pageCanvases.push(canvas);
  }

  const GAP = 24;
  const maxWidth = Math.max(...pageCanvases.map((c) => c.width));
  const totalHeight =
    pageCanvases.reduce((h, c) => h + c.height, 0) + GAP * (pageCanvases.length - 1);
  const stitched = document.createElement("canvas");
  stitched.width = maxWidth;
  stitched.height = totalHeight;
  const sCtx = stitched.getContext("2d")!;
  sCtx.fillStyle = "#f3f4f6";
  sCtx.fillRect(0, 0, maxWidth, totalHeight);
  let y = 0;
  for (const c of pageCanvases) {
    sCtx.drawImage(c, 0, y);
    y += c.height + GAP;
  }

  const compress = (canvas: HTMLCanvasElement, qualities: number[]): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const [q, ...rest] = qualities;
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("PDF page rendering failed."));
          if (blob.size <= 130 * 1024 || rest.length === 0) resolve(blob);
          else {
            const scale = Math.sqrt((130 * 1024) / blob.size);
            const scaled = document.createElement("canvas");
            scaled.width = Math.round(canvas.width * scale);
            scaled.height = Math.round(canvas.height * scale);
            scaled.getContext("2d")!.drawImage(canvas, 0, 0, scaled.width, scaled.height);
            compress(scaled, rest).then(resolve).catch(reject);
          }
        },
        "image/jpeg",
        q
      );
    });

  return compress(stitched, [0.9, 0.8, 0.7, 0.6]);
}
