// Mock Prisma Client first
const mockPrismaClient = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
};

// Mock DatabaseManager before importing userService
jest.mock('../../src/config/database', () => ({
  getInstance: jest.fn().mockReturnValue(mockPrismaClient),
}));

// Now import after mocking
import userService from '../../src/services/userService';
import { IUser } from '../../src/models/User';

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users sorted by id', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', age: 25, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' }
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Doe');
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(userService.getAllUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).not.toBeNull();
      expect(result?.name).toBe('John Doe');
    });

    it('should return null when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userService.getUserById(1)).rejects.toThrow('Failed to fetch user');
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      mockPrismaClient.user.count.mockResolvedValue(1);

      const result = await userService.emailExists('john@example.com');

      expect(mockPrismaClient.user.count).toHaveBeenCalledWith({
        where: { email: 'john@example.com' }
      });
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockPrismaClient.user.count.mockResolvedValue(0);

      const result = await userService.emailExists('nonexistent@example.com');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.count.mockRejectedValue(new Error('Database error'));

      await expect(userService.emailExists('test@example.com')).rejects.toThrow('Failed to check email');
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      const mockCreatedUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser('John Doe', 'john@example.com', 30);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: { name: 'John Doe', email: 'john@example.com', age: 30 }
      });
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(30);
    });

    it('should handle unique constraint errors', async () => {
      const uniqueError = new Error('Unique constraint failed');
      uniqueError.message = 'Unique constraint failed on the fields: (`email`)';
      mockPrismaClient.user.create.mockRejectedValue(uniqueError);

      await expect(userService.createUser('John Doe', 'existing@example.com', 30))
        .rejects.toThrow('Email already exists');
    });

    it('should handle other database errors', async () => {
      mockPrismaClient.user.create.mockRejectedValue(new Error('Other database error'));

      await expect(userService.createUser('John Doe', 'john@example.com', 30))
        .rejects.toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    it('should update and return user when user exists', async () => {
      const existingUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        name: 'John Updated',
        age: 31,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaClient.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, 'John Updated', 'john@example.com', 31);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'John Updated', email: 'john@example.com', age: 31 }
      });
      expect(result?.name).toBe('John Updated');
      expect(result?.age).toBe(31);
    });

    it('should return null when user does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.updateUser(999, 'John Updated', 'john@example.com', 31);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.update).not.toHaveBeenCalled();
    });

    it('should handle unique constraint errors on email', async () => {
      const existingUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const uniqueError = new Error('Unique constraint failed');
      uniqueError.message = 'Unique constraint failed on the fields: (`email`)';

      mockPrismaClient.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaClient.user.update.mockRejectedValue(uniqueError);

      await expect(userService.updateUser(1, 'John Updated', 'existing@example.com', 31))
        .rejects.toThrow('Email already exists');
    });

    it('should handle other database errors', async () => {
      const existingUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaClient.user.update.mockRejectedValue(new Error('Other database error'));

      await expect(userService.updateUser(1, 'John Updated', 'john@example.com', 31))
        .rejects.toThrow('Failed to update user');
    });
  });

  describe('deleteUser', () => {
    it('should delete and return true when user exists', async () => {
      const existingUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaClient.user.delete.mockResolvedValue(existingUser);

      const result = await userService.deleteUser(1);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.deleteUser(999);

      expect(result).toBe(false);
      expect(mockPrismaClient.user.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const existingUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaClient.user.delete.mockRejectedValue(new Error('Database error'));

      await expect(userService.deleteUser(1)).rejects.toThrow('Failed to delete user');
    });
  });

  describe('getFilteredUsers', () => {
    it('should filter users by name', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getFilteredUsers({ name: 'John' });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'John' } },
        orderBy: { id: 'asc' }
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });

    it('should filter users by email', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getFilteredUsers({ email: 'john@' });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { email: { contains: 'john@' } },
        orderBy: { id: 'asc' }
      });
      expect(result).toHaveLength(1);
    });

    it('should filter users by age range', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getFilteredUsers({ minAge: 25, maxAge: 35 });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { age: { gte: 25, lte: 35 } },
        orderBy: { id: 'asc' }
      });
      expect(result).toHaveLength(1);
    });

    it('should combine multiple filters', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getFilteredUsers({ 
        name: 'John', 
        email: 'example.com',
        minAge: 25,
        maxAge: 35 
      });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { 
          name: { contains: 'John' },
          email: { contains: 'example.com' },
          age: { gte: 25, lte: 35 }
        },
        orderBy: { id: 'asc' }
      });
      expect(result).toHaveLength(1);
    });

    it('should handle empty filters', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getFilteredUsers({});

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { id: 'asc' }
      });
      expect(result).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(userService.getFilteredUsers({ name: 'John' })).rejects.toThrow('Failed to filter users');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockUsers = [
        { age: 20 },
        { age: 30 },
        { age: 40 },
        { age: 60 }
      ];

      mockPrismaClient.user.count.mockResolvedValue(4);
      mockPrismaClient.user.aggregate.mockResolvedValue({
        _avg: { age: 37.5 }
      });
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getUserStats();

      expect(result.totalUsers).toBe(4);
      expect(result.averageAge).toBe(38); // rounded
      expect(result.ageDistribution).toHaveLength(4);
      expect(result.ageDistribution[0]).toEqual({ ageRange: '18-25', count: 1 });
      expect(result.ageDistribution[1]).toEqual({ ageRange: '26-35', count: 1 });
      expect(result.ageDistribution[2]).toEqual({ ageRange: '36-50', count: 1 });
      expect(result.ageDistribution[3]).toEqual({ ageRange: '50+', count: 1 });
    });

    it('should handle empty database', async () => {
      mockPrismaClient.user.count.mockResolvedValue(0);
      mockPrismaClient.user.aggregate.mockResolvedValue({
        _avg: { age: null }
      });
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      const result = await userService.getUserStats();

      expect(result.totalUsers).toBe(0);
      expect(result.averageAge).toBe(0);
      expect(result.ageDistribution).toEqual([
        { ageRange: '18-25', count: 0 },
        { ageRange: '26-35', count: 0 },
        { ageRange: '36-50', count: 0 },
        { ageRange: '50+', count: 0 }
      ]);
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.count.mockRejectedValue(new Error('Database error'));

      await expect(userService.getUserStats()).rejects.toThrow('Failed to get user statistics');
    });
  });
});
