/**
 * 图片相关工具函数
 */

/**
 * 打开图片预览
 * @param imgUrl 图片URL或base64字符串
 */
export const openImagePreview = (imgUrl: string): void => {
  if (imgUrl.startsWith('data:image/')) {
    // 处理 base64 图片
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>图片预览</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #000; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                font-family: Arial, sans-serif;
              }
              img { 
                max-width: 100%; 
                max-height: 100%; 
                object-fit: contain; 
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
              }
              .close-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s;
              }
              .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            </style>
          </head>
          <body>
            <button class="close-btn" onclick="window.close()" title="关闭">×</button>
            <img src="${imgUrl}" alt="图片预览" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  } else {
    // 处理普通 URL 图片
    window.open(imgUrl, '_blank');
  }
};

/**
 * 检查是否为 base64 图片
 * @param url 图片URL
 * @returns boolean
 */
export const isBase64Image = (url: string): boolean => {
  return url.startsWith('data:image/');
};

/**
 * 获取图片文件大小（仅适用于 base64）
 * @param base64String base64字符串
 * @returns 文件大小（字节）
 */
export const getBase64ImageSize = (base64String: string): number => {
  if (!isBase64Image(base64String)) {
    return 0;
  }
  
  const base64Data = base64String.split(',')[1];
  if (!base64Data) {
    return 0;
  }
  
  // 计算 base64 解码后的大小
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 压缩 base64 图片
 * @param base64String base64字符串
 * @param quality 压缩质量 0-1
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns Promise<string> 压缩后的 base64 字符串
 */
export const compressBase64Image = (
  base64String: string,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isBase64Image(base64String)) {
      reject(new Error('不是有效的 base64 图片'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建 canvas 上下文'));
        return;
      }

      // 计算新的尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 base64
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    img.src = base64String;
  });
};