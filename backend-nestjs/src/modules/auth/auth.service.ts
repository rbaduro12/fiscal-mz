import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Utilizador, UserRole } from '../utilizadores/entities/utilizador.entity';
import { Empresa, RegimeIVA } from '../empresas/entities/empresa.entity';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nome: string;
  nomeEmpresa: string;
  nuit: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  empresaId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Utilizador)
    private utilizadorRepo: Repository<Utilizador>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Utilizador | null> {
    const user = await this.utilizadorRepo.findOne({
      where: { email },
      relations: ['empresa']
    });

    if (!user || !user.ativo) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    // Atualizar último acesso
    user.ultimoAcesso = new Date();
    await this.utilizadorRepo.save(user);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      empresaId: user.empresaId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        empresa: user.empresa ? {
          id: user.empresa.id,
          nomeFiscal: user.empresa.nomeFiscal,
          nuit: user.empresa.nuit,
        } : null,
      },
    };
  }

  async register(dto: RegisterDto) {
    // Verificar se email já existe
    const existingUser = await this.utilizadorRepo.findOne({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email já registado');
    }

    // Verificar se NUIT já existe
    const existingEmpresa = await this.empresaRepo.findOne({
      where: { nuit: dto.nuit }
    });

    if (existingEmpresa) {
      throw new ConflictException('NUIT já registado');
    }

    // Criar empresa
    const empresa = this.empresaRepo.create({
      nuit: dto.nuit,
      nomeFiscal: dto.nomeEmpresa,
      nomeComercial: dto.nomeEmpresa,
      regime: RegimeIVA.NORMAL,
      email: dto.email,
      ativo: true,
    });

    const empresaSalva = await this.empresaRepo.save(empresa);

    // Criar utilizador admin
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const utilizador = this.utilizadorRepo.create({
      empresaId: empresaSalva.id,
      email: dto.email,
      passwordHash: hashedPassword,
      nome: dto.nome,
      role: UserRole.ADMIN,
      ativo: true,
    });

    await this.utilizadorRepo.save(utilizador);

    return {
      message: 'Registo efectuado com sucesso',
      empresa: {
        id: empresaSalva.id,
        nome: empresaSalva.nomeFiscal,
        nuit: empresaSalva.nuit,
      },
    };
  }

  async validateToken(payload: JwtPayload): Promise<Utilizador> {
    return this.utilizadorRepo.findOne({
      where: { id: payload.sub },
      relations: ['empresa']
    });
  }
}
