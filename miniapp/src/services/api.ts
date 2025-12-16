import Taro from '@tarojs/taro';

// 开发环境使用本地服务器，生产环境使用线上地址
// 部署到 Render 后请更新此地址
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sports-reading-social-api.onrender.com/api'
  : 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

async function request<T>(url: string, options: Taro.request.Option = {}): Promise<ApiResponse<T>> {
  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      header: {
        'Content-Type': 'application/json',
        ...options.header,
      },
      ...options,
    });
    return response.data as ApiResponse<T>;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: '网络请求失败' };
  }
}

// Youtube API
export const youtubeApi = {
  getVideos: (limit = 20, offset = 0) => 
    request(`/youtube/videos?limit=${limit}&offset=${offset}`),
};

// WeChat API
export const wechatApi = {
  login: (code: string) => 
    request('/wechat/login', { method: 'POST', data: { code } }),
  
  syncWeRun: (userId: number, sessionKey: string, encryptedData: string, iv: string) =>
    request('/wechat/werun', { 
      method: 'POST', 
      data: { userId, sessionKey, encryptedData, iv } 
    }),
  
  getActivities: (userId: number, limit = 30) =>
    request(`/wechat/activities/${userId}?limit=${limit}`),
};

// Social API
export const socialApi = {
  getPosts: (limit = 20, offset = 0) =>
    request(`/social/posts?limit=${limit}&offset=${offset}`),
  
  createPost: (userId: number, content: string, imageUrls: string[] = []) =>
    request('/social/posts', { 
      method: 'POST', 
      data: { userId, content, imageUrls } 
    }),
  
  deletePost: (postId: number, userId: number) =>
    request(`/social/posts/${postId}`, { 
      method: 'DELETE', 
      data: { userId } 
    }),
};

export default { youtubeApi, wechatApi, socialApi };
