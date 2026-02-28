# 🛡️ Backup e Restauração - FISCAL.MZ

## ✅ Versão Estável Salva

**Data do backup:** 2026-02-27
**Versão:** v1.0.0-stable

### O que está incluído nesta versão:
- ✅ Landing page completa com marketing
- ✅ Sistema de autenticação JWT (Admin + Cliente)
- ✅ Dashboard do Cliente (minhas cotações, pagamentos, documentos)
- ✅ Dashboard do Admin (clientes, cotações, pagamentos, fiscal, relatórios)
- ✅ Design System Boho (Terracotta, Sage, Cream)
- ✅ Página de Relatórios com gráficos
- ✅ Backend NestJS estruturado

---

## 📍 Como Restaurar (se algo der errado)

### Opção 1 - Restaurar para a Tag (Recomendado)
```bash
# Descartar todas as alterações locais e voltar para versão estável
git stash
git checkout v1.0.0-stable

# OU criar uma nova branch a partir da versão estável
git checkout -b restauracao v1.0.0-stable
```

### Opção 2 - Resetar a main para versão estável
```bash
# ⚠️ CUIDADO: Isso apaga todas as alterações na main
git checkout main
git reset --hard v1.0.0-stable
git push origin main --force
```

### Opção 3 - Usar a branch de backup
```bash
# A branch backup/v1.0.0-stable sempre terá a versão estável
git checkout backup/v1.0.0-stable
```

---

## 📝 Comandos Úteis

### Ver todas as versões (tags)
```bash
git tag -l
```

### Comparar versões
```bash
git diff v1.0.0-stable main
```

### Salvar alterações atuais antes de restaurar
```bash
git stash push -m "alteracoes-em-andamento"
```

### Recuperar alterações stashed
```bash
git stash pop
```

---

## 🔄 Workflow Seguro para Alterações Grandes

1. **Antes de começar:**
   ```bash
   git checkout -b feature/nome-da-alteracao
   ```

2. **Durante o desenvolvimento:**
   ```bash
   git add .
   git commit -m "descrição das alterações"
   git push origin feature/nome-da-alteracao
   ```

3. **Se der errado:**
   ```bash
   git checkout main
   git checkout -b nova-tentativa v1.0.0-stable
   ```

4. **Se der certo:**
   ```bash
   git checkout main
   git merge feature/nome-da-alteracao
   git push origin main
   ```

---

## 📂 Estrutura de Branches

```
main                    ← versão atual (pode ter alterações)
backup/v1.0.0-stable    ← versão estável (NUNCA alterar)
v1.0.0-stable (tag)     ← versão estável imutável
```

---

## ⚠️ ATENÇÃO

- **NUNCA** faça push force na branch `backup/v1.0.0-stable`
- Sempre crie uma nova branch para testes arriscados
- Faça commits frequentes durante alterações grandes
