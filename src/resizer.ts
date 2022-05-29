const WIDTH_MAX_RESIZE = 128;
const HEIGHT_MAX_RESIZE = 128;
const axios = require('axios')
const pixelate = (image: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pixImage = new Image();
    pixImage.setAttribute('handled', 'true');
    pixImage.crossOrigin = "Anonymous";
    pixImage.src = image.src;
    pixImage.onload = function () {
        const size = 2 * 0.01,
            w = canvas.width * size,
            h = canvas.height * size;

        ctx?.drawImage(pixImage, 0, 0, w, h);

        ctx?.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
        ctx?.fillText('Not Allowed, Kishta!', 40, 40);
        image.src = canvas.toDataURL('image/jpg');
    }

}

const predict = async (blob: Blob, src: string, width: number, height: number): Promise<boolean> => {
    const form = new FormData();
    form.append('file', blob, 'file.jpg');
    form.append('src', src);
    form.append('width', width.toString());
    form.append('height', height.toString());
    try{
        const response = await axios.post('http://localhost:3000/predict', form);
        return response.data;
    } catch (e) {
        return false;
    }
}

export const optimizePhoto = (image: HTMLImageElement): void => {
    const img = new Image();
    img.setAttribute('handled', 'true');

    img.crossOrigin = "Anonymous";
    img.onload = function () {
        console.log('onload', image.width, image.height);
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if(image.width > WIDTH_MAX_RESIZE || image.height > HEIGHT_MAX_RESIZE) {
            const scaleBy = image.width >= image.height ? ScaleBy.Width : ScaleBy.Height;
            let sWidth: number;
            let sHeight: number;
            if(scaleBy === ScaleBy.Width) {
                sWidth = WIDTH_MAX_RESIZE;
                sHeight = (WIDTH_MAX_RESIZE / image.width) * image.height;
            } else {
                sHeight = HEIGHT_MAX_RESIZE;
                sWidth = (HEIGHT_MAX_RESIZE / image.height) * image.width;
            }
            ctx?.drawImage(img, 0 ,0 ,sWidth, sHeight);
            ctx?.drawImage(canvas, 0 ,0 ,sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            image.setAttribute('handled', 'true');
            canvas.toBlob(async (blob) => {
                if(!blob){
                    return
                }
                const shouldReplace = await predict(blob, image.src, image.width, image.height);
                if(shouldReplace){
                    pixelate(image);
                }
            })
        }
    }
    img.src = image.src;

};

enum ScaleBy {
    Width= "width",
    Height= "height"
}