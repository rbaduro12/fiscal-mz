export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  ACCOUNTANT = 'ACCOUNTANT',
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  nuit?: string;
  phone?: string;
  companyName?: string;
  companyAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithoutPassword {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  nuit?: string;
  phone?: string;
  companyName?: string;
  companyAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
