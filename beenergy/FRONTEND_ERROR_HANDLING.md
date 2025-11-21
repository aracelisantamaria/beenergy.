# Guía Completa de Manejo de Errores - Frontend BeEnergy

## 📋 Tabla de Contenidos

1. [Errores de Contrato](#errores-de-contrato)
2. [Errores de Red](#errores-de-red)
3. [Errores de Wallet](#errores-de-wallet)
4. [Validación de Datos](#validación-de-datos)
5. [Estados de Transacciones](#estados-de-transacciones)
6. [Implementación Completa](#implementación-completa)

---

## 1️⃣ Errores de Contrato

### Códigos de Error Estructurados

```typescript
// Energy Distribution Contract Errors
enum DistributionError {
  NotEnoughApprovers = 1,      // No hay suficientes firmantes
  MemberPercentMismatch = 2,   // Cantidad de miembros ≠ cantidad de porcentajes
  PercentsMustSumTo100 = 3,    // Los porcentajes no suman 100%
  MembersNotInitialized = 4,   // Los miembros no han sido inicializados
}

// Mensajes amigables para el usuario (español/inglés)
const CONTRACT_ERROR_MESSAGES = {
  // Distribution Contract
  1: {
    title: "Faltan Firmas",
    message: "Se necesitan más firmas para aprobar esta operación. Asegúrate de que todos los miembros requeridos hayan firmado.",
    icon: "✍️"
  },
  2: {
    title: "Datos Incorrectos",
    message: "La cantidad de miembros no coincide con la cantidad de porcentajes proporcionados.",
    icon: "⚠️"
  },
  3: {
    title: "Porcentajes Inválidos",
    message: "Los porcentajes deben sumar exactamente 100%. Actualmente suman un valor diferente.",
    icon: "🔢"
  },
  4: {
    title: "Miembros No Registrados",
    message: "Primero debes registrar los miembros de la comunidad antes de distribuir energía.",
    icon: "👥"
  },
};
```

---

## 2️⃣ Errores de Red

### Detección de Conexión

```typescript
// Detectar si hay conexión a internet
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('✅ Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('❌ Sin conexión a internet', {
        duration: Infinity, // No desaparece automáticamente
        icon: '📡',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Usar en componentes
function App() {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="offline-banner">
        <span>📡 Sin conexión a internet</span>
        <p>Verifica tu conexión y vuelve a intentarlo</p>
      </div>
    );
  }

  return <YourApp />;
}
```

### Manejo de Timeouts de Red

```typescript
// Wrapper para requests con timeout
async function fetchWithTimeout(
  promise: Promise<any>,
  timeoutMs = 30000 // 30 segundos por defecto
) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
  );

  try {
    return await Promise.race([promise, timeout]);
  } catch (error: any) {
    if (error.message === 'TIMEOUT') {
      throw new Error('NETWORK_TIMEOUT');
    }
    throw error;
  }
}

// Uso con contratos
async function callContract() {
  try {
    const result = await fetchWithTimeout(
      contract.someMethod(),
      30000
    );
    return result;
  } catch (error: any) {
    if (error.message === 'NETWORK_TIMEOUT') {
      toast.error('⏱️ La operación está tardando demasiado. Verifica tu conexión.', {
        duration: 5000
      });
    }
    throw error;
  }
}
```

### Errores de RPC de Stellar

```typescript
const STELLAR_RPC_ERRORS = {
  'Failed to fetch': {
    title: 'Error de Conexión',
    message: 'No se pudo conectar a la red Stellar. Verifica tu conexión a internet.',
    icon: '🌐'
  },
  'Transaction simulation failed': {
    title: 'Transacción Inválida',
    message: 'La transacción no puede ejecutarse. Verifica los datos ingresados.',
    icon: '⚠️'
  },
  'Transaction has insufficient fee': {
    title: 'Fee Insuficiente',
    message: 'La tarifa de la transacción es muy baja. Intenta de nuevo.',
    icon: '💸'
  }
};
```

---

## 3️⃣ Errores de Wallet

### Errores de Freighter (Wallet de Stellar)

```typescript
const WALLET_ERRORS = {
  USER_REJECTED: {
    title: 'Transacción Cancelada',
    message: 'Cancelaste la transacción en tu wallet.',
    icon: '🚫',
    severity: 'info' // No es un error crítico
  },

  NOT_CONNECTED: {
    title: 'Wallet No Conectada',
    message: 'Por favor conecta tu wallet Freighter para continuar.',
    icon: '🔌',
    action: 'Conectar Wallet'
  },

  INSUFFICIENT_BALANCE: {
    title: 'Saldo Insuficiente',
    message: 'No tienes suficiente XLM para pagar la transacción.',
    icon: '💰',
    action: 'Agregar Fondos'
  },

  NETWORK_MISMATCH: {
    title: 'Red Incorrecta',
    message: 'Tu wallet está conectada a una red diferente. Cambia a Stellar Testnet.',
    icon: '🌐',
    action: 'Cambiar Red'
  }
};

// Detectar tipo de error de wallet
function handleWalletError(error: any) {
  const errorMessage = error.message?.toLowerCase() || '';

  if (errorMessage.includes('user declined')) {
    return WALLET_ERRORS.USER_REJECTED;
  }

  if (errorMessage.includes('not connected')) {
    return WALLET_ERRORS.NOT_CONNECTED;
  }

  if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
    return WALLET_ERRORS.INSUFFICIENT_BALANCE;
  }

  if (errorMessage.includes('network')) {
    return WALLET_ERRORS.NETWORK_MISMATCH;
  }

  // Error genérico de wallet
  return {
    title: 'Error de Wallet',
    message: 'Ocurrió un error con tu wallet. Intenta de nuevo.',
    icon: '❌'
  };
}
```

---

## 4️⃣ Validación de Datos

### Validación de Formularios

```typescript
interface ValidationError {
  field: string;
  message: string;
}

// Validar formulario de agregar miembros
function validateAddMembersForm(data: {
  approvers: string[];
  members: string[];
  percents: number[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validar que haya miembros
  if (data.members.length === 0) {
    errors.push({
      field: 'members',
      message: 'Debes agregar al menos un miembro'
    });
  }

  // Validar direcciones de Stellar válidas
  data.members.forEach((addr, index) => {
    if (!isValidStellarAddress(addr)) {
      errors.push({
        field: `member_${index}`,
        message: `Dirección inválida: ${addr.substring(0, 10)}...`
      });
    }
  });

  // Validar que coincidan las cantidades
  if (data.members.length !== data.percents.length) {
    errors.push({
      field: 'percents',
      message: 'Cada miembro debe tener un porcentaje asignado'
    });
  }

  // Validar que sumen 100
  const total = data.percents.reduce((sum, p) => sum + p, 0);
  if (total !== 100) {
    errors.push({
      field: 'percents',
      message: `Los porcentajes suman ${total}%. Deben sumar exactamente 100%`
    });
  }

  // Validar porcentajes positivos
  data.percents.forEach((percent, index) => {
    if (percent <= 0) {
      errors.push({
        field: `percent_${index}`,
        message: 'Los porcentajes deben ser mayores a 0'
      });
    }
  });

  // Validar firmantes suficientes
  const requiredApprovals = 3; // Obtener esto del contrato
  if (data.approvers.length < requiredApprovals) {
    errors.push({
      field: 'approvers',
      message: `Se requieren al menos ${requiredApprovals} firmantes`
    });
  }

  return errors;
}

// Validar dirección de Stellar
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}

// Mostrar errores de validación
function showValidationErrors(errors: ValidationError[]) {
  errors.forEach(error => {
    toast.error(error.message, {
      id: error.field, // Evita duplicados
      icon: '⚠️'
    });
  });
}
```

### Validación en Tiempo Real

```typescript
function MemberInput({ index, onChange }) {
  const [error, setError] = useState('');

  const validatePercent = (value: number) => {
    if (value < 0) {
      setError('El porcentaje no puede ser negativo');
      return false;
    }
    if (value > 100) {
      setError('El porcentaje no puede ser mayor a 100%');
      return false;
    }
    setError('');
    return true;
  };

  return (
    <div>
      <input
        type="number"
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          if (validatePercent(value)) {
            onChange(value);
          }
        }}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

---

## 5️⃣ Estados de Transacciones

### Sistema Completo de Estados

```typescript
type TxState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'pending'; message: string }
  | { status: 'success'; txHash: string; message: string }
  | { status: 'error'; error: Error; message: string };

function useTransaction() {
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const execute = async (fn: () => Promise<any>, messages: {
    validating?: string;
    pending?: string;
    success?: string;
    error?: string;
  }) => {
    try {
      // 1. Validando
      setState({ status: 'validating' });
      toast.loading(messages.validating || 'Validando datos...', {
        id: 'tx'
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Ejecutando
      setState({
        status: 'pending',
        message: messages.pending || 'Procesando transacción...'
      });
      toast.loading(messages.pending || 'Procesando transacción...', {
        id: 'tx'
      });

      const result = await fn();

      // 3. Éxito
      setState({
        status: 'success',
        txHash: result.hash,
        message: messages.success || '¡Transacción exitosa!'
      });
      toast.success(messages.success || '¡Transacción exitosa!', {
        id: 'tx',
        icon: '✅',
        duration: 5000
      });

      return result;

    } catch (error: any) {
      // 4. Error
      const errorInfo = parseError(error);
      setState({
        status: 'error',
        error,
        message: errorInfo.message
      });
      toast.error(errorInfo.message, {
        id: 'tx',
        icon: errorInfo.icon,
        duration: 6000
      });
      throw error;
    }
  };

  const reset = () => setState({ status: 'idle' });

  return { state, execute, reset };
}

// Uso en componente
function AddMembersButton() {
  const { state, execute } = useTransaction();

  const handleClick = async () => {
    await execute(
      () => distributionContract.add_members_multisig({
        approvers,
        members,
        percents
      }),
      {
        validating: '🔍 Verificando datos...',
        pending: '⏳ Registrando miembros en blockchain...',
        success: '✅ ¡Miembros registrados exitosamente!',
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={state.status !== 'idle'}
    >
      {state.status === 'idle' && 'Agregar Miembros'}
      {state.status === 'validating' && '🔍 Validando...'}
      {state.status === 'pending' && '⏳ Procesando...'}
      {state.status === 'success' && '✅ Completado'}
      {state.status === 'error' && '❌ Error'}
    </button>
  );
}
```

---

## 6️⃣ Implementación Completa

### Parser Centralizado de Errores

```typescript
interface ParsedError {
  title: string;
  message: string;
  icon: string;
  severity: 'error' | 'warning' | 'info';
  action?: string;
  actionHandler?: () => void;
}

function parseError(error: any): ParsedError {
  // 1. Sin internet
  if (!navigator.onLine) {
    return {
      title: 'Sin Conexión',
      message: 'No hay conexión a internet. Verifica tu red y vuelve a intentarlo.',
      icon: '📡',
      severity: 'error'
    };
  }

  // 2. Timeout
  if (error.message === 'NETWORK_TIMEOUT') {
    return {
      title: 'Tiempo Agotado',
      message: 'La operación está tardando demasiado. Verifica tu conexión.',
      icon: '⏱️',
      severity: 'warning'
    };
  }

  // 3. Errores de Wallet
  const walletError = handleWalletError(error);
  if (walletError) {
    return {
      ...walletError,
      severity: walletError.severity || 'error'
    };
  }

  // 4. Errores de Contrato
  const contractErrorCode = parseContractError(error);
  if (contractErrorCode && CONTRACT_ERROR_MESSAGES[contractErrorCode]) {
    const contractError = CONTRACT_ERROR_MESSAGES[contractErrorCode];
    return {
      ...contractError,
      severity: 'error'
    };
  }

  // 5. Errores de RPC
  for (const [key, value] of Object.entries(STELLAR_RPC_ERRORS)) {
    if (error.message?.includes(key)) {
      return {
        ...value,
        severity: 'error'
      };
    }
  }

  // 6. Error genérico
  return {
    title: 'Error Inesperado',
    message: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    icon: '❌',
    severity: 'error'
  };
}

// Helper para errores de contrato
function parseContractError(error: any): number | null {
  try {
    const match = error.message?.match(/Error\(Contract, #(\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}
```

### Componente de Notificación Universal

```typescript
import toast, { Toaster } from 'react-hot-toast';

function NotificationProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Configuración por defecto
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },

        // Estilos por tipo
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

// Mostrar error parseado
function showError(error: any) {
  const parsed = parseError(error);

  toast.error(
    <div>
      <strong>{parsed.title}</strong>
      <p>{parsed.message}</p>
      {parsed.action && (
        <button onClick={parsed.actionHandler}>
          {parsed.action}
        </button>
      )}
    </div>,
    {
      icon: parsed.icon,
      duration: parsed.severity === 'error' ? 6000 : 4000
    }
  );
}
```

### Ejemplo de Uso Completo

```typescript
function RecordGenerationButton() {
  const isOnline = useNetworkStatus();
  const { state, execute } = useTransaction();
  const [kwhInput, setKwhInput] = useState('');

  const handleSubmit = async () => {
    // 1. Validar input
    const kwh = parseFloat(kwhInput);
    if (isNaN(kwh) || kwh <= 0) {
      toast.error('⚠️ Ingresa una cantidad válida de kWh', {
        icon: '⚠️'
      });
      return;
    }

    // 2. Verificar conexión
    if (!isOnline) {
      toast.error('📡 Sin conexión a internet');
      return;
    }

    // 3. Ejecutar transacción
    try {
      await execute(
        () => distributionContract.record_generation({
          kwh_generated: Math.floor(kwh * 10_000_000) // Convertir a 7 decimales
        }),
        {
          validating: '🔍 Verificando datos...',
          pending: `⚡ Distribuyendo ${kwh} kWh entre los miembros...`,
          success: `✅ ¡${kwh} kWh distribuidos exitosamente!`,
        }
      );

      // Resetear form
      setKwhInput('');

    } catch (error) {
      // Los errores ya son manejados por execute()
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={kwhInput}
        onChange={(e) => setKwhInput(e.target.value)}
        placeholder="Cantidad de kWh generados"
        disabled={state.status !== 'idle' || !isOnline}
      />

      <button
        onClick={handleSubmit}
        disabled={state.status !== 'idle' || !isOnline}
      >
        {!isOnline && '📡 Sin conexión'}
        {isOnline && state.status === 'idle' && 'Distribuir Energía'}
        {state.status === 'validating' && '🔍 Validando...'}
        {state.status === 'pending' && '⏳ Distribuyendo...'}
        {state.status === 'success' && '✅ Completado'}
      </button>

      {state.status === 'success' && (
        <div className="success-message">
          Ver transacción en el explorador
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Resumen de Estados

| Estado | Icono | Color | Duración | Descripción |
|--------|-------|-------|----------|-------------|
| Validando | 🔍 | Azul | 500ms | Validando datos antes de enviar |
| Procesando | ⏳ | Amarillo | Variable | Transacción en blockchain |
| Éxito | ✅ | Verde | 5s | Transacción confirmada |
| Error | ❌ | Rojo | 6s | Error en la operación |
| Sin Internet | 📡 | Rojo | Infinito | No hay conexión |
| Cancelado | 🚫 | Gris | 3s | Usuario canceló |

---

## ✅ Checklist de Implementación

- [ ] Hook de detección de red (`useNetworkStatus`)
- [ ] Parser centralizado de errores (`parseError`)
- [ ] Mensajes de error traducidos (ES/EN)
- [ ] Validación de formularios en tiempo real
- [ ] Estados de transacción (idle, validating, pending, success, error)
- [ ] Manejo de errores de wallet
- [ ] Timeouts para requests de red
- [ ] Notificaciones toast (react-hot-toast)
- [ ] Códigos de error de contratos
- [ ] Mensajes de éxito personalizados
- [ ] Loading states en botones
- [ ] Banner de "Sin Conexión"

---

**¡Con esto tendrás un manejo de errores profesional y una UX excelente! 🚀**
