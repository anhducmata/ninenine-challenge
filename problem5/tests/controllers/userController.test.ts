import { Request, Response } from 'express';
import * as userController from '../../src/controllers/userController';
import userService from '../../src/services/userService';
import { HTTP_STATUS, USER_ERROR_MESSAGES } from '../../src/constants';

// Mock the userService
jest.mock('../../src/services/userService');
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  let responseSend: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnThis();
    responseSend = jest.fn();
    
    mockResponse = {
      json: responseJson,
      status: responseStatus,
      send: responseSend,
    };

    mockRequest = {};
    
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users when no filters provided', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', age: 25 },
      ];

      mockRequest.query = {};
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getUsers(mockRequest as any, mockResponse as Response);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(responseJson).toHaveBeenCalledWith(mockUsers);
    });

    it('should return filtered users when filters provided', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 }
      ];

      mockRequest.query = {
        name: 'John',
        minAge: '25',
        maxAge: '35'
      };

      mockUserService.getFilteredUsers.mockResolvedValue(mockUsers);

      await userController.getUsers(mockRequest as any, mockResponse as Response);

      expect(mockUserService.getFilteredUsers).toHaveBeenCalledWith({
        name: 'John',
        email: undefined,
        minAge: 25,
        maxAge: 35
      });
      expect(responseJson).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle service errors', async () => {
      mockRequest.query = {};
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

      await userController.getUsers(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.DATABASE_ERROR
      });
    });
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 };
      
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUser(mockRequest as any, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(responseJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.USER_NOT_FOUND
      });
    });

    it('should return 400 for invalid ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await userController.getUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.INVALID_USER_DATA
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockRejectedValue(new Error('Database error'));

      await userController.getUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.DATABASE_ERROR
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 };
      
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      mockUserService.emailExists.mockResolvedValue(false);
      mockUserService.createUser.mockResolvedValue(mockUser);

      await userController.createUser(mockRequest as any, mockResponse as Response);

      expect(mockUserService.emailExists).toHaveBeenCalledWith('john@example.com');
      expect(mockUserService.createUser).toHaveBeenCalledWith('John Doe', 'john@example.com', 30);
      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(responseJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        name: '',
        email: 'invalid-email',
        age: -5
      };

      await userController.createUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.INVALID_USER_DATA
      });
    });

    it('should return 400 when email already exists', async () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'existing@example.com',
        age: 30
      };

      mockUserService.emailExists.mockResolvedValue(true);

      await userController.createUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      });
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      mockUserService.emailExists.mockResolvedValue(false);
      mockUserService.createUser.mockRejectedValue(new Error('Database error'));

      await userController.createUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.DATABASE_ERROR
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = { id: 1, name: 'John Updated', email: 'john@example.com', age: 31 };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'John Updated',
        email: 'john@example.com',
        age: 31
      };

      mockUserService.updateUser.mockResolvedValue(mockUser);

      await userController.updateUser(mockRequest as any, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, 'John Updated', 'john@example.com', 31);
      expect(responseJson).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        name: 'John Updated',
        email: 'john@example.com',
        age: 31
      };

      mockUserService.updateUser.mockResolvedValue(null);

      await userController.updateUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.USER_NOT_FOUND
      });
    });

    it('should return 400 for invalid ID', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = {
        name: 'John Updated',
        email: 'john@example.com',
        age: 31
      };

      await userController.updateUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.INVALID_USER_DATA
      });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: '',
        email: 'invalid-email',
        age: -5
      };

      await userController.updateUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.INVALID_USER_DATA
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'John Updated',
        email: 'john@example.com',
        age: 31
      };

      mockUserService.updateUser.mockRejectedValue(new Error('Database error'));

      await userController.updateUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.DATABASE_ERROR
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      mockUserService.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockRequest as any, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(responseSend).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.deleteUser.mockResolvedValue(false);

      await userController.deleteUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.USER_NOT_FOUND
      });
    });

    it('should return 400 for invalid ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await userController.deleteUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.INVALID_USER_DATA
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: '1' };
      mockUserService.deleteUser.mockRejectedValue(new Error('Database error'));

      await userController.deleteUser(mockRequest as any, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.DATABASE_ERROR
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        totalUsers: 10,
        averageAge: 32,
        ageDistribution: [
          { ageRange: '18-25', count: 2 },
          { ageRange: '26-35', count: 5 },
          { ageRange: '36-50', count: 2 },
          { ageRange: '50+', count: 1 }
        ]
      };

      mockUserService.getUserStats.mockResolvedValue(mockStats);

      await userController.getUserStats(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserStats).toHaveBeenCalledTimes(1);
      expect(responseJson).toHaveBeenCalledWith(mockStats);
    });

    it('should handle service errors', async () => {
      mockUserService.getUserStats.mockRejectedValue(new Error('Database error'));

      await userController.getUserStats(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(responseJson).toHaveBeenCalledWith({
        error: USER_ERROR_MESSAGES.DATABASE_ERROR
      });
    });
  });
});
