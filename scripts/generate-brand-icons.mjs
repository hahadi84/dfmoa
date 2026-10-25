import fs from "node:fs/promises";
import sharp from "sharp";
const source=await fs.readFile("src/app/icon.svg");
await fs.mkdir("public/brand",{recursive:true});
for(const size of [32,180,192,512]) await sharp(source).resize(size,size).png().toFile(size===180?"public/apple-touch-icon.png":`public/brand/icon-${size}.png`);
const sizes=[16,32,48];const images=await Promise.all(sizes.map(size=>sharp(source).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
images.forEach((png,i)=>{const start=6+16*i;header[start]=sizes[i];header[start+1]=sizes[i];header.writeUInt16LE(1,start+4);header.writeUInt16LE(32,start+6);header.writeUInt32LE(png.length,start+8);header.writeUInt32LE(offset,start+12);offset+=png.length;});
await fs.writeFile("src/app/favicon.ico",Buffer.concat([header,...images]));
