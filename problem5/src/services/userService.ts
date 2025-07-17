import { PrismaClient } from '@prisma/client';
import { User, IUser, IUserInput, IUserFilters } from '../models/User';
import DatabaseManager from '../config/database';

class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseManager.getInstance();
  }

  // Get all users - type-safe with Prisma
  public async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { id: 'asc' }
      });
      return users.map(user => User.fromPrisma(user));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID - SQL injection impossible with Prisma
  public async getUserById(id: number): Promise<IUser | null> {
    try {
      // Prisma automatically validates and sanitizes the ID
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      return user ? User.fromPrisma(user) : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Check if email exists - type-safe query
  public async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email');
    }
  }

  // Create new user - validated input with Prisma schema
  public async createUser(
    name: string,
    email: string,
    age: number
  ): Promise<IUser> {
    try {
      const userData: IUserInput = { name, email, age };

      // Prisma handles validation and prevents SQL injection
      const user = await this.prisma.user.create({
        data: userData
      });

      return User.fromPrisma(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        throw new Error('Email already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  // Update user - type-safe update with validation
  public async updateUser(
    id: number,
    name: string,
    email: string,
    age: number
  ): Promise<IUser | null> {
    try {
      // First check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return null;
      }

      const userData: IUserInput = { name, email, age };

      // Prisma ensures type safety and prevents SQL injection
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: userData
      });

      return User.fromPrisma(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        throw new Error('Email already exists');
      }
      throw new Error('Failed to update user');
    }
  }

  // Delete user - safe deletion with existence check
  public async deleteUser(id: number): Promise<boolean> {
    try {
      // First check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return false;
      }

      // Prisma ensures safe deletion
      await this.prisma.user.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Enhanced filtering with type-safe queries (no SQL injection possible)
  public async getFilteredUsers(filters: IUserFilters): Promise<IUser[]> {
    try {
      // Build Prisma where clause with type safety
      const whereClause: any = {};

      if (filters.name) {
        // Prisma automatically escapes LIKE queries
        whereClause.name = {
          contains: filters.name
          // Note: SQLite doesn't support case insensitive contains natively
        };
      }

      if (filters.email) {
        whereClause.email = {
          contains: filters.email
        };
      }

      if (filters.minAge !== undefined || filters.maxAge !== undefined) {
        whereClause.age = {};

        if (filters.minAge !== undefined) {
          whereClause.age.gte = filters.minAge; // Greater than or equal
        }

        if (filters.maxAge !== undefined) {
          whereClause.age.lte = filters.maxAge; // Less than or equal
        }
      }

      // Execute type-safe query
      const users = await this.prisma.user.findMany({
        where: whereClause,
        orderBy: { id: 'asc' }
      });

      return users.map(user => User.fromPrisma(user));
    } catch (error) {
      console.error('Error filtering users:', error);
      throw new Error('Failed to filter users');
    }
  }

  // Additional security: Get user statistics (bonus feature)
  public async getUserStats(): Promise<{
    totalUsers: number;
    averageAge: number;
    ageDistribution: { ageRange: string; count: number }[];
  }> {
    try {
      const totalUsers = await this.prisma.user.count();

      const ageStats = await this.prisma.user.aggregate({
        _avg: {
          age: true
        }
      });

      // Age distribution query
      const users = await this.prisma.user.findMany({
        select: { age: true }
      });

      const ageDistribution = [
        {
          ageRange: '18-25',
          count: users.filter(u => u.age >= 18 && u.age <= 25).length
        },
        {
          ageRange: '26-35',
          count: users.filter(u => u.age >= 26 && u.age <= 35).length
        },
        {
          ageRange: '36-50',
          count: users.filter(u => u.age >= 36 && u.age <= 50).length
        },
        { ageRange: '50+', count: users.filter(u => u.age > 50).length }
      ];

      return {
        totalUsers,
        averageAge: Math.round(ageStats._avg.age || 0),
        ageDistribution
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }
}

export default new UserService();
