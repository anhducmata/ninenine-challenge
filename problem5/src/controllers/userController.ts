import { Request, Response } from 'express';
import userService from '../services/userService';
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '../constants';
import { IUserFilters } from '../models/User';

interface CreateUserRequest extends Request {
  body: {
    name: string;
    email: string;
    age: number;
  };
}

interface UpdateUserRequest extends Request {
  params: {
    id: string;
  };
  body: {
    name: string;
    email: string;
    age: number;
  };
}

interface GetUserRequest extends Request {
  params: {
    id: string;
  };
}

interface FilterUsersRequest extends Request {
  query: {
    name?: string;
    email?: string;
    minAge?: string;
    maxAge?: string;
  };
}

// Basic input validation without external validator
function validateEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validateName(name: string): boolean {
  if (typeof name !== 'string') {
    return false;
  }
  return !!(name && name.trim().length > 0 && name.length <= 100);
}

function validateAge(age: number): boolean {
  return Number.isInteger(age) && age >= 0 && age <= 150;
}

// Create user
export async function createUser(
  req: CreateUserRequest,
  res: Response
): Promise<void> {
  try {
    const { name, email, age } = req.body;

    // Basic validation
    if (!validateName(name) || !validateEmail(email) || !validateAge(age)) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: USER_ERROR_MESSAGES.INVALID_USER_DATA });
      return;
    }

    // Check if email exists
    const emailAlreadyExists = await userService.emailExists(email);
    if (emailAlreadyExists) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS });
      return;
    }

    const user = await userService.createUser(name.trim(), email.trim(), age);
    res.status(HTTP_STATUS.CREATED).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: USER_ERROR_MESSAGES.DATABASE_ERROR });
  }
}

// Get all users or filtered users
export async function getUsers(
  req: FilterUsersRequest,
  res: Response
): Promise<void> {
  try {
    const { name, email, minAge, maxAge } = req.query;

    // If any filters are provided, use filtered search
    if (name || email || minAge || maxAge) {
      const filters: IUserFilters = {
        name: name?.trim(),
        email: email?.trim(),
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: maxAge ? parseInt(maxAge) : undefined
      };
      const users = await userService.getFilteredUsers(filters);
      res.json(users);
    } else {
      const users = await userService.getAllUsers();
      res.json(users);
    }
  } catch (error) {
    console.error('Error getting users:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: USER_ERROR_MESSAGES.DATABASE_ERROR });
  }
}

// Get user by id
export async function getUser(
  req: GetUserRequest,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: USER_ERROR_MESSAGES.INVALID_USER_DATA });
      return;
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: USER_ERROR_MESSAGES.USER_NOT_FOUND });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: USER_ERROR_MESSAGES.DATABASE_ERROR });
  }
}

// Update user
export async function updateUser(
  req: UpdateUserRequest,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const { name, email, age } = req.body;

    if (isNaN(id) || id <= 0) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: USER_ERROR_MESSAGES.INVALID_USER_DATA });
      return;
    }

    // Basic validation
    if (!validateName(name) || !validateEmail(email) || !validateAge(age)) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: USER_ERROR_MESSAGES.INVALID_USER_DATA });
      return;
    }

    const updatedUser = await userService.updateUser(
      id,
      name.trim(),
      email.trim(),
      age
    );

    if (!updatedUser) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: USER_ERROR_MESSAGES.USER_NOT_FOUND });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: USER_ERROR_MESSAGES.DATABASE_ERROR });
  }
}

// Delete user
export async function deleteUser(
  req: GetUserRequest,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: USER_ERROR_MESSAGES.INVALID_USER_DATA });
      return;
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: USER_ERROR_MESSAGES.USER_NOT_FOUND });
      return;
    }

    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: USER_ERROR_MESSAGES.DATABASE_ERROR });
  }
}

// Get user statistics (bonus feature showcasing ORM capabilities)
export async function getUserStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await userService.getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: USER_ERROR_MESSAGES.DATABASE_ERROR });
  }
}
