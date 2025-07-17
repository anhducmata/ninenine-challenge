import { User, IUser, IUserInput, IUserFilters } from '../../src/models/User';

describe('User Model', () => {
  describe('User class constructor', () => {
    it('should create a user with all properties', () => {
      const now = new Date();
      const user = new User('John Doe', 'john@example.com', 30, 1, now, now);

      expect(user.id).toBe(1);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(30);
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });

    it('should create a user without optional properties', () => {
      const user = new User('Jane Doe', 'jane@example.com', 25);

      expect(user.id).toBeUndefined();
      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('jane@example.com');
      expect(user.age).toBe(25);
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });
  });

  describe('fromPrisma static method', () => {
    it('should create User instance from Prisma user object', () => {
      const now = new Date();
      const prismaUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: now,
        updatedAt: now
      };

      const user = User.fromPrisma(prismaUser);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(prismaUser.id);
      expect(user.name).toBe(prismaUser.name);
      expect(user.email).toBe(prismaUser.email);
      expect(user.age).toBe(prismaUser.age);
      expect(user.createdAt).toBe(prismaUser.createdAt);
      expect(user.updatedAt).toBe(prismaUser.updatedAt);
    });
  });

  describe('Interface compliance', () => {
    it('should comply with IUser interface', () => {
      const userData: IUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(userData.id).toBeDefined();
      expect(userData.name).toBeDefined();
      expect(userData.email).toBeDefined();
      expect(userData.age).toBeDefined();
    });

    it('should comply with IUserInput interface', () => {
      const userInput: IUserInput = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      expect(userInput.name).toBeDefined();
      expect(userInput.email).toBeDefined();
      expect(userInput.age).toBeDefined();
      // IUserInput doesn't have id property
    });

    it('should comply with IUserFilters interface', () => {
      const filters: IUserFilters = {
        name: 'John',
        email: 'john@',
        minAge: 18,
        maxAge: 65
      };

      expect(typeof filters.name).toBe('string');
      expect(typeof filters.email).toBe('string');
      expect(typeof filters.minAge).toBe('number');
      expect(typeof filters.maxAge).toBe('number');
    });

    it('should allow partial filters', () => {
      const filters: IUserFilters = {
        minAge: 18
      };

      expect(filters.minAge).toBe(18);
      expect(filters.name).toBeUndefined();
      expect(filters.email).toBeUndefined();
      expect(filters.maxAge).toBeUndefined();
    });
  });
});
