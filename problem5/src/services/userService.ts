import { PrismaClient } from '@prisma/client';
import { User, IUser, IUserInput, IUserFilters } from '../models/User';
import DatabaseManager from '../config/database';
import { LogMethod, HandleErrors, Monitor, ValidateInput } from '../aspects/decorators';
import { ValidationRules } from '../aspects/validation';
import { USER_ERROR_MESSAGES } from '../constants/userErrorMessages';

class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseManager.getInstance();
  }

  // Get all users - type-safe with Prisma
  @LogMethod
  @Monitor
  @HandleErrors('fetch_users')
  public async getAllUsers(): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' }
    });
    return users.map(user => User.fromPrisma(user));
  }

  // Get user by ID - SQL injection impossible with Prisma
  @LogMethod
  @Monitor
  @HandleErrors('fetch_user')
  @ValidateInput(ValidationRules.validateUserId)
  public async getUserById(id: number): Promise<IUser | null> {
    // Prisma automatically validates and sanitizes the ID
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    return user ? User.fromPrisma(user) : null;
  }

  // Check if email exists - type-safe query
  @LogMethod
  @Monitor
  @HandleErrors('check_email')
  @ValidateInput(ValidationRules.validateEmail)
  public async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email }
    });
    return count > 0;
  }

  // Create new user - validated input with Prisma schema
  @LogMethod
  @Monitor
  @HandleErrors('create_user')
  @ValidateInput(ValidationRules.validateUserCreation)
  public async createUser(
    name: string,
    email: string,
    age: number
  ): Promise<IUser> {
    const userData: IUserInput = { name, email, age };

    // Prisma handles validation and prevents SQL injection
    const user = await this.prisma.user.create({
      data: userData
    });

    return User.fromPrisma(user);
  }

  // Update user - type-safe update with validation
  @LogMethod
  @Monitor
  @HandleErrors('update_user')
  @ValidateInput(ValidationRules.validateUserUpdate)
  public async updateUser(
    id: number,
    name: string,
    email: string,
    age: number
  ): Promise<IUser | null> {
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
  }

  // Delete user - safe deletion with existence check
  @LogMethod
  @Monitor
  @HandleErrors('delete_user')
  @ValidateInput(ValidationRules.validateUserId)
  public async deleteUser(id: number): Promise<boolean> {
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
  }

  // Enhanced filtering with type-safe queries (no SQL injection possible)
  @LogMethod
  @Monitor
  @HandleErrors('filter_users')
  public async getFilteredUsers(filters: IUserFilters): Promise<IUser[]> {
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
  }

  // Additional security: Get user statistics (bonus feature)
  @LogMethod
  @Monitor
  @HandleErrors('get_stats')
  public async getUserStats(): Promise<{
    totalUsers: number;
    averageAge: number;
    ageDistribution: { ageRange: string; count: number }[];
  }> {
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
  }
}

export default new UserService();
