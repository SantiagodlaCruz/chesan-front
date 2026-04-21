<template>
  <div class="flex h-[calc(100vh-64px)] -m-4 md:-m-8 overflow-hidden">

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
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div v-if="posAlert.message" class="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold relative shrink-0 overflow-hidden"
             :class="posAlert.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'">
          <!-- Indicador lateral de color -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="posAlert.type === 'error' ? 'bg-red-500' : 'bg-green-500'"></div>
          
          <AlertCircleIcon v-if="posAlert.type === 'error'" class="w-5 h-5 shrink-0" />
          <CheckCircleIcon v-else class="w-5 h-5 shrink-0" />
          
          <span class="leading-snug">{{ posAlert.message }}</span>
          
          <button @click="posAlert.message = ''" class="ml-auto opacity-50 hover:opacity-100 transition-opacity">
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </Transition>

      <!-- Cart Table -->
      <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
          <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Venta Actual — {{ cartItems.length }} {{ cartItems.length === 1 ? 'Artículo' : 'Artículos' }}
          </h3>
          <div class="flex items-center gap-3">
            <button @click="showExchangeModal = true" class="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1">
              <RotateCcwIcon class="w-3 h-3" />
              Procesar Cambio
            </button>
            <button @click="clearCart" class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Trash2Icon class="w-3.5 h-3.5" />
              Limpiar Todo
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-panel-light/95 dark:bg-white/5 backdrop-blur border-b border-border-light dark:border-border-dark z-10">
              <tr>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Producto</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">SKU</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Unitario</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Descuento</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">Cantidad</th>
                <th class="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Total</th>
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
                    <span v-if="item.discount_percentage > 0 || item.discount_amount > 0" class="block text-[10px] text-slate-400 line-through">{{ formatCurrency(item.sale_price) }}</span>
                    <span :class="(item.discount_percentage > 0 || item.discount_amount > 0) ? 'text-[13px] font-bold text-red-500' : 'text-[13px] font-medium text-slate-600 dark:text-slate-300'">
                      {{ formatCurrency(item.discount_type === 'amount' ? Math.max(0, item.sale_price - item.discount_amount) : item.sale_price * (1 - (item.discount_percentage / 100))) }}
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
                      <span class="text-sm font-black text-slate-800 dark:text-slate-100 w-5 text-center">{{ String(item.qty).padStart(2, '0') }}</span>
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
                    <span class="text-sm font-black text-primary">{{ formatCurrency((item.discount_type === 'amount' ? Math.max(0, item.sale_price - item.discount_amount) : item.sale_price * (1 - (item.discount_percentage / 100))) * item.qty) }}</span>
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
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400">Datos de Venta</h3>
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
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre del Cliente *</label>
            <input v-model="customerName" type="text" placeholder="Ej. Juan Pérez" class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Anticipo ($) *</label>
            <input v-model.number="layawayDeposit" type="number" min="0" :max="Math.abs(total)" placeholder="0.00" class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Fecha de Liquidación *</label>
            <input v-model="layawayDueDate" type="date" :min="todayDate" class="w-full bg-white dark:bg-card-dark border border-border-light dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="flex-1">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Resumen de Orden</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span class="text-sm font-medium">Subtotal Sin Descuento</span>
            <span class="text-sm font-mono tracking-tight">{{ formatCurrency(rawSubtotal) }}</span>
          </div>
          <div class="flex justify-between items-center text-red-500" v-if="totalDiscountAmount > 0">
            <span class="text-sm font-medium">Descuento Aplicado</span>
            <span class="text-sm font-mono tracking-tight">-{{ formatCurrency(totalDiscountAmount) }}</span>
          </div>

          <div class="h-px bg-border-light dark:bg-white/10 my-2"></div>

          <div class="pt-4 flex flex-col items-center justify-center text-center">
            <span class="text-[11px] font-black uppercase tracking-widest mb-3" :class="total < 0 ? 'text-red-500' : 'text-slate-400'">
               {{ total < 0 ? 'Monto a Devolver' : 'Total a Pagar' }}
            </span>
            <div class="flex items-baseline justify-center gap-2">
              <span class="block text-4xl font-black leading-none tracking-normal" :class="total < 0 ? 'text-red-600' : 'text-primary'" style="text-shadow: 0 0 40px rgba(59,130,246,0.5)">
                {{ formatCurrency(Math.abs(total)) }}
              </span>
              <span class="text-[10px] text-slate-400/80 font-bold uppercase tracking-widest pl-1">MXN</span>
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
            <span class="text-[9px] font-black uppercase tracking-widest text-center">Tarjeta</span>
          </button>
          <button
            @click="paymentMethod = 'cash'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'cash'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <BanknoteIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-black uppercase tracking-widest text-center">Efectivo</span>
          </button>
          <button
            @click="paymentMethod = 'transfer'"
            class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            :class="paymentMethod === 'transfer'
              ? 'bg-primary border-primary text-white shadow-[0_0_25px_#3b82f6aa] dark:shadow-[0_0_30px_#3b82f6cc] scale-[1.03] z-10'
              : 'bg-panel-light dark:bg-background-dark border-border-light dark:border-border-dark text-slate-400 hover:border-primary/30 shadow-sm dark:shadow-none'"
          >
            <ArrowRightLeftIcon class="w-5 h-5 mb-2" />
            <span class="text-[9px] font-black uppercase tracking-widest text-center">Transf.</span>
          </button>
        </div>

        <button
          @click="onCheckout"
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
          Realizar Cambio
        </button>

        <div class="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <LockIcon class="w-3.5 h-3.5" />
          Transacción Segura Chesan
        </div>
      </div>
    </aside>
  </div>

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

  <!-- Printable Area for pos 58mm Ticket (Hidden from screen view) -->
  <Teleport to="body">
    <div id="pos-print-area" class="hidden print:block" v-if="lastTicket">
      <div class="pos-ticket">
        <div class="ticket-header">
          <h2 class="company-name">CHESAN UNIFORMES</h2>
          <p class="company-info" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance > 0">COMPROBANTE DE APARTADO</p>
          <p class="company-info" v-else-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance === 0">LIQUIDACIÓN DE APARTADO</p>
          <p class="company-info" v-else>Venta de Mostrador</p>
          <p class="company-info">Fecha: {{ new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) }}</p>
          <p class="company-info ticket-number">Ticket #{{ lastTicket.ticket_number || 'S/N' }}</p>
          <p class="company-info">Atendió: {{ user?.name || lastTicket.user?.name || 'Administrador' }}</p>
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
                <span v-if="item.discount_percentage > 0 || item.discount_amount > 0" style="text-decoration: line-through; font-size: 8px;">{{ formatCurrency((item.qty || item.quantity) * item.sale_price) }}</span><br v-if="item.discount_percentage > 0 || item.discount_amount > 0"/>
                {{ formatCurrency((item.qty || item.quantity) * (item.discount_type === 'amount' ? Math.max(0, item.sale_price - item.discount_amount) : item.sale_price * (1 - ((item.discount_percentage || 0) / 100)))) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="ticket-divider"></div>

        <div class="ticket-totals">
          <div class="total-row" v-if="lastTicket.discount_amount > 0">
            <span>Ahorro en Descuentos:</span>
            <span>-{{ formatCurrency(lastTicket.discount_amount) }}</span>
          </div>
          <div class="total-row font-bold">
            <span>Total {{ lastTicket.ticket_type === 'layaway' ? 'Apartado' : '' }}:</span>
            <span>{{ formatCurrency(lastTicket.total) }}</span>
          </div>
          <div class="total-row" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance === 0">
            <span>Anticipo Original:</span>
            <span>{{ formatCurrency(lastTicket.original_deposit || 0) }}</span>
          </div>
          <div class="total-row" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance === 0">
            <span>Pago Liquidación:</span>
            <span>{{ formatCurrency(lastTicket.payment_made_today || 0) }}</span>
          </div>
          
          <div class="total-row" v-if="lastTicket.ticket_type === 'layaway' && lastTicket.balance > 0">
            <span>Anticipo Pagado:</span>
            <span>{{ formatCurrency(lastTicket.received_amount) }}</span>
          </div>
          
          <div class="total-row font-bold" v-if="lastTicket.ticket_type === 'layaway'" style="font-size: 12px; margin-top: 2px;">
            <span>RESTA POR PAGAR:</span>
            <span>{{ formatCurrency(lastTicket.balance) }}</span>
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
  EditIcon,
  CreditCardIcon,
  BanknoteIcon,
  ReceiptIcon,
  LockIcon,
  ArrowRightLeftIcon,
  CalendarIcon,
  RefreshCcwIcon,
  RotateCcwIcon, // For the exchange button
  QrCodeIcon
} from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import ExchangeTicketModal from '~/components/pos/ExchangeTicketModal.vue'
import PayLayawayModal from '~/components/pos/PayLayawayModal.vue'

const { user } = useAuth()
const barcodeInput = ref(null)
const barcodeQuery = ref('')
const loading = ref(false)
const paymentMethod = ref('cash')
const currentCustomer = ref('Venta Directa / Mostrador')
const lastTicket = ref(null)
const showExchangeModal = ref(false)

// Estado Liquidar Apartado Escaneado
const showPayLayawayModal = ref(false)
const scannedLayawayTicket = ref(null)
const loadingLayaway = ref(false)

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

// — Sistema de Alertas POS —
const posAlert = ref({ message: '', type: 'error' })
const showPosAlert = (message, type = 'error') => {
  posAlert.value = { message, type }
  // Auto-hide success or specific info messages after 4 seconds to not block view forever
  if (type === 'success') {
    setTimeout(() => { if (posAlert.value.message === message) posAlert.value.message = '' }, 4000)
  }
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

const paymentMethodName = computed(() => {
  if (paymentMethod.value === 'cash') return 'Efectivo'
  if (paymentMethod.value === 'card') return 'Tarjeta'
  if (paymentMethod.value === 'transfer') return 'Transferencia'
  return paymentMethod.value
})

// — Helpers —
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

// — Actions —
onMounted(() => barcodeInput.value?.focus())

const onBarcodeSubmit = async () => {
  if (!barcodeQuery.value.trim()) return
  
  // Normalizar el query: Escáneres configurados en inglés sobre un OS en español 
  // escriben un apóstrofe (') en lugar de un guión medio (-).
  let query = barcodeQuery.value.trim().replace(/'/g, '-')
  
  barcodeQuery.value = ''
  posAlert.value.message = '' // Limpiar alertas anteriores

  try {
    const config = useRuntimeConfig()
    const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const token = useCookie('auth_token').value

    // LÓGICA DE ESCANEO DE TICKETS (LIQUIDACIÓN DE APARTADO)
    if (query.toUpperCase().startsWith('TKT-')) {
       const ticketResponse = await $fetch(`${backendURL}/api/tickets/by-number/${query.toUpperCase()}`, {
         headers: { Authorization: `Bearer ${token}` }
       }).catch(() => null)

       if (!ticketResponse || !ticketResponse.data) {
           showPosAlert(`Ticket Invalido: No se localizó un apartado con el folio "${query}".`, 'error')
           return
       }

       const scannedTicket = ticketResponse.data
       if (scannedTicket.ticket_type !== 'layaway' || scannedTicket.balance <= 0) {
           showPosAlert(`El ticket ${query} no es un apartado pendiente o ya fue liquidado totalmente.`, 'error')
           return
       }

       // Abrir el modal en lugar de preguntar directamente
       scannedLayawayTicket.value = scannedTicket
       showPayLayawayModal.value = true
       
       return
    }

    const response = await $fetch(`${backendURL}/api/stock-products`, {
      params: { search: query },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Laravel's successResponse wraps the paginated resource in response.data.data
    const productsArray = Array.isArray(response.data) ? response.data : (response.data?.data || [])

    if (productsArray && productsArray.length > 0) {
      // Find exact match just in case
      let product = productsArray.find(p => p.barcode === query)
      if (!product) {
        product = productsArray[0] // fallback if exact barcode not matched, e.g. search matched name
      }
      
      if (product.quantity <= 0) {
         showPosAlert(`Inventario Totalmente Agotado: El producto "${product.name}" no tiene piezas disponibles para venta.`, 'error')
         return
      }

      // El catálogo de BD puede tener null en algunos casos si no se le configuró precio
      const precioVenta = parseFloat(product.sale_price) || 0

      // Add simple mapping for component
      const productToAdd = {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        size: product.size ? product.size.name : '',
        color: product.color ? product.color.name : '',
        sale_price: precioVenta,
        discount_type: product.discount_type || 'percentage',
        discount_percentage: parseFloat(product.discount_percentage) || 0,
        discount_amount: parseFloat(product.discount_amount) || 0,
        quantity: parseFloat(product.quantity) || 0,
        image_url: product.image_url,
        qty: 1
      }

      addToCart(productToAdd)
      
      // Mostrar alerta especial si el precio leído de base de datos es $0
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
  posAlert.value.message = ''
  const existing = cartItems.value.find(i => i.id === product.id)
  
  if (existing) {
    if (existing.qty < existing.quantity) {
       existing.qty++
    } else {
       showPosAlert(`Límite Alcanzado: No puedes agregar más. Solo tienes disponible una existencia máxima de ${existing.quantity} unidad(es) de este producto físicamente en inventario.`, 'error')
    }
  } else {
    cartItems.value.unshift({ ...product, qty: 1 })
  }
}

const removeFromCart = (index) => cartItems.value.splice(index, 1)

const updateQty = (index, delta) => {
  posAlert.value.message = ''
  const item = cartItems.value[index]
  const newQty = item.qty + delta
  
  // Si es una devolución (cantidad negativa), dejamos que baje hasta -999 o suba hasta -1
  if (item.qty < 0) {
      if (newQty > -1) {
          removeFromCart(index)
          return
      }
      item.qty = newQty
      return
  }

  if (newQty < 1) { 
     removeFromCart(index)
     return 
  }
  
  if (newQty > item.quantity) { 
     showPosAlert(`Límite Alcanzado: No puedes incrementar más. Tu sistema indica que en almacén solo te quedan ${item.quantity} pieza(s) físicamente.`, 'error')
     return 
  }
  item.qty = newQty
}

const clearCart = () => {
  if (cartItems.value.length === 0) return
  if (confirm('¿Estás seguro de que deseas vaciar completamente la mesa y cancelar esta venta?')) {
     cartItems.value = []
     posAlert.value.message = ''
  }
}

const onCheckout = async () => {
  if (!cartItems.value.length) return
  loading.value = true
  
  try {
    const config = useRuntimeConfig()
    const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const token = useCookie('auth_token').value

    const payload = {
        client_id: null,
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
    console.log('PAYLOAD:', payload);

    const response = await $fetch(`${backendURL}/api/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: payload
    })

    // Preparar el ticket para impresion
    lastTicket.value = { 
      ...response.data, 
      items: [...cartItems.value], 
      total: total.value 
    }
    
    // Disparar impresion termica
    setTimeout(() => {
        window.print()
        cartItems.value = []
        lastTicket.value = null
        isLayaway.value = false
        customerName.value = ''
        layawayDeposit.value = 0
        layawayDueDate.value = ''
        loading.value = false
        showPosAlert('¡Operación completada y ticket generado exitosamente!', 'success')
        barcodeInput.value?.focus()
    }, 300)

  } catch (error) {
     console.error('Checkout error:', error)
     showPosAlert(error.data?.message || 'Hubo un error de validación al generar o procesar la venta en la Base de Datos.', 'error')
     loading.value = false
  }
}

const onExchange = () => {
  // TODO: Open exchange modal or redirect to exchange flow
  showPosAlert('La interfaz gráfica para devoluciones / cambios aún se está construyendo.', 'error')
}

const handleLayawayPayment = async (ticket) => {
    loadingLayaway.value = true
    const config = useRuntimeConfig()
    const backendURL = config.public.apiBaseUrl || 'http://127.0.0.1:8000'
    const token = useCookie('auth_token').value

    try {
        const response = await $fetch(`${backendURL}/api/tickets/${ticket.id}/complete-layaway`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
        
        showPayLayawayModal.value = false
        
        // Mapear los items devueltos por la API (anidados) al formato plano que espera la plantilla del ticket
        const mappedItems = response.data.items.map(detail => ({
            id: detail.id,
            product: detail.product,
            name: detail.product?.name,
            size: detail.product?.size?.name || '',
            color: detail.product?.color?.name || '',
            sale_price: detail.unit_price,
            discount_type: detail.product?.discount_type || 'percentage',
            discount_percentage: detail.product?.discount_percentage || 0,
            discount_amount: detail.product?.discount_amount || 0,
            quantity: detail.quantity,
            qty: detail.quantity,
            total: detail.total
        }))

        // Configurar el ticket pagado para imprimir el comprobante de liquidación
        // Inyectamos el historial de sumas que teníamos guardado en el ticket escaneado original antes de liquidar
        lastTicket.value = {
            ...response.data,
            items: mappedItems,
            original_deposit: ticket.received_amount,
            payment_made_today: ticket.balance
        }
        
        setTimeout(() => {
            window.print()
            lastTicket.value = null
            showPosAlert('Apartado liquidado y comprobante de entrega impreso con éxito.', 'success')
            barcodeInput.value?.focus()
        }, 300)
        
    } catch (err) {
        console.error(err)
        showPosAlert(err.data?.message || 'Error al completar e intentar liquidar el apartado.', 'error')
        loadingLayaway.value = false
        barcodeInput.value?.focus()
    }
}
</script>

<style scoped>
.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.dark .glass-panel {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

/* Row transition */
.row-enter-active, .row-leave-active { transition: all 0.35s ease; }
.row-enter-from { opacity: 0; transform: translateY(-12px); }
.row-leave-to  { opacity: 0; transform: translateX(20px); }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 10px; }

/* --------------------------------- */
/* Estilos para Recibo (Ticket 58mm) */
/* --------------------------------- */
@media print {
  body > *:not(#pos-print-area) {
    display: none !important;
  }
  
  @page {
    /* Tickets de 58mm, sin margenes de sistema */
    margin: 0;
    size: 58mm auto;
  }

  body {
    background: white;
    margin: 0;
    padding: 0;
  }

  #pos-print-area {
    display: block !important;
    width: 48mm !important; 
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding: 0 !important;
    background: white !important;
    color: #000 !important;
    font-family: 'Arial', sans-serif !important;
  }

  .pos-ticket {
    width: 100%;
    font-size: 11px; /* Subimos un punto */
    line-height: 1.2;
    padding-left: 2mm; /* Margen de seguridad izquierdo para que no se moche */
    padding-right: 2mm; 
    box-sizing: border-box;
    color: #000 !important;
    font-weight: 700; /* Forzamos negritas en todo para que no sea borroso */
  }

  .ticket-header {
    text-align: center;
    margin-bottom: 6px;
    width: 100%;
  }

  .ticket-header .company-name {
    font-size: 14px; 
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    text-align: center;
  }

  .ticket-header .company-info {
    margin: 0;
    font-size: 9px;
    font-weight: 700; /* Igualamos el grosor al de los productos */
    text-align: center;
  }

  .ticket-number {
    font-weight: 900;
    font-size: 10px;
  }

  .ticket-divider {
    border-top: 1px dashed #000;
    margin: 3px 0;
  }

  .ticket-items {
    width: 100%;
    table-layout: fixed; /* Forzamos anchos fijos */
    border-collapse: collapse;
    margin-bottom: 4px;
    font-size: 9px;
  }

  .ticket-items th {
    text-align: left;
    border-bottom: 1px solid #000;
    padding-bottom: 1px;
    font-weight: 900;
  }

  .ticket-items td {
    vertical-align: top;
    padding: 2px 0;
    overflow: hidden;
    word-break: break-all;
  }

  .qty-col { width: 12%; text-align: center; }
  .desc-col { width: 53%; padding-right: 1px; }
  .price-col { width: 35%; text-align: right; }

  .item-meta {
    font-size: 8px;
    font-weight: 400;
    display: block;
  }

  .ticket-totals {
    width: 100%;
    margin-bottom: 6px;
  }

  .ticket-totals .total-row {
    display: flex;
    justify-content: space-between;
    padding: 1px 0;
    font-size: 10px;
  }

  .ticket-totals .font-bold {
    font-weight: 900;
    font-size: 12px;
    border-top: 1px solid #000;
    padding-top: 1px;
    margin-top: 1px;
  }

  .ticket-footer {
    text-align: center;
    font-size: 9px;
    margin-top: 6px;
  }

  .ticket-footer p {
    margin: 0;
    font-weight: 600;
  }

  .thank-you {
    font-weight: 900;
    font-size: 11px;
    margin-top: 4px !important;
  }
}
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}
.qr-container canvas {
  margin-bottom: 4px;
}
.ticket-num {
  font-size: 8px;
  font-weight: bold;
}
</style>
