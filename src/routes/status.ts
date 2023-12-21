import { Router, Request, Response, json } from 'express';
const router = Router();
router.use(json());

router.get('/', async (req: Request, res: Response) => {
  res.status(200).send('is online');
});

export default router;