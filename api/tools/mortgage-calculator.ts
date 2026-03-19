import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from './_handlers';
export default (req: VercelRequest, res: VercelResponse) => handler('mortgage-calculator', req, res);
