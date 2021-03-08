import domtoimage from 'dom-to-image'
import { saveAs } from 'file-saver'

export function exportImage() {
    const node: HTMLElement = document.getElementById('ad')

    domtoimage.toBlob(node)
        .then((blob) => {
            saveAs(blob, 'neogen-ad.png')
        });
}