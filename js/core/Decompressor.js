// Native browser-based high-performance DEFLATE zip extractor using DecompressionStream API
export async function unzipGamestateAsync(zipArrayBuffer) {
  const view = new DataView(zipArrayBuffer);
  const uint8 = new Uint8Array(zipArrayBuffer);
  let ptr = 0;
  
  // Scan the zip archive binary footprint for the 'gamestate' file entry header
  while (ptr < uint8.length - 30) {
    // Check for local file header signature: 0x04034b50 (PK\x03\x04)
    if (view.getUint32(ptr, true) === 0x04034b50) {
      const compMethod = view.getUint16(ptr + 8, true);
      const compressedSize = view.getUint32(ptr + 18, true);
      const fileNameLen = view.getUint16(ptr + 26, true);
      const extraFieldLen = view.getUint16(ptr + 28, true);
      
      let fileName = "";
      const nameStart = ptr + 30;
      for (let i = 0; i < fileNameLen; i++) {
        fileName += String.fromCharCode(uint8[nameStart + i]);
      }
      
      const dataOffset = ptr + 30 + fileNameLen + extraFieldLen;
      
      if (fileName === "gamestate") {
        const compressedSlice = uint8.slice(dataOffset, dataOffset + compressedSize);
        
        if (compMethod === 8) {
          // Stream the raw bytes directly into the browser kernel's hardware-accelerated C++ decompressor
          const blob = new Blob([compressedSlice]);
          const decompressionStream = new DecompressionStream("deflate-raw");
          const decompressedStream = blob.stream().pipeThrough(decompressionStream);
          
          const response = new Response(decompressedStream);
          const buffer = await response.arrayBuffer();
          return new TextDecoder("utf-8").decode(buffer);
        } else if (compMethod === 0) {
          return new TextDecoder("utf-8").decode(uint8.slice(dataOffset, dataOffset + compressedSize));
        }
      }
      ptr = dataOffset + compressedSize;
    } else {
      ptr++;
    }
  }
  throw new Error("Target core file 'gamestate' not located within save zip structure.");
}
