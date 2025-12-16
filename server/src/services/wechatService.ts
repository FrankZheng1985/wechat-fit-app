import axios from 'axios';
import crypto from 'crypto';

const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

interface SessionResult {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 通过 code 换取 session_key 和 openid
 */
export async function code2Session(code: string): Promise<SessionResult> {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;
  
  const response = await axios.get<SessionResult>(url);
  return response.data;
}

/**
 * 解密微信加密数据（如微信运动数据）
 */
export function decryptData(sessionKey: string, encryptedData: string, iv: string): any {
  const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
  const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');

  const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
  decipher.setAutoPadding(true);
  
  let decoded = decipher.update(encryptedDataBuffer, undefined, 'utf8');
  decoded += decipher.final('utf8');
  
  return JSON.parse(decoded);
}

/**
 * 根据步数计算消耗的热量 (kcal)
 * 通用公式：步数 * 0.04 kcal
 */
export function calculateCalories(steps: number): number {
  return Math.round(steps * 0.04 * 100) / 100;
}

/**
 * 根据步数估算距离 (米)
 * 假设平均步幅 0.7 米
 */
export function calculateDistance(steps: number): number {
  return Math.round(steps * 0.7);
}
