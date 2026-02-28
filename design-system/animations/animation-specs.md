# FISCAL.MZ 2.0 - Especificação de Animações

## Guia Completo de Motion Design

---

## 🎯 Princípios de Animação

1. **Propósito**: Toda animação deve ter um objetivo claro (feedback, orientação, delight)
2. **Performance**: 60fps sempre, usar `transform` e `opacity`
3. **Consistência**: Mesmos valores de duração/curva para ações similares
4. **Acessibilidade**: Respeitar `prefers-reduced-motion`

---

## ⏱️ Tokens de Tempo

| Token | Valor | Uso |
|-------|-------|-----|
| `--duration-instant` | 0ms | Estado imediato |
| `--duration-fast` | 150ms | Micro-interações (hover, focus) |
| `--duration-normal` | 200ms | Transições padrão |
| `--duration-slow` | 300ms | Modais, drawers, expansões |
| `--duration-slower` | 500ms | Animações complexas, sucesso |

---

## 📐 Curvas de Aceleração

| Nome | CSS/Flutter | Uso |
|------|-------------|-----|
| `ease-linear` | `linear` | Loading, rotações |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elementos saindo |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elementos entrando |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Padrão para transições** |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | **Entrada com bounce** |
| `ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Elasticidade |

### Flutter Equivalents
```dart
// ease-in-out
const Curve easeInOut = Curves.easeInOut;

// ease-bounce (custom)
const Cubic bounce = Cubic(0.34, 1.56, 0.64, 1.0);

// ease-spring (custom)
const Cubic spring = Cubic(0.175, 0.885, 0.32, 1.275);
```

---

## 🎬 Animações por Componente

### 1. CARD HOVER

**Efeito**: Elevação suave ao passar o mouse

```css
.card {
  transition: 
    transform var(--duration-fast) var(--ease-in-out),
    box-shadow var(--duration-fast) var(--ease-in-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

**Flutter:**
```dart
AnimatedContainer(
  duration: FmDurations.fast,
  curve: FmCurves.easeInOut,
  transform: isHovered ? Matrix4.translationValues(0, -2, 0) : Matrix4.identity(),
  decoration: BoxDecoration(
    boxShadow: isHovered ? FmShadows.cardHover : [],
  ),
  child: /* content */,
)
```

---

### 2. BUTTON PRESS

**Efeito**: Scale down no click para feedback tátil

```css
.button {
  transition: transform var(--duration-instant) var(--ease-in-out);
}

.button:active {
  transform: scale(0.98);
}
```

**Flutter:**
```dart
GestureDetector(
  onTapDown: (_) => setState(() => _isPressed = true),
  onTapUp: (_) => setState(() => _isPressed = false),
  onTapCancel: () => setState(() => _isPressed = false),
  child: AnimatedScale(
    scale: _isPressed ? 0.98 : 1.0,
    duration: FmDurations.instant,
    child: /* button */,
  ),
)
```

---

### 3. MODAL APPEARANCE

**Efeito**: Entrada com scale e fade

```css
/* Backdrop */
.modal-backdrop {
  animation: fade-in var(--duration-slow) var(--ease-out);
}

/* Modal content */
.modal-content {
  animation: scale-in var(--duration-slow) var(--ease-bounce);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { 
    opacity: 0; 
    transform: scale(0.95) translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}
```

**Flutter:**
```dart
showDialog(
  context: context,
  builder: (context) => AnimatedBuilder(
    animation: animation,
    builder: (context, child) {
      return Transform.scale(
        scale: CurvedAnimation(
          parent: animation,
          curve: FmCurves.bounce,
        ).value,
        child: Opacity(
          opacity: animation.value,
          child: child,
        ),
      );
    },
    child: Dialog(/* content */),
  ),
);
```

---

### 4. TIMELINE DOT PULSE

**Efeito**: Pulsing para estados ativos (enviada, negociando)

```css
.timeline-dot.active {
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.3); 
    opacity: 0.7; 
  }
}
```

**Flutter:**
```dart
AnimatedBuilder(
  animation: _pulseController,
  builder: (context, child) {
    return Transform.scale(
      scale: 1.0 + (_pulseController.value * 0.3),
      child: Opacity(
        opacity: 0.7 + (_pulseController.value * 0.3),
        child: Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: dotColor,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  },
)
```

---

### 5. SKELETON SHIMMER

**Efeito**: Loading state com gradiente animado

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Flutter:**
```dart
class Shimmer extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [
                FmColors.bgTertiary,
                FmColors.bgElevated,
                FmColors.bgTertiary,
              ],
              stops: const [0.0, 0.5, 1.0],
              transform: _SlideGradientTransform(_controller.value),
            ).createShader(bounds);
          },
          child: Container(
            color: FmColors.bgTertiary,
            child: child,
          ),
        );
      },
      child: /* skeleton placeholder */,
    );
  }
}

class _SlideGradientTransform extends GradientTransform {
  final double percent;
  const _SlideGradientTransform(this.percent);
  
  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * (percent * 2 - 0.5), 0, 0);
  }
}
```

---

### 6. SUCCESS CHECKMARK

**Efeito**: Draw animation no ícone de sucesso

```css
.checkmark {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: check-draw 400ms ease-out forwards;
}

@keyframes check-draw {
  to { stroke-dashoffset: 0; }
}
```

**Flutter:**
```dart
TweenAnimationBuilder(
  tween: Tween<double>(begin: 0, end: 1),
  duration: const Duration(milliseconds: 400),
  curve: Curves.easeOut,
  builder: (context, value, child) {
    return CustomPaint(
      size: const Size(48, 48),
      painter: CheckmarkPainter(progress: value),
    );
  },
)

class CheckmarkPainter extends CustomPainter {
  final double progress;
  CheckmarkPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = FmColors.success
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(size.width * 0.2, size.height * 0.5)
      ..lineTo(size.width * 0.45, size.height * 0.75)
      ..lineTo(size.width * 0.8, size.height * 0.3);

    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      final extractPath = metric.extractPath(
        0,
        metric.length * progress,
      );
      canvas.drawPath(extractPath, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
```

---

### 7. PAGE TRANSITIONS

**Efeito**: Transição suave entre páginas

```css
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: 
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-20px);
  transition: 
    opacity var(--duration-fast) var(--ease-in),
    transform var(--duration-fast) var(--ease-in);
}
```

**Flutter (using PageRouteBuilder):**
```dart
PageRouteBuilder(
  pageBuilder: (context, animation, secondaryAnimation) => NewPage(),
  transitionsBuilder: (context, animation, secondaryAnimation, child) {
    const begin = Offset(0.1, 0);
    const end = Offset.zero;
    const curve = Curves.easeOut;
    
    var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
    var offsetAnimation = animation.drive(tween);
    
    return SlideTransition(
      position: offsetAnimation,
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  },
  transitionDuration: FmDurations.slow,
)
```

---

### 8. LIST ITEM SLIDE-IN (Stagger)

**Efeito**: Items entrando sequencialmente

```css
.list-item {
  opacity: 0;
  transform: translateY(10px);
  animation: slide-up var(--duration-slow) var(--ease-bounce) forwards;
}

/* Stagger delays */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
.list-item:nth-child(4) { animation-delay: 150ms; }
/* ... */

@keyframes slide-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Flutter:**
```dart
class AnimatedListItem extends StatelessWidget {
  final int index;
  final Widget child;
  
  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0, end: 1),
      duration: FmDurations.slow,
      curve: FmCurves.bounce,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 10 * (1 - value)),
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

// Usage with stagger
ListView.builder(
  itemBuilder: (context, index) {
    return FutureBuilder(
      future: Future.delayed(Duration(milliseconds: index * 50)),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox.shrink();
        return AnimatedListItem(
          index: index,
          child: ListTile(/* ... */),
        );
      },
    );
  },
)
```

---

### 9. EXPAND/COLLAPSE (Accordion)

**Efeito**: Expansão suave de conteúdo

```css
.accordion-content {
  overflow: hidden;
  transition: 
    height var(--duration-slow) var(--ease-in-out),
    opacity var(--duration-slow) var(--ease-in-out);
}

.accordion-content.collapsed {
  height: 0;
  opacity: 0;
}

.accordion-content.expanded {
  height: auto;
  opacity: 1;
}

/* Icon rotation */
.accordion-icon {
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.accordion-icon.expanded {
  transform: rotate(180deg);
}
```

**Flutter:**
```dart
AnimatedSize(
  duration: FmDurations.slow,
  curve: FmCurves.easeInOut,
  child: isExpanded 
    ? Column(children: [/* content */])
    : const SizedBox.shrink(),
)

// Icon rotation
AnimatedRotation(
  turns: isExpanded ? 0.5 : 0,
  duration: FmDurations.fast,
  child: const Icon(Icons.keyboard_arrow_down),
)
```

---

### 10. PAYMENT PROCESSING SPINNER

**Efeito**: Loading com múltiplos elementos

```css
.spinner {
  animation: spin 2s linear infinite;
}

.spinner-ring {
  position: absolute;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}
```

**Flutter:**
```dart
Stack(
  alignment: Alignment.center,
  children: [
    // Outer pulse ring
    AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return Container(
          width: 80 + (_pulseController.value * 20),
          height: 80 + (_pulseController.value * 20),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: FmColors.accentPrimary.withOpacity(
              0.2 * (1 - _pulseController.value),
            ),
          ),
        );
      },
    ),
    // Spinner
    RotationTransition(
      turns: _spinController,
      child: const Icon(Icons.sync, size: 40, color: FmColors.accentPrimary),
    ),
  ],
)
```

---

### 11. SUCCESS CELEBRATION

**Efeito**: Scale bounce + glow pulse

```css
.success-icon {
  animation: success-pop 400ms var(--ease-bounce) forwards;
}

.success-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes success-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 5px var(--color-success-glow);
  }
  50% {
    box-shadow: 0 0 20px var(--color-success-glow);
  }
}
```

**Flutter:**
```dart
ScaleTransition(
  scale: CurvedAnimation(
    parent: _controller,
    curve: FmCurves.bounce,
  ),
  child: Container(
    width: 96,
    height: 96,
    decoration: BoxDecoration(
      color: FmColors.successDim,
      shape: BoxShape.circle,
      boxShadow: [
        BoxShadow(
          color: FmColors.successGlow.withOpacity(
            0.5 + (_pulseController.value * 0.5),
          ),
          blurRadius: 20,
          spreadRadius: 5,
        ),
      ],
    ),
    child: const Icon(Icons.check, size: 48, color: FmColors.success),
  ),
)
```

---

### 12. TOAST NOTIFICATION

**Efeito**: Slide in from top + auto dismiss

```css
.toast {
  animation: 
    slide-down 300ms var(--ease-bounce),
    fade-out 300ms var(--ease-in) 4.7s forwards;
}

@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
```

**Flutter:**
```dart
SlideTransition(
  position: Tween<Offset>(
    begin: const Offset(0, -1),
    end: Offset.zero,
  ).animate(CurvedAnimation(
    parent: _controller,
    curve: FmCurves.bounce,
  )),
  child: FadeTransition(
    opacity: _controller,
    child: Material(/* toast content */),
  ),
)

// Auto dismiss
Future.delayed(const Duration(seconds: 5), () {
  _controller.reverse();
});
```

---

### 13. BADGE GLOW (Fiscal Validado)

**Efeito**: Glow suave para documentos válidos

```css
.fiscal-badge.valid {
  animation: badge-glow 2s ease-in-out infinite;
}

@keyframes badge-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }
}
```

**Flutter:**
```dart
AnimatedBuilder(
  animation: _glowController,
  builder: (context, child) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: FmColors.successGlow.withOpacity(
              0.3 + (_glowController.value * 0.2),
            ),
            blurRadius: 10 + (_glowController.value * 10),
            spreadRadius: 2,
          ),
        ],
      ),
      child: child,
    );
  },
  child: /* badge content */,
)
```

---

### 14. FAB EXPANSION (Mobile)

**Efeito**: Menu flutuante expandindo

```css
.fab-menu-item {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
  animation: fab-item-in 300ms var(--ease-bounce) forwards;
}

.fab-menu-item:nth-child(1) { animation-delay: 0ms; }
.fab-menu-item:nth-child(2) { animation-delay: 50ms; }
.fab-menu-item:nth-child(3) { animation-delay: 100ms; }

@keyframes fab-item-in {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fab-icon {
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.fab-icon.expanded {
  transform: rotate(45deg);
}
```

**Flutter:**
```dart
Column(
  children: [
    for (int i = 0; i < items.length; i++)
      AnimatedScale(
        scale: isExpanded ? 1.0 : 0.0,
        duration: FmDurations.slow,
        curve: FmCurves.bounce,
        child: AnimatedOpacity(
          opacity: isExpanded ? 1.0 : 0.0,
          duration: FmDurations.fast,
          child: Transform.translate(
            offset: Offset(0, isExpanded ? 0 : 20),
            child: items[i],
          ),
        ),
      ),
    AnimatedRotation(
      turns: isExpanded ? 0.125 : 0, // 45 degrees
      duration: FmDurations.slow,
      child: FloatingActionButton(/* ... */),
    ),
  ],
)
```

---

## ♿ Acessibilidade

### Redução de Movimento

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Flutter:**
```dart
final bool reduceMotion = MediaQuery.of(context).disableAnimations;

AnimatedContainer(
  duration: reduceMotion ? Duration.zero : FmDurations.slow,
  // ...
)
```

---

## 📱 Performance Guidelines

### CSS
- ✅ Use `transform` e `opacity` apenas
- ✅ Aplique `will-change` antes da animação
- ✅ Remova `will-change` após a animação
- ❌ Não anime `width`, `height`, `top`, `left`
- ❌ Não use `filter: blur()` durante scroll

### Flutter
- ✅ Use `RepaintBoundary` para widgets animados complexos
- ✅ Use `AnimatedBuilder` em vez de `setState`
- ✅ Considere `AnimatedSwitcher` para troca de widgets
- ❌ Evite animações em `ListView` itens visíveis

---

## 📋 Checklist de Implementação

- [ ] Todas as animações usam tokens de duração
- [ ] Todas as animações usam curvas definidas
- [ ] Estados de loading têm shimmer/skeleton
- [ ] Estados de sucesso têm celebração visual
- [ ] Estados de erro têm feedback claro
- [ ] `prefers-reduced-motion` é respeitado
- [ ] Performance está em 60fps
- [ ] Animações têm propósito claro
