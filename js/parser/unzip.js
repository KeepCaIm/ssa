// parser/unzip.js

/**
 * Native browser-based high-performance DEFLATE zip extractor using DecompressionStream API.
 * Scans the archive and extracts only the target 'gamestate' file entry.
 * @param {ArrayBuffer} zipArrayBuffer 
 * @returns {Promise<string>} Unpacked gamestate text content
 */
export async function unzipGamestateAsync(zipArrayBuffer) {
  const view = new DataView(zipArrayBuffer);
  const uint8 = new Uint8Array(zipArrayBuffer);
  let ptr = 0;
  
  while (ptr < uint8.length - 30) {
    if (view.getUint32(ptr, true) === 0x04034b50) { // PK\x03\x04
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
          const blob = new Blob([compressedSlice]);
          const decompStream = new DecompressionStream("deflate-raw");
          const resStream = blob.stream().pipeThrough(decompStream);
          const response = new Response(resStream);
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
