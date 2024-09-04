interface ImageSize {
  width: number
  height: number
}

/**
 * 获取图片的原始宽高
 * @param src 图片地址
 */
export const getImageSize = (src: string): Promise<ImageSize> => {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.src = src
    img.style.opacity = '0'
    document.body.appendChild(img)

    img.onload = () => {
      const imgWidth = img.clientWidth
      const imgHeight = img.clientHeight
    
      img.onload = null
      img.onerror = null

      document.body.removeChild(img)

      resolve({ width: imgWidth, height: imgHeight })
    }

    img.onerror = () => {
      img.onload = null
      img.onerror = null
    }
  })
}

/**
 * 读取图片文件的dataURL
 * @param file 图片文件
 */
export const getImageDataURL = (file: File): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.readAsDataURL(file)
  })
}
// interface Headers{
//   Authorization:string
// }
export const uploadImage  = (file: File,token:string): Promise<string> => {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    var url = location.protocol + "//" + location.host  + "/api/common/upload"
    xhr.open('POST', url);
    // 额外的请求头
    xhr.setRequestHeader("Authorization", token);
    var data = new FormData();
    // 要上传的图片文件
    data.append('file', file, file.name || '');

    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var res = JSON.parse(xhr.responseText);
                var url = res.responseData.fileUri;
                if (url) {
                    resolve(url); // 给上传的后的地址
                } else {
                    reject('image upload error');
                }
            } else {
                reject('image upload error');
            }
        }
    };
});
}

/**
 * 判断是否为SVG代码字符串
 * @param text 待验证文本
 */
export const isSVGString = (text: string): boolean => {
  const svgRegex = /<svg[\s\S]*?>[\s\S]*?<\/svg>/i
  if (!svgRegex.test(text)) return false

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'image/svg+xml')
    return doc.documentElement.nodeName === 'svg'
  } 
  catch {
    return false
  }
}

/**
 * SVG代码转文件
 * @param svg SVG代码
 */
export const svg2File = (svg: string): File => {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  return new File([blob], `${Date.now()}.svg`, { type: 'image/svg+xml' })
}