import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import pool from '../models/db';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'chatappsecretkey';
const randomImages = [
    'https://randomuser.me/api/portraits/men/11.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/13.jpg',
    'https://randomuser.me/api/portraits/women/14.jpg',
    'https://randomuser.me/api/portraits/men/15.jpg',
    'https://randomuser.me/api/portraits/women/16.jpg',
    'https://randomuser.me/api/portraits/men/17.jpg',
    'https://randomuser.me/api/portraits/women/18.jpg',
    'https://randomuser.me/api/portraits/men/19.jpg',
    'https://randomuser.me/api/portraits/women/20.jpg',
];

export const register = async (req: Request, res: Response) => {
    const {username, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];

        const result = await pool.query(
            'INSERT INTO users (username, email, password, profile_image) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, randomImage]
        );
        const user = result.rows[0];
        res.status(201).json({user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Failed to register user'});
    }
}

export const login = async (req: Request, res: Response): Promise<any> => {
    const {email, password} = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '10h'});

        let finalResult = {...user, token};
        res.status(200).json({user: finalResult});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Failed to login user'});
    }
}