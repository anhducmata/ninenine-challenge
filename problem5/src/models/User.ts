import { User as PrismaUser } from '@prisma/client';

// User model - data structure with type definitions using Prisma generated types
export interface IUser {
  id?: number;
  name: string;
  email: string;
  age: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Input type for creating/updating users (without id and timestamps)
export interface IUserInput {
  name: string;
  email: string;
  age: number;
}

// User filters for search functionality
export interface IUserFilters {
  name?: string;
  email?: string;
  minAge?: number;
  maxAge?: number;
}

export class User implements IUser {
  public id?: number;
  public name: string;
  public email: string;
  public age: number;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    name: string,
    email: string,
    age: number,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.age = age;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert Prisma User to our User class
  public static fromPrisma(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.name,
      prismaUser.email,
      prismaUser.age,
      prismaUser.id,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}

export default User;
