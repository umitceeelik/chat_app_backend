import {Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(403).json({error: 'No token provided'});
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chatappsecretkey');
        req.user = decoded as {id: string};
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to authenticate token'});
    }
}