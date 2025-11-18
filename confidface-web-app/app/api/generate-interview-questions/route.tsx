import { NextRequest } from "next/server";
import ImageKit from "imagekit";

var imagekit = new ImageKit({
    publicKey : "your_public_api_key",
    privateKey : "your_private_api_key",
    urlEndpoint : "https://ik.imagekit.io/your_imagekit_id/"
});

export async function POST(req:NextRequest) {
    
}