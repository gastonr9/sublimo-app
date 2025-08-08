const canvasDownloader = (canvas: HTMLCanvasElement) => {
  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");

  link.href = dataURL;
  link.download = "Tshirt.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default canvasDownloader;
