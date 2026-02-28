# FISCAL.MZ 2.0 - Mobile Flutter

Aplicativo mobile iOS/Android em Flutter 3.16 para FISCAL.MZ.

---

## 🚀 Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Flutter | 3.16 | Framework UI |
| Dart | 3.0+ | Linguagem |
| Riverpod | 2.4+ | State Management |
| Drift | 2.14+ | SQLite ORM |
| Workmanager | 0.5+ | Background Tasks |
| Mobile Scanner | 3.5+ | QR/Barcode |
| Firebase | Latest | Push Notifications |

---

## 📁 Estrutura (Clean Architecture)

```
lib/
├── core/                     # Configurações globais
│   ├── theme/               # Cores, estilos
│   └── utils/               # Formatters, helpers
├── data/
│   ├── database/            # Drift SQLite
│   ├── repositories/        # SyncRepository
│   └── sources/             # API Client, Payment Gateway
├── domain/
│   ├── entities/            # Freezed classes
│   └── services/            # FiscalCalculator
├── presentation/
│   ├── screens/             # UI Screens
│   ├── widgets/             # Componentes reutilizáveis
│   └── providers/           # Riverpod providers
└── main.dart
```

---

## 🎯 Funcionalidades Implementadas

### 1. Scanner Integrado
- **QR Code**: Validação de faturas B2B
- **EAN-13**: Adicionar produtos em cotações
- **OCR NUIT**: Extração de NUIT via ML Kit

### 2. Offline Queue Visual
- Lista de operações pendentes
- Cards arrastáveis (reordenar prioridade)
- Indicador de conflitos

### 3. Sync Engine
```
On App Open:
  1. PushQueue → Enviar operações pendentes
  2. PullDelta → Receber alterações
  3. ResolveConflicts → Server wins (fiscais)

Background (Workmanager):
  - Sync a cada 15min se houver operações pendentes
```

### 4. Payment Flows
- **Deep Link**: M-Pesa retorna ao app
- **Cash**: Upload de foto do comprovativo
- **Escrow**: Pagamento em garantia

### 5. Bluetooth Thermal Print
- Busca de dispositivos pareados
- Preview do recibo
- Template ESC/POS 58mm

---

## 🛠️ Instalação

```bash
# Instalar dependências
flutter pub get

# Gerar código (Drift, Freezed, Riverpod)
flutter pub run build_runner build --delete-conflicting-outputs

# Executar
flutter run

# Build Android
flutter build apk --release
flutter build appbundle --release

# Build iOS
flutter build ios --release
```

---

## 📱 Telas Principais

### CreateQuoteScreen (Wizard 3 Passos)

**Passo 1: Selecionar Cliente**
- Busca com debounce
- Scan NUIT via OCR
- Lista selecionável

**Passo 2: Adicionar Itens**
- Formulário de item
- Scanner EAN-13
- Lista com dismiss

**Passo 3: Revisão**
- Resumo cliente
- Lista de itens
- Totais calculados
- Seletor de validade

---

## 🗄️ Database (Drift)

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `tenants` | Empresas |
| `clientes` | Clientes B2B |
| `produtos` | Catálogo |
| `workflow_negociacoes` | Cotações |
| `proformas` | Pré-faturas |
| `pagamentos` | Transações |
| `documentos_fiscais` | FT, FR, NC |
| `sync_queue` | Fila de sync |

### Sync Queue

```dart
await database.addToQueue(
  entityType: 'Quote',
  entityId: quoteId,
  operation: 'INSERT',
  payload: {...},
  priority: 5,
);
```

---

## 💳 Payment Gateway

### M-Pesa
```dart
final gateway = MpesaGateway();

// Iniciar pagamento
final result = await gateway.initiatePayment(
  phoneNumber: '840000000',
  amount: 12500.00,
  reference: 'PROFORMA-001',
);

// Ouvir status
gateway.statusStream.listen((status) {
  if (status.status == 'success') {
    // Pagamento confirmado
  }
});
```

### Deep Link Config (Android)
```xml
<!-- AndroidManifest.xml -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="fiscal" android:host="payment" />
</intent-filter>
```

---

## 🔄 Sync Repository

```dart
final syncRepo = ref.read(syncRepositoryProvider);

// Sync manual
final result = await syncRepo.performSync();
print('Push: ${result.pushSucceeded}/${result.pushFailed}');
print('Pull: ${result.pullSucceeded}/${result.pullFailed}');

// Sync periódico
syncRepo.startPeriodicSync(interval: Duration(minutes: 15));

// Stream de progresso
syncRepo.syncProgressStream.listen((progress) {
  print('${progress.operation}: ${progress.percentage}%');
});
```

---

## 🎨 Widgets Custom

### FiscalCard
```dart
FiscalCard(
  child: Text('Conteúdo'),
  onTap: () {},
)
```

### StatusBadge
```dart
StatusBadge(
  status: 'Pendente',
  type: StatusType.warning,
  pulse: true,
)
```

---

## 🔐 Segurança

- **Biometria**: LocalAuth para aprovações caras
- **SecureStorage**: Tokens JWT
- **SQLite**: Dados criptografados em repouso (opcional)

---

## 📦 Build Config

```yaml
# pubspec.yaml
dependencies:
  flutter_riverpod: ^2.4.9
  drift: ^2.14.0
  workmanager: ^0.5.2
  mobile_scanner: ^3.5.5
  firebase_messaging: ^14.7.10
```

---

## 🧪 Testes

```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/

# Coverage
flutter test --coverage
```

---

## 📋 Checklist de Implementação

- [x] Estrutura Clean Architecture
- [x] Configuração Drift (SQLite)
- [x] SyncRepository com sync engine
- [x] Wizard de Cotação (3 passos)
- [x] Integração M-Pesa (deep links)
- [x] Widgets customizados
- [ ] Tela de Sincronização (offline queue visual)
- [ ] Integração Bluetooth Print
- [ ] OCR NUIT (ML Kit)
- [ ] Firebase Push Notifications
- [ ] Workmanager background sync

---

## 🔗 Deep Links

### Android
```bash
adb shell am start -a android.intent.action.VIEW \
  -d "fiscal://payment/callback?status=success&ref=123"
```

### iOS
```bash
xcrun simctl openurl booted "fiscal://payment/callback?status=success"
```
