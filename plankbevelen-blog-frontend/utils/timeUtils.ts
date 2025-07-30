/**
 * 时间处理工具函数
 */

/**
 * 格式化时间为相对时间（如：刚刚、5分钟前、2小时前等）
 * @param dateTime 时间字符串或Date对象
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(dateTime: string | Date): string {
  const now = new Date();
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
}

/**
 * 格式化时间为标准格式（如：2024-01-15 14:30）
 * @param dateTime 时间字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export function formatDateTime(dateTime: string | Date): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化时间为日期格式（如：2024年1月15日）
 * @param dateTime 时间字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateTime: string | Date): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}年${month}月${day}日`;
}

/**
 * 智能时间格式化：根据时间距离现在的长短选择合适的显示格式
 * @param dateTime 时间字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export function smartFormatTime(dateTime: string | Date): string {
  const now = new Date();
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // 7天内显示相对时间
  if (days < 7) {
    return formatRelativeTime(dateTime);
  }
  // 超过7天显示具体日期
  else {
    return formatDate(dateTime);
  }
}