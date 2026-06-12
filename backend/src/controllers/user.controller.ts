import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { UserRepository } from '../repositories/user.repository';

const userRepo = new UserRepository();

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userRepo.findById(req.user!.id);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, bio, avatar } = req.body as { name?: string; bio?: string; avatar?: string };
    const user = await userRepo.update(req.user!.id, { name, bio, avatar });
    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (err) { next(err); }
};
