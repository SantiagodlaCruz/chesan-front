<template>
  <div class="relative h-[calc(100vh-64px)] -m-4 md:-m-8 overflow-hidden">
    <!-- Pantalla de carga inicial -->
    <div v-if="checkingStatus" class="absolute inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando caja...</p>
      </div>
    </div>

    <!-- Bloqueo visual si no hay sesión activa -->
    <div v-if="!activeSession && !checkingStatus" class="absolute inset-0 z-[90] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/10 animate-in fade-in zoom-in duration-300">
        <div class="flex flex-col items-center text-center mb-8">
          <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <BanknoteIcon class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            Inicio de Caja
          </h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ingresa el fondo inicial para comenzar a operar hoy.
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Fondo Inicial (Efectivo)</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-lg font-bold text-slate-400">$</span>
              </div>
              <input
                v-model.number="openingBalance"
                type="number"
                v-numeric.decimal
                step="0.01"
                min="0"
                class="block w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black text-slate-800 dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                placeholder="0.00"
                @keyup.enter="handleOpenCash"
              />
            </div>
          </div>

          <button
            @click="handleOpenCash"
            :disabled="loadingOpenCash || openingBalance < 0"
            class="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
          >
            <div v-if="loadingOpenCash" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <PlayIcon v-else class="w-5 h-5" />
            Iniciar Turno de Caja
          </button>
        </div>
      </div>
    </div>

    <div class="flex h-full w-full">

    <!-- Main Column: Scan + Cart -->
    <div class="flex-1 flex flex-col p-6 overflow-hidden">

      <!-- Scan Bar -->
      <div class="glass-panel rounded-xl p-5 mb-6 flex items-center gap-5 border border-primary/10 shrink-0">
        <div class="bg-primary/10 p-3 rounded-xl shrink-0">
          <ScanLineIcon class="w-6 h-6 text-primary" />
        </div>
        <input
          ref="barcodeInput"
          v-model="barcodeQuery"
          autofocus
          type="text"
          placeholder="Escanear código de barras o ingresarlo..."
          class="flex-1 bg-transparent border-none outline-none text-xl font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal"
          @keydown.enter="onBarcodeSubmit"
        />
        <div class="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 border border-border-light dark:border-white/10 rounded-lg shrink-0">
          Enter para agregar
        </div>
      </div>

      <!-- Alertas Personalizadas (En reemplazo de alert() genéricos) -->

      <!-- Cart Table -->
      <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">
            Venta actual — {{ cartItems.length }} {{ cartItems.length === 1 ? 'Artículo' : 'Artículos' }}
          </h3>
          <div class="flex items-center gap-3">
            <button @click="showCashMovementModal = true" class="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1">
              <ArrowRightLeftIcon class="w-3 h-3" />
              Ingreso / Salida
            </button>
            <button @click="showCloseCashModal = true" class="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-white border border-slate-900 hover:bg-slate-700 transition-all flex items-center gap-1">
              <FlagIcon class="w-3 h-3" />
              Corte de Caja
            </button>
            <button @click="openCashDrawer" class="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
              <UnlockIcon class="w-3 h-3" />
              Abrir caja
            </button>
            <div class="w-px h-4 bg-border-light dark:bg-white/10 mx-1"></div>
            <button @click="showExchangeModal = true" class="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1">
              <RotateCcwIcon class="w-3 h-3" />
              Procesar cambio
            </button>
            <button @click="showSearchLayawayModal = true" class="text-[10px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1">
              <SearchIcon class="w-3 h-3" />
              Buscar apartado
            </button>
            <button @click="clearCart" class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Trash2Icon class="w-3.5 h-3.5" />
              Limpiar todo
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-panel-light/95 dark:bg-white/5 backdrop-blur border-b border-border-light dark:border-border-dark z-10">
              <tr>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Producto</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">SKU</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-right">Unitario</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-right">Descuento</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-center">Cantidad</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap text-right">Total</th>
                <th class="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-light dark:divide-border-dark">
              <TransitionGroup name="row">
                <tr
                  v-for="(item, index) in cartItems"
                  :key="item.id"
                  class="hover:bg-panel-light dark:hover:bg-white/5 transition-colors group"
                  :class="item.qty < 0 ? 'bg-red-50/50 dark:bg-red-500/10' : ''"
                >
                  <!-- Product -->
                  <td class="px-4 py-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1e293b] overflow-hidden border border-border-light dark:border-white/5 shrink-0">
                        <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                          <ShirtIcon class="w-5 h-5" />
                        </div>
                      </div>
                      <div class="min-w-0 max-w-[160px]">
                        <p class="text-xs leading-tight font-bold whitespace-normal line-clamp-2" :class="item.qty < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'">{{ item.name }}</p>
                        <p class="text-[9px] text-slate-500 mt-1 truncate">
                          <span v-if="item.size">{{ item.size }}</span>
                          <span v-if="item.size && item.color"> | </span>
                          <span v-if="item.color">{{ item.color }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <!-- SKU -->
                  <td class="px-4 py-2">
                    <span class="font-mono text-[11px] text-slate-400">{{ item.barcode || '—' }}</span>
                  </td>
                  <!-- Unit Price & Discount logic -->
                  <td class="px-4 py-2 text-right">
                    <span v-if="item.discount_percentage > 0 || item.discount_amount > 0" class="block text-[10px] text-slate-400 line-through">{{ formatMoney(item.sale_price) }}</span>
                    <span :class="(item.discount_percentage > 0 || item.discount_amount > 0) ? 'text-[13px] font-bold text-red-500' : 'text-[13px] font-medium text-slate-600 dark:text-slate-300'">
                      {{ formatMoney(item.discount_type === 'amount' ? Math.max(0, item.sale_price - item.discount_amount) : item.sale_price * (1 - (item.discount_percentage / 100))) }}
                    </span>
                  </td>
                  <!-- Discount Indicator -->
                  <td class="px-4 py-2 text-right">
                    <span v-if="item.discount_type === 'amount' && item.discount_amount > 0" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                      -${{ parseFloat(item.discount_amount).toFixed(2) }}
                    </span>
                    <span v-else-if="item.discount_percentage > 0" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                      -{{ item.discount_percentage }}%
                    </span>
                    <span v-else class="text-[11px] text-slate-400">—</span>
                  </td>
                  <!-- Qty Controls -->
                  <td class="px-4 py-2">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="updateQty(index, -1)"
                        class="w-7 h-7 rounded-lg border border-border-light dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center text-slate-400 transition-all"
                      >
                        <MinusIcon class="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        v-numeric.negative
                        v-model.number="item.qty"
                        @change="validateManualQty(index)"
                        class="w-10 h-7 bg-slate-50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-lg text-center text-xs font-black text-slate-800 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        @click="updateQty(index, 1)"
                        class="w-7 h-7 rounded-lg border border-border-light dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center text-slate-400 transition-all"
                      >
                        <PlusIcon class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <!-- Subtotal -->
                  <td class="px-4 py-2 text-right">
                    <span class="text-sm font-black text-primary">{{ formatMoney((item.discount_type === 'amount' ? Math.max(0, item.sale_price - item.discount_amount) : item.sale_price * (1 - (item.discount_percentage / 100))) * item.qty) }}</span>
                  </td>
                  <!-- Delete -->
                  <td class="px-4 py-2 text-right">
                    <button @click="removeFromCart(index)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                      <XIcon class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </TransitionGroup>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="cartItems.length === 0" class="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 py-20">
            <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCartIcon class="w-9 h-9 opacity-20" />
            </div>
            <p class="text-sm font-black uppercase tracking-widest opacity-40">Carrito Vacío</p>
            <p class="text-xs mt-1 text-slate-400">Escanea un código para comenzar</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar: Summary -->
    <aside class="w-[330px] shrink-0 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark flex flex-col p-6 overflow-y-auto custom-scrollbar">

      <!-- Customer and Type Selection -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors">Datos de venta</h3>
        </div>
        
        <!-- Toggle Operation Type -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-4 text-[10px] uppercase font-black tracking-widest">
          <button @click="isLayaway = false" :class="!isLayaway ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'" class="flex-1 py-2 rounded-lg transition-all">
            Venta Directa
          </button>
          <button @click="isLayaway = true" :class="isLayaway ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'" class="flex-1 py-2 rounded-lg transition-all">
            Apartado
          </button>
        </div>

        <!-- Normal Sale Customer -->
        <div v-if="!isLayaway" class="bg-panel-light dark:bg-background-dark rounded-xl p-4 border border-border-light dark:border-border-dark flex items-center gap-3 shadow-sm dark:shadow-none">
          <div class="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-2 rounded-full shrink-0">
            <UserIcon class="w-5 h-5 text-slate-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{{ currentCustomer }}</p>
          </div>
        </div>

        <!-- Layaway Inputs -->
        <div v-if="isLayaway" class="space-y-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-4 rounded-xl">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Nombre del cliente *</label>
            <input v-model="customerName" type="text" placeholder="Ej. Juan Pérez" class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Anticipo ($) *</label>
            <input v-model.number="layawayDeposit" type="number" v-numeric.decimal min="0" :max="Math.abs(total)" placeholder="0.00" class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Fecha de liquidación *</label>
            <input v-model="layawayDueDate" type="date" :min="todayDate" class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors dark:[color-scheme:dark]" />
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="flex-1">
        <h3 class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors mb-6">Resumen de orden</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span class="text-sm font-medium">Subtotal Sin Descuento</span>
            <span class="text-sm font-mono tracking-tight">{{ formatMoney(rawSubtotal) }}</span>
          </div>
          <div class="flex justify-between items-center text-red-500" v-if="totalDiscountAmount > 0">
            <span class="text-sm font-medium">Descuento Aplicado</span>
            <span class="text-sm font-mono tracking-tight">-{{ formatMoney(totalDiscountAmount) }}</span>
          </div>

          <div class="h-px bg-border-light dark:bg-white/10 my-2"></div>

          <div class="pt-4 flex flex-col items-center justify-center text-center">
            <span class="text-[11px] font-black uppercase tracking-widest mb-3" :class="total < 0 ? 'text-red-500' : 'text-slate-400'">
               {{ total < 0 ? 'Monto a Devolver' : 'Total a Pagar' }}
            </span>
            <div class="flex items-baseline justify-center gap-2">
              <span class="block text-4xl font-black leading-none tracking-normal text-primary" style="text-shadow: 0 0 40px rgba(59,130,246,0.5)">
                {{ formatMoney(Math.abs(total)) }}
              </span>
              <span class="text-[10px] text-slate-400/80 font-bold uppercase tracking-[0.2em] pl-1">MXN</span>
            </div>
            
            <div v-if="total < 0" class="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
               <p class="text-[10px] font-black text-red-600 uppercase tracking-widest">Saldo a favor del cliente</p>
               <p class="text-xs font-bold text-red-500 mt-0.5">Regresar efectivo al finalizar</p>
            </div>
            <div v-else-if="cartItems.some(i => i.qty < 0)" class="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
               <p class="text-[10px] font-black text-green-600 uppercase tracking-widest">Diferencia por cobrar</p>
               <p class="text-xs font-bold text-green-500 mt-0.5">El cliente paga el excedente</p>
            </div>

            <!-- Context Metadata -->
            <div class="mt-5 flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-border-light dark:border-white/5">
              <CalendarIcon class="w-3 h-3 text-slate-400" />
              <ClientOnly>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {{ new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }} — {{ new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <template #fallback>
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">Calculando fecha...</span>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods + Checkout -->
      <div class="mt-8 space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <button
            @click="paymentMethod = 'card'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'card'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <CreditCardIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Tarjeta</span>
          </button>
          <button
            @click="paymentMethod = 'cash'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'cash'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <BanknoteIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Efectivo</span>
          </button>
          <button
            @click="paymentMethod = 'transfer'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'transfer'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <ArrowRightLeftIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Transf.</span>
          </button>
        </div>

        <button
          @click="confirmCheckout"
          :disabled="cartItems.length === 0 || loading || (isLayaway && (!customerName || layawayDeposit < 0 || !layawayDueDate))"
          class="w-full py-5 bg-primary hover:bg-primary/90 text-white font-black text-base uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-transparent"></div>
          <ReceiptIcon v-else class="w-6 h-6" />
          {{ loading ? 'Procesando...' : (isLayaway ? 'Registrar Apartado' : (total < 0 ? 'Regresar Saldo' : 'Cobrar')) }}
        </button>

        <button
          @click="showExchangeModal = true"
          class="w-full py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-border-light dark:border-white/5 active:scale-95"
        >
          <RotateCcwIcon class="w-4 h-4" />
          Realizar cambio
        </button>

        <div class="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <LockIcon class="w-3.5 h-3.5" />
          Transacción Segura Chesan
        </div>
      </div>
    </aside>
  </div></div>

  <!-- Modales Adicionales -->
  <ExchangeTicketModal 
     v-model:show="showExchangeModal" 
     @addReturn="item => cartItems.unshift(item)" 
  />

  <PayLayawayModal
     v-model:show="showPayLayawayModal"
     :ticket="scannedLayawayTicket"
     :loading="loadingLayaway"
     @confirm="handleLayawayPayment"
  />

  <SearchLayawayModal
     v-model:show="showSearchLayawayModal"
     @select="handleSelectLayaway"
  />

  <CloseCashModal
     v-model:show="showCloseCashModal"
     @closed="onCashClosed"
  />

  <CashMovementModal
     v-model:show="showCashMovementModal"
     @success="onMovementRecorded"
  />

  <CheckoutModal
     v-model:show="showCheckoutModal"
     :total="total"
     :is-layaway="isLayaway"
     :layaway-deposit="layawayDeposit"
     :payment-method="paymentMethod"
     :loading="loading"
     @confirm="onCheckout"
  />

  <!-- Printable Area for pos 58mm Ticket (Hidden from screen view) -->
  <Teleport to="body">
    <div id="pos-print-area" class="hidden print:block" v-if="lastTicket">
      <!-- Si es apertura de cajón -->
      <div v-if="lastTicket.isDrawerKick" class="pos-ticket" style="text-align: center; padding: 1mm 0; max-height: 10mm; overflow: hidden;">
        <p style="font-size: 8px; font-weight: bold; margin: 0; line-height: 1.1;">APERTURA DE CAJA</p>
        <p style="font-size: 7px; margin: 0.5mm 0 0 0; line-height: 1;">
          {{ new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) }}
        </p>
      </div>
      <!-- Si es un ticket de venta normal -->
      <div v-else class="pos-ticket">
        <div class="ticket-header">
          <h2 class="company-name">CHESAN UNIFORMES</h2>
          <p class="company-info" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance > 0">COMPROBANTE DE APARTADO</p>
          <p class="company-info" v-else-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance === 0">LIQUIDACIÓN DE APARTADO</p>
          <p class="company-info" v-else>Venta de Mostrador</p>
          <p class="company-info">Fecha: {{ new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) }}</p>
          <p class="company-info ticket-number">Ticket #{{ lastTicket.ticket_number || 'S/N' }}</p>
          <p v-if="lastTicket.ticket_type === 'layaway'" class="company-info">Cliente: {{ lastTicket.customer_name }}</p>
          <p v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance > 0" class="company-info">Fecha límite: {{ lastTicket.due_date }}</p>
        </div>
        
        <div class="ticket-divider"></div>

        <table class="ticket-items">
          <thead>
            <tr>
              <th class="qty-col">Cant</th>
              <th class="desc-col">Producto</th>
              <th class="price-col">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in lastTicket.items" :key="item.id">
              <td class="qty-col">{{ item.qty || item.quantity }}</td>
              <td class="desc-col">
                {{ item.name || item.product?.name }}
                <div v-if="item.size || item.color" class="item-meta">{{ item.size }} {{ item.color }}</div>
                <div v-if="item.discount_percentage > 0 || item.discount_amount > 0" class="item-meta font-bold">
                   <span v-if="item.discount_type === 'amount'">(-${{ parseFloat(item.discount_amount).toFixed(2) }})</span>
                   <span v-else>(-{{ Math.round(item.discount_percentage) }}%)</span>
                </div>
              </td>
              <td class="price-col">
                <span v-if="item.discount_percentage > 0 || item.discount_amount > 0" style="text-decoration: line-through; font-size: 8px;">{{ formatMoney((item.qty || item.quantity) * item.sale_price) }}</span><br v-if="item.discount_percentage > 0 || item.discount_amount > 0"/>
                {{ formatMoney((item.qty || item.quantity) * (item.discount_type === 'amount' ? Math.max(0, item.sale_price - item.discount_amount) : item.sale_price * (1 - ((item.discount_percentage || 0) / 100)))) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="ticket-divider"></div>

        <div class="ticket-totals">
          <div class="total-row" v-if="lastTicket.discount_amount > 0">
            <span>Ahorro en Descuentos:</span>
            <span>-{{ formatMoney(lastTicket.discount_amount) }}</span>
          </div>
          <div class="total-row font-bold">
            <span>Total {{ lastTicket.ticket_type === 'layaway' ? 'Apartado' : '' }}:</span>
            <span>{{ formatMoney(lastTicket.total) }}</span>
          </div>
          <div class="total-row" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance === 0">
            <span>Anticipo Original:</span>
            <span>{{ formatMoney(lastTicket.original_deposit || 0) }}</span>
          </div>
          <div class="total-row" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance === 0">
            <span>Pago Liquidación:</span>
            <span>{{ formatMoney(lastTicket.payment_made_today || 0) }}</span>
          </div>
          
          <div class="total-row" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance > 0">
            <span>Anticipo Pagado:</span>
            <span>{{ formatMoney(lastTicket.received_amount) }}</span>
          </div>
          
          <div class="total-row font-bold" v-if="lastTicket.ticket_type === 'layaway'" style="font-size: 12px; margin-top: 2px;">
            <span>RESTA POR PAGAR:</span>
            <span>{{ formatMoney(lastTicket.balance) }}</span>
          </div>
        </div>

        <div class="ticket-footer">
          <p>Método de Pago: {{ paymentMethodName }}</p>
          <p class="thank-you">¡Gracias por tu compra!</p>
          <p class="qr-info">Guarda este ticket para cualquier cambio o aclaración.</p>
          <div v-if="lastTicket" class="qr-container">
            <qrcode-vue :value="String(lastTicket.ticket_number)" :size="80" level="H" renderAs="canvas" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ScanLineIcon,
  Trash2Icon,
  PlusIcon,
  MinusIcon,
  XIcon,
  ShoppingCartIcon,
  ShirtIcon,
  UserIcon,
  CreditCardIcon,
  BanknoteIcon,
  ReceiptIcon,
  LockIcon,
  UnlockIcon,
  ArrowRightLeftIcon,
  CalendarIcon,
  RotateCcwIcon,
  FlagIcon,
  ArrowDownIcon,
  SearchIcon,
} from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import ExchangeTicketModal from '~/components/pos/ExchangeTicketModal.vue'
import PayLayawayModal from '~/components/pos/PayLayawayModal.vue'
import SearchLayawayModal from '~/components/pos/SearchLayawayModal.vue'
import CloseCashModal from '~/components/pos/CloseCashModal.vue'
import CashMovementModal from '~/components/pos/CashMovementModal.vue'
import CheckoutModal from '~/components/pos/CheckoutModal.vue'

const { user } = useAuth()
const api = useApi()

const barcodeInput = ref(null)
const barcodeQuery = ref('')
const loading = ref(false)
const paymentMethod = ref('cash')
const currentCustomer = ref('Venta Directa / Mostrador')
const lastTicket = ref(null)
const showExchangeModal = ref(false)
const showCloseCashModal = ref(false)
const showCashMovementModal = ref(false)
const showCheckoutModal = ref(false)
const activeSession = ref(null)
const checkingStatus = ref(true)

// Estado Inicio de Caja Integrado
const openingBalance = ref(500)
const loadingOpenCash = ref(false)

// Estado Liquidar Apartado Escaneado
const showPayLayawayModal = ref(false)
const scannedLayawayTicket = ref(null)
const loadingLayaway = ref(false)

// Estado Búsqueda de Apartado
const showSearchLayawayModal = ref(false)
const handleSelectLayaway = (ticket) => {
  scannedLayawayTicket.value = ticket
  showPayLayawayModal.value = true
}

const { logout: authLogout } = useAuth()
const logout = async () => {
  await authLogout()
  window.location.reload()
}

const handleOpenCash = async () => {
  if (openingBalance.value < 0 || loadingOpenCash.value) return
  loadingOpenCash.value = true
  try {
    const response = await api.post('/api/cash-register/open', {
      opening_balance: openingBalance.value
    })
    activeSession.value = response.session
    showPosAlert('¡Caja iniciada correctamente!', 'success')
  } catch (error) {
    console.error('Error opening cash register:', error)
    
    // Si el error es que ya está abierta (o cualquier error 400 en este contexto),
    // forzamos la sincronización inmediata del estado para desbloquear al usuario.
    if (error.data?.message?.includes('ya existe') || error.status === 400) {
      showPosAlert('Detectamos una sesión activa. Sincronizando...', 'info')
      
      // Llamamos a status directamente para asegurar los datos frescos
      try {
        const res = await api.get('/api/cash-register/status')
        if (res.has_open_session) {
          activeSession.value = res.session
          showPosAlert('Sesión sincronizada con éxito.', 'success')
        } else {
          showPosAlert('No se pudo sincronizar la sesión. Por favor intenta de nuevo.', 'error')
        }
      } catch (syncErr) {
        showPosAlert('Error al sincronizar. Recarga la página.', 'error')
      }
    } else {
      showPosAlert(error.data?.message || 'Error al abrir la caja', 'error')
    }
  } finally {
    loadingOpenCash.value = false
    checkingStatus.value = false // Nos aseguramos de que el estado de carga general también termine
  }
}

// Estado del Apartado
const isLayaway = ref(false)
const customerName = ref('')
const layawayDeposit = ref(0)
const layawayDueDate = ref('')
const todayDate = computed(() => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

import { useToast } from '~/composables/useToast'

const { showToast } = useToast()

// — Sistema de Alertas POS —
const showPosAlert = (message, type = 'error') => {
  showToast(message, type)
}

const cartItems = ref([])

// — Computed —
const rawSubtotal = computed(() =>
  cartItems.value.reduce((acc, item) => acc + item.sale_price * item.qty, 0)
)
const total = computed(() =>
  cartItems.value.reduce((acc, item) => {
    let finalUnitPrice = item.discount_type === 'amount' 
                          ? Math.max(0, item.sale_price - item.discount_amount)
                          : item.sale_price * (1 - (item.discount_percentage / 100))
    return acc + (finalUnitPrice * item.qty)
  }, 0)
)
const totalDiscountAmount = computed(() => rawSubtotal.value - total.value)

const { formatMoney } = useFormatter()

const paymentMethodName = computed(() => {
  if (lastTicket.value) {
    const method = lastTicket.value.ticket_type === 'layaway' && lastTicket.value.balance === 0
      ? (lastTicket.value.liquidation_payment_method || 'cash')
      : (lastTicket.value.payment_method || paymentMethod.value)

    if (method === 'cash') return 'Efectivo'
    if (method === 'card') return 'Tarjeta'
    if (method === 'transfer') return 'Transferencia'
    return method
  }

  if (paymentMethod.value === 'cash') return 'Efectivo'
  if (paymentMethod.value === 'card') return 'Tarjeta'
  if (paymentMethod.value === 'transfer') return 'Transferencia'
  return paymentMethod.value
})

// — Helpers —


// — Actions —
const checkCashStatus = async () => {
  checkingStatus.value = true
  try {
    const response = await api.get('/api/cash-register/status')
    if (response && (response.has_open_session || response.session)) {
      activeSession.value = response.session
    } else {
      activeSession.value = null
    }
  } catch (error) {
    console.error('POS Sync Error:', error)
    activeSession.value = null
  } finally {
    checkingStatus.value = false
  }
}

onMounted(() => {
  checkCashStatus().then(() => {
    setTimeout(() => {
      barcodeInput.value?.focus()
    }, 500)
  })
})

const onCashClosed = () => {
  activeSession.value = null
  showPosAlert('Caja cerrada correctamente. Se requiere abrir una nueva para continuar.', 'success')
}

const onMovementRecorded = (movement) => {
  showPosAlert(`Movimiento registrado: ${movement.description} (${formatMoney(movement.amount)})`, 'success')
}

const onBarcodeSubmit = async () => {
  if (!barcodeQuery.value.trim()) return
  
  let query = barcodeQuery.value.trim().replace(/'/g, '-')
  barcodeQuery.value = ''

  try {
    // LÓGICA DE ESCANEO DE TICKETS (LIQUIDACIÓN DE APARTADO)
    if (query.toUpperCase().startsWith('TKT-')) {
       const response = await api.get(`/api/tickets/by-number/${query.toUpperCase()}`).catch(() => null)

       if (!response || !response.data) {
           showPosAlert(`Ticket Invalido: No se localizó un apartado con el folio "${query}".`, 'error')
           return
       }

       const scannedTicket = response.data
       if (scannedTicket.ticket_type !== 'layaway' || scannedTicket.balance <= 0) {
           showPosAlert(`El ticket ${query} no es un apartado pendiente o ya fue liquidado totalmente.`, 'error')
           return
       }

       scannedLayawayTicket.value = scannedTicket
       showPayLayawayModal.value = true
       return
    }

    const response = await api.get('/api/stock-products', { params: { search: query } })
    const productsArray = Array.isArray(response.data) ? response.data : (response.data?.data || [])

    if (productsArray && productsArray.length > 0) {
      let product = productsArray.find(p => p.barcode === query) || productsArray[0]
      
      const dispQty = parseFloat(product.available_quantity ?? product.quantity) || 0
      if (dispQty <= 0) {
         showPosAlert(`Inventario Totalmente Agotado: El producto "${product.name}" no tiene piezas disponibles para venta.`, 'error')
         return
      }

      const precioVenta = parseFloat(product.sale_price) || 0
      addToCart({
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        size: product.size?.name || '',
        color: product.color?.name || '',
        sale_price: precioVenta,
        discount_type: product.discount_type || 'percentage',
        discount_percentage: parseFloat(product.discount_percentage) || 0,
        discount_amount: parseFloat(product.discount_amount) || 0,
        quantity: dispQty,
        image_url: product.image_url,
        qty: 1
      })
      
      if (precioVenta === 0) {
         showPosAlert(`El producto se agregó correctamente, pero su precio actual registrado en base de datos es $0.00.`, 'error')
      }
    } else {
      showPosAlert(`Código Invalido: No se localizó ningún producto relacionado al código de barras "${query}" en tu catálogo.`, 'error')
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    showPosAlert('Error de Servidor: Ocurrió un problema conectando con el catálogo de inventarios.', 'error')
  } finally {
    barcodeInput.value?.focus()
  }
}

const addToCart = (product) => {
  const existing = cartItems.value.find(i => i.id === product.id)
  if (existing) {
    if (existing.qty < existing.quantity) {
       existing.qty++
    } else {
       showPosAlert(`Límite Alcanzado: No puedes agregar más piezas de este producto.`, 'error')
    }
  } else {
    cartItems.value.unshift({ ...product, qty: 1 })
  }
}

const removeFromCart = (index) => cartItems.value.splice(index, 1)

const updateQty = (index, delta) => {
  const item = cartItems.value[index]
  const currentQty = parseInt(item.qty) || 0
  const newQty = currentQty + delta
  
  if (currentQty < 0) {
      if (newQty > -1) { 
        // En lugar de borrar, lo dejamos en 0 o 1 si prefiere, 
        // pero para devoluciones negativas, el límite es 0
        item.qty = 0
        return 
      }
      item.qty = newQty
      return
  }

  // Ya no borramos automáticamente si es < 1
  if (newQty < 0) {
    item.qty = 0
    return
  }
  
  if (newQty > item.quantity) {
     showPosAlert(`Límite Alcanzado: Solo quedan ${item.quantity} pieza(s) en inventario.`, 'error')
     item.qty = item.quantity
     return
  }
  item.qty = newQty
}

const validateManualQty = (index) => {
  const item = cartItems.value[index]
  
  if (item.qty < 0) {
    // Si es negativo (devolución), el límite es 0
    return
  }

  // Si está vacío, lo permitimos (será 0 para el total)
  if (item.qty === '' || item.qty === null || item.qty === undefined) {
    return
  }

  // Validación de Stock
  if (item.qty > item.quantity) {
    showPosAlert(`Límite Alcanzado: Solo quedan ${item.quantity} pieza(s) en inventario.`, 'error')
    item.qty = item.quantity
  }
}

const clearCart = () => {
  if (cartItems.value.length === 0) return
  if (confirm('¿Estás seguro de que deseas vaciar completamente la mesa y cancelar esta venta?')) {
     cartItems.value = []
  }
}

const openCashDrawer = () => {
  const temp = lastTicket.value
  lastTicket.value = { isDrawerKick: true }
  
  setTimeout(() => {
    window.print()
    lastTicket.value = temp
  }, 250)
}

const confirmCheckout = () => {
  if (cartItems.value.length === 0 || loading.value) return
  if (isLayaway.value && (!customerName.value || layawayDeposit.value < 0 || !layawayDueDate.value)) {
    showPosAlert('Por favor completa todos los campos del apartado requeridos.', 'error')
    return
  }
  showCheckoutModal.value = true
}

const onCheckout = async () => {
  if (!cartItems.value.length) return
  loading.value = true
  
  try {
    const payload = {
        customer_name: isLayaway.value ? customerName.value : null,
        ticket_type: isLayaway.value ? 'layaway' : 'sale',
        due_date: isLayaway.value ? layawayDueDate.value : null,
        items: cartItems.value.map(item => ({
            stock_product_id: item.id,
            quantity: item.qty,
            unit_price: item.sale_price,
            discount_percentage: item.discount_percentage,
            discount_type: item.discount_type,
            discount_amount: item.discount_amount,
            parent_detail_id: item.parent_detail_id || null
        })),
        payment_method: paymentMethod.value,
        amount_paid: isLayaway.value ? layawayDeposit.value : total.value,
        discount_amount: totalDiscountAmount.value
    }

    const response = await api.post('/api/tickets', payload)

    lastTicket.value = { ...response.data, items: [...cartItems.value], total: total.value }
    
    setTimeout(() => {
        window.print()
        cartItems.value = []
        isLayaway.value = false
        customerName.value = ''
        layawayDeposit.value = 0
        layawayDueDate.value = ''
        loading.value = false
        showCheckoutModal.value = false
        showPosAlert('¡Operación completada y ticket generado exitosamente!', 'success')
        barcodeInput.value?.focus()
    }, 300)

  } catch (error) {
     console.error('Checkout error:', error)
     showPosAlert(error.data?.message || 'Error al procesar la venta.', 'error')
     loading.value = false
  }
}

const handleLayawayPayment = async ({ ticket, paymentMethod }) => {
    loadingLayaway.value = true
    try {
        const response = await api.post(`/api/tickets/${ticket.id}/complete-layaway`, {
            payment_method: paymentMethod
        })
        showPayLayawayModal.value = false
        
        const mappedItems = response.data.items.map(detail => ({
            id: detail.id,
            name: detail.product?.name,
            size: detail.product?.size?.name || '',
            color: detail.product?.color?.name || '',
            sale_price: detail.unit_price,
            discount_type: detail.product?.discount_type || 'percentage',
            discount_percentage: detail.discount_percentage || 0,
            discount_amount: detail.discount_amount || 0,
            qty: detail.quantity,
        }))

        lastTicket.value = {
            ...response.data,
            items: mappedItems,
            original_deposit: ticket.received_amount,
            payment_made_today: ticket.balance
        }
        
        setTimeout(() => {
            window.print()
            // lastTicket.value = null (Mantenemos para evitar impresión en blanco)
            showPosAlert('Apartado liquidado con éxito.', 'success')
            barcodeInput.value?.focus()
        }, 300)
        
    } catch (err) {
        showPosAlert(err.data?.message || 'Error al liquidar el apartado.', 'error')
        loadingLayaway.value = false
    }
}
</script>

<style>
.pos-ticket {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  width: 48mm; /* Ajustado a 48mm para el ancho real imprimible en impresoras de 58mm */
  padding: 0.5mm 1mm;
  box-sizing: border-box;
  color: #000000 !important;
  background: white;
  font-weight: 600; /* Incrementado para dar más contraste en impresión térmica */
}
.ticket-header { text-align: center; margin-bottom: 4mm; }
.company-name { font-size: 14px; font-weight: 800; margin: 0; color: #000000 !important; }
.company-info { font-size: 9.5px; margin: 1mm 0; color: #000000 !important; }
.ticket-number { font-weight: 800; font-size: 11px; }
.ticket-divider { border-top: 1.5px dashed #000000; margin: 2mm 0; }
.ticket-items { width: 100%; border-collapse: collapse; font-size: 9.5px; color: #000000 !important; }
.ticket-items th { text-align: left; border-bottom: 1.5px solid #000000; padding-bottom: 1mm; font-weight: 800; }
.qty-col { width: 20%; }
.desc-col { width: 50%; }
.price-col { width: 30%; text-align: right; }
.item-meta { font-size: 8.5px; color: #000000 !important; font-weight: 500; }
.ticket-totals { margin-top: 2mm; font-size: 9.5px; color: #000000 !important; }
.total-row { display: flex; justify-content: space-between; margin-bottom: 0.5mm; }
.font-bold { font-weight: 800; }
.ticket-footer { text-align: center; margin-top: 4mm; font-size: 9px; color: #000000 !important; }
.qr-container { margin-top: 3mm; display: flex; justify-content: center; }
.qr-container canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    width: 100% !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Ocultar todo lo que no sea el área de impresión */
  body > * { display: none !important; }
  #pos-print-area { 
    display: block !important; 
    position: absolute !important; 
    left: -1mm !important; /* Desplazado ligeramente a la izquierda para compensar margen físico */
    top: 0 !important; 
    width: 48mm !important; /* Ajustado al ancho real imprimible seguro de 48mm */
    margin: 0 !important;
    padding: 0 !important;
    visibility: visible !important;
    background: white !important;
    color: #000000 !important;
  }
  #pos-print-area * { 
    visibility: visible !important;
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    background: transparent !important;
  }
  
  /* Reset page margins for ticket printer */
  @page {
    margin: 0 !important;
    size: 58mm auto;
  }
}
</style>
