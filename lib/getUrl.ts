import { storage } from "@/appwrite";

const getUrl = async (image: Image) => {
    const url = storage.getFilePreview(image.buckedId, image.fileId);

    return url;
}

export default getUrl;