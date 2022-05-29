import {image} from "@tensorflow/tfjs";
import {optimizePhoto} from "./resizer";

const images = document.querySelectorAll('img');
const targetNode = document.body;
const imagesMap: Map<string, string> = new Map<string, string>()
const callback = async function(mutationList: MutationRecord[]) {
    for(let image of images){
        imageWorker(image);
    }
    for (let mutation of mutationList) {
        if (mutation.type === 'childList') {
            for(let addedNode of mutation.addedNodes) {
                if(addedNode instanceof HTMLImageElement ){ // else ignore image
                    imageWorker(addedNode);
                }

                if(addedNode instanceof HTMLCanvasElement && addedNode.width > 20 && addedNode.height > 20){ // else ignore image
                    console.log(`Canvas Element Added: ${addedNode.width}, ${addedNode.width}.`);
                }
            }
        }
        if(mutation.type === 'attributes') {
            if(mutation.target instanceof HTMLImageElement) {
                imageWorker(mutation.target);
            }
        }
    }

};

function imageWorker(image: HTMLImageElement) {
    if(image.getAttribute('handled') === "true") {
        return
    }
    if(image.width > 20 && image.height > 20 && !imagesMap.has(image.src)) {
        console.log(`New Image Added: ${image.src}, ${image.width}, ${image.width}.`);
        optimizePhoto(image);
        imagesMap.set(image.src, "done");
    }
}
// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
const config = { childList: true, subtree: true, attributes: true, characterData: true };

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
