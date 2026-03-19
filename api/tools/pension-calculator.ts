import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from './_handlers';
export default (req: VercelRequest, res: VercelResponse) => handler('pension-calculator', req, res);
