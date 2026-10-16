import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Alert,
  StyleSheet,
  Share,
  Image,
} from 'react-native';

const logoHorizontal = require('../../assets/images/BizTrackGrowthLogoHorizontal.png');
import { SafeAreaView } from 'react-native-safe-area-context';
import type {
  BusinessSettings,
  Order,
  Transaction,
  WeeklyStats,
  TransactionType,
  Currency,
} from '../types/biztrack.types';
import { biztrackStorage, getInitialData } from '../services/biztrackStorage';
import {
  IconOrders,
  IconQty,
  IconDelivered,
  IconLocation,
  IconCustomer,
  IconPhone,
  IconMoney,
  IconSettings,
  IconHome,
  IconMaps,
} from '../components/AppIcons';
import SplashScreen from '../components/SplashScreen';

type Tab = 'home' | 'orders' | 'money' | 'settings';

export default function BizTrackMobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [settings, setSettings] = useState<BusinessSettings>(() => getInitialData().settings);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WeeklyStats>(() => ({
    weekOrdersCount: 0,
    requestedQty: 0,
    deliveredOrdersCount: 0,
    pendingLocationsCount: 0,
    nextOrder: null,
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
  }));
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Order modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formCustomer, setFormCustomer] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('income');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Orders search & filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'delivered'>('all');

  // Settings form state
  const [settingsName, setSettingsName] = useState('');
  const [settingsBatch, setSettingsBatch] = useState('');
  const [settingsCurrency, setSettingsCurrency] = useState<Currency>('LKR');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const startTime = Date.now();
      const [s, o, t, st] = await Promise.all([
        biztrackStorage.getSettings(),
        biztrackStorage.getOrders(),
        biztrackStorage.getTransactions(),
        biztrackStorage.getStats(),
      ]);
      setSettings(s);
      setSettingsName(s.businessName);
      setSettingsBatch(s.nextBatch);
      setSettingsCurrency(s.currency);
      setOrders(o);
      setTransactions(t);
      setStats(st);

      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 700 - elapsed);
      setTimeout(() => setIsLoading(false), delay);
    } catch {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshStats = useCallback(async () => {
    const st = await biztrackStorage.getStats();
    setStats(st);
  }, []);

  // Format currency
  const fmt = useCallback(
    (n: number) => {
      const cur = settings.currency || 'LKR';
      return `${cur} ${Number(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [settings.currency]
  );

  const formatDate = (d: string) => {
    if (!d) return 'Not set';
    const [y, m, day] = d.split('-').map(Number);
    if (!y || !m || !day) return d;
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatWeekday = (d: string) => {
    if (!d) return '';
    const [y, m, day] = d.split('-').map(Number);
    if (!y || !m || !day) return '';
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { weekday: 'long' });
  };

  // Order Handlers
  const openNewOrder = () => {
    setEditingOrder(null);
    setFormCustomer('');
    setFormPhone('');
    setFormAddress('');
    setFormQuantity('1');
    setFormDate(new Date().toISOString().split('T')[0]);
    setOrderModalOpen(true);
  };

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormCustomer(order.customer);
    setFormPhone(order.phone);
    setFormAddress(order.address);
    setFormQuantity(String(order.quantity));
    setFormDate(order.date);
    setOrderModalOpen(true);
  };

  const saveOrder = async () => {
    if (!formCustomer.trim() || !formPhone.trim() || !formAddress.trim()) {
      Alert.alert('Required', 'Please fill customer, phone, and address');
      return;
    }
    const q = parseInt(formQuantity, 10);
    if (isNaN(q) || q < 1) {
      Alert.alert('Invalid', 'Quantity must be at least 1');
      return;
    }

    try {
      if (editingOrder) {
        const updated = await biztrackStorage.updateOrder(editingOrder.id, {
          customer: formCustomer.trim(),
          phone: formPhone.trim(),
          address: formAddress.trim(),
          quantity: q,
          date: formDate,
        });
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast('Order updated');
      } else {
        const created = await biztrackStorage.createOrder({
          customer: formCustomer.trim(),
          phone: formPhone.trim(),
          address: formAddress.trim(),
          quantity: q,
          date: formDate,
          status: 'pending',
        });
        setOrders((prev) => [created, ...prev]);
        showToast('Order added');
      }
      setOrderModalOpen(false);
      await refreshStats();
    } catch {
      showToast('Error saving order');
    }
  };

  const toggleOrderStatus = async (order: Order) => {
    try {
      const updated = await biztrackStorage.toggleOrderStatus(order.id);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(
        updated.status === 'delivered' ? '✓ Marked Delivered' : 'Marked Pending'
      );
      await refreshStats();
    } catch {
      showToast('Error updating status');
    }
  };

  const deleteOrder = async (order: Order) => {
    Alert.alert('Delete Order', `Delete order for ${order.customer}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await biztrackStorage.deleteOrder(order.id);
          setOrders((prev) => prev.filter((o) => o.id !== order.id));
          showToast('Order deleted');
          await refreshStats();
        },
      },
    ]);
  };

  // Transaction Handlers
  const openTransaction = (type: TransactionType) => {
    setTxType(type);
    setTxDesc('');
    setTxAmount('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxModalOpen(true);
  };

  const saveTransaction = async () => {
    const val = parseFloat(txAmount);
    if (!txDesc.trim() || isNaN(val) || val <= 0) {
      Alert.alert('Invalid', 'Please enter a description and valid amount');
      return;
    }

    try {
      const created = await biztrackStorage.createTransaction({
        type: txType,
        description: txDesc.trim(),
        amount: val,
        date: txDate,
      });
      setTransactions((prev) => [created, ...prev]);
      setTxModalOpen(false);
      showToast(txType === 'income' ? 'Income saved' : 'Expense saved');
      await refreshStats();
    } catch {
      showToast('Error saving transaction');
    }
  };

  const deleteTransaction = async (tx: Transaction) => {
    Alert.alert('Delete Transaction', `Delete "${tx.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await biztrackStorage.deleteTransaction(tx.id);
          setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
          showToast('Transaction deleted');
          await refreshStats();
        },
      },
    ]);
  };

  // Settings Handlers
  const saveSettings = async () => {
    try {
      const updated = await biztrackStorage.updateSettings({
        businessName: settingsName.trim(),
        nextBatch: settingsBatch,
        currency: settingsCurrency,
      });
      setSettings(updated);
      showToast('Settings saved');
    } catch {
      showToast('Error saving settings');
    }
  };

  const exportBackup = async () => {
    try {
      const data = {
        settings,
        orders,
        transactions,
        exportedAt: new Date().toISOString(),
      };
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: `biz-track-backup-${new Date().toISOString().split('T')[0]}.json`,
      });
    } catch {}
  };

  const resetAllData = async () => {
    Alert.alert(
      'Delete All App Data',
      'This permanently clears your saved orders and transactions. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await biztrackStorage.resetAll();
            await loadData();
            showToast('App data reset');
          },
        },
      ]
    );
  };

  // Pending orders sorted
  const pendingOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'delivered')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [orders]
  );
  const nextOrder = pendingOrders.length > 0 ? pendingOrders[0] : null;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (orderFilter === 'pending' && o.status === 'delivered') return false;
        if (orderFilter === 'delivered' && o.status !== 'delivered') return false;
        if (!q) return true;
        return (
          o.customer.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, orderFilter, orderSearch]);

  // Financial totals
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const t of transactions) {
      if (t.type === 'income') inc += Number(t.amount) || 0;
      else if (t.type === 'expense') exp += Number(t.amount) || 0;
    }
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
    };
  }, [transactions]);

  // Render an order card
  const renderOrderCard = (o: Order, compact = false) => {
    const isDone = o.status === 'delivered';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      o.address
    )}`;

    return (
      <View key={o.id} style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardHeadTitle} numberOfLines={1}>
            {o.customer}
          </Text>
          <View style={[styles.tag, isDone && styles.tagDone]}>
            <Text style={[styles.tagText, isDone && styles.tagDoneText]}>
              {isDone ? 'Delivered' : 'Pending'} · #{o.id.slice(-5)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <IconQty size={15} />
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{o.quantity} items</Text>
          </View>

          <View style={styles.detailRow}>
            <IconCustomer size={15} />
            <Text style={styles.detailLabel}>Customer</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {o.customer}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <IconPhone size={15} />
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{o.phone}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <IconLocation size={15} />
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {o.address}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
              onPress={() => Linking.openURL(mapsUrl)}
            >
              <IconMaps size={14} />
              <Text style={styles.btnSecondaryText}>Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnMuted, { flex: 1 }]}
              onPress={() => Linking.openURL(`tel:${encodeURIComponent(o.phone)}`)}
            >
              <IconPhone size={14} />
              <Text style={styles.btnMutedText}>Call</Text>
            </TouchableOpacity>
          </View>

          {!compact && (
            <View style={[styles.actionRow, { marginTop: 8 }]}>
              <TouchableOpacity
                style={[styles.btn, isDone ? styles.btnMuted : styles.btnPrimary, { flex: 1.4 }]}
                onPress={() => toggleOrderStatus(o)}
              >
                <Text style={isDone ? styles.btnMutedText : styles.btnPrimaryText}>
                  {isDone ? 'Mark Pending' : '✓ Mark Delivered'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary, { flex: 0.8 }]}
                onPress={() => openEditOrder(o)}
              >
                <Text style={styles.btnSecondaryText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnDanger, { flex: 0.8 }]}
                onPress={() => deleteOrder(o)}
              >
                <Text style={styles.btnDangerText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Image
            source={logoHorizontal}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {settings.businessName ? (
            <Text style={styles.brandCaption} numberOfLines={1}>
              {settings.businessName}
            </Text>
          ) : null}
        </View>

        <View style={styles.batchBox}>
          <Text style={styles.batchSmall}>Next delivery batch</Text>
          <Text style={styles.batchStrong}>{formatDate(settings.nextBatch)}</Text>
          <Text style={styles.batchEm}>{formatWeekday(settings.nextBatch)}</Text>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- TAB: HOME --- */}
        {activeTab === 'home' && (
          <View>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionHeading}>Weekly Overview</Text>
              <Text style={styles.sectionSubtitle}>This week</Text>
            </View>

            {/* 4 Stat Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHead}>
                  <View style={styles.statIcon}>
                    <IconOrders size={18} />
                  </View>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
                <Text style={styles.statStrong}>{stats.weekOrdersCount}</Text>
                <Text style={styles.statHelp}>This week so far</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHead}>
                  <View style={styles.statIcon}>
                    <IconQty size={18} />
                  </View>
                  <Text style={styles.statLabel}>Requested Qty.</Text>
                </View>
                <Text style={styles.statStrong}>{stats.requestedQty}</Text>
                <Text style={styles.statHelp}>Items requested</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHead}>
                  <View style={styles.statIcon}>
                    <IconDelivered size={18} />
                  </View>
                  <Text style={styles.statLabel}>Delivered</Text>
                </View>
                <Text style={styles.statStrong}>{stats.deliveredOrdersCount}</Text>
                <Text style={styles.statHelp}>This week</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHead}>
                  <View style={styles.statIcon}>
                    <IconLocation size={18} />
                  </View>
                  <Text style={styles.statLabel}>Locations</Text>
                </View>
                <Text style={styles.statStrong}>{stats.pendingLocationsCount}</Text>
                <Text style={styles.statHelp}>Pending stops</Text>
              </View>
            </View>

            {/* Next Order */}
            <View style={[styles.sectionTitle, { marginTop: 8 }]}>
              <Text style={styles.sectionHeading}>Next Order</Text>
              <Text style={styles.sectionSubtitle}>Delivery queue</Text>
            </View>

            {nextOrder ? (
              renderOrderCard(nextOrder, true)
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No pending orders. Add an order to get started.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* --- TAB: ORDERS --- */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.pageHeaderRow}>
              <View>
                <Text style={styles.pageTitle}>Orders</Text>
                <Text style={styles.subtext}>Manage customers and deliveries</Text>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={openNewOrder}>
                <Text style={styles.btnPrimaryText}>+ Add Order</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, phone or address"
              placeholderTextColor="#8a99b0"
              value={orderSearch}
              onChangeText={setOrderSearch}
            />

            {/* Filter Chips */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.chip, orderFilter === 'all' && styles.chipActive]}
                onPress={() => setOrderFilter('all')}
              >
                <Text
                  style={[styles.chipText, orderFilter === 'all' && styles.chipActiveText]}
                >
                  All ({orders.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, orderFilter === 'pending' && styles.chipActive]}
                onPress={() => setOrderFilter('pending')}
              >
                <Text
                  style={[
                    styles.chipText,
                    orderFilter === 'pending' && styles.chipActiveText,
                  ]}
                >
                  Pending ({pendingOrders.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, orderFilter === 'delivered' && styles.chipActive]}
                onPress={() => setOrderFilter('delivered')}
              >
                <Text
                  style={[
                    styles.chipText,
                    orderFilter === 'delivered' && styles.chipActiveText,
                  ]}
                >
                  Delivered ({orders.filter((o) => o.status === 'delivered').length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => renderOrderCard(o, false))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No matching orders found.</Text>
              </View>
            )}
          </View>
        )}

        {/* --- TAB: MONEY --- */}
        {activeTab === 'money' && (
          <View>
            <View style={styles.pageHeaderRow}>
              <View>
                <Text style={styles.pageTitle}>Money Transactions</Text>
                <Text style={styles.subtext}>Keep track of your business finances</Text>
              </View>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceSmall}>Account Balance</Text>
              <Text style={styles.balanceStrong}>{fmt(balance)}</Text>
            </View>

            {/* Money Split Tiles */}
            <View style={styles.moneySplitRow}>
              <View style={styles.moneyTile}>
                <Text style={styles.moneyTileSmall}>Total Income</Text>
                <Text style={styles.moneyTileStrong}>{fmt(totalIncome)}</Text>
              </View>
              <View style={styles.moneyTile}>
                <Text style={styles.moneyTileSmall}>Total Expenses</Text>
                <Text style={styles.moneyTileStrong}>{fmt(totalExpense)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                onPress={() => openTransaction('income')}
              >
                <Text style={styles.btnPrimaryText}>+ Add Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
                onPress={() => openTransaction('expense')}
              >
                <Text style={styles.btnSecondaryText}>− Add Expense</Text>
              </TouchableOpacity>
            </View>

            {/* Transactions History */}
            <View style={[styles.sectionTitle, { marginTop: 22 }]}>
              <Text style={styles.sectionHeading}>Transaction History</Text>
              <Text style={styles.sectionSubtitle}>{transactions.length} entries</Text>
            </View>

            {transactions.length > 0 ? (
              <View style={styles.transactionsCard}>
                {transactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  return (
                    <View key={tx.id} style={styles.transactionItem}>
                      <View style={styles.txIcon}>
                        <IconMoney size={20} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <Text style={styles.txDesc} numberOfLines={1}>
                          {tx.description}
                        </Text>
                        <Text style={styles.txSub}>
                          {formatDate(tx.date)} · {isInc ? 'Income' : 'Expense'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.txAmount}>
                          {isInc ? '+' : '−'}
                          {fmt(tx.amount)}
                        </Text>
                        <TouchableOpacity onPress={() => deleteTransaction(tx)}>
                          <Text style={styles.txDeleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No transactions yet. Add income or an expense to get started.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* --- TAB: SETTINGS --- */}
        {activeTab === 'settings' && (
          <View>
            <View style={styles.pageHeaderRow}>
              <View>
                <Text style={styles.pageTitle}>Settings</Text>
                <Text style={styles.subtext}>Customize Biz Track</Text>
              </View>
            </View>

            {/* Business Preferences */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Business Preferences</Text>

              <Text style={styles.fieldLabel}>Business name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="My Business"
                placeholderTextColor="#8a99b0"
                maxLength={60}
                value={settingsName}
                onChangeText={setSettingsName}
              />

              <Text style={styles.fieldLabel}>Next batch date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8a99b0"
                value={settingsBatch}
                onChangeText={setSettingsBatch}
              />

              <Text style={styles.fieldLabel}>Currency</Text>
              <View style={styles.currencyRow}>
                {(['LKR', 'USD', 'INR', 'EUR'] as Currency[]).map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    style={[
                      styles.currencyBtn,
                      settingsCurrency === cur && styles.currencyBtnActive,
                    ]}
                    onPress={() => setSettingsCurrency(cur)}
                  >
                    <Text
                      style={[
                        styles.currencyBtnText,
                        settingsCurrency === cur && styles.currencyBtnTextActive,
                      ]}
                    >
                      {cur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, { marginTop: 14 }]}
                onPress={saveSettings}
              >
                <Text style={styles.btnPrimaryText}>Save Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Backup & Data */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Backup & Data</Text>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={exportBackup}
              >
                <Text style={styles.btnSecondaryText}>Share Data Backup (JSON)</Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                Orders, transactions and settings are saved locally and synced with backend.
              </Text>
            </View>

            {/* Danger Zone */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Danger Zone</Text>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={resetAllData}
              >
                <Text style={styles.btnDangerText}>Delete All App Data</Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                This permanently clears saved orders and transactions.
              </Text>
            </View>

            <Text style={[styles.helpText, { textAlign: 'center', marginTop: 10 }]}>
              Biz Track · General business management
            </Text>
          </View>
        )}
      </ScrollView>

      {/* --- Bottom Navigation Bar --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <IconHome size={20} />
          <Text
            style={[styles.navText, activeTab === 'home' && styles.navTextActive]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'orders' && styles.navItemActive]}
          onPress={() => setActiveTab('orders')}
        >
          <IconOrders size={20} />
          <Text
            style={[styles.navText, activeTab === 'orders' && styles.navTextActive]}
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'money' && styles.navItemActive]}
          onPress={() => setActiveTab('money')}
        >
          <IconMoney size={20} />
          <Text
            style={[styles.navText, activeTab === 'money' && styles.navTextActive]}
          >
            Money
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
          onPress={() => setActiveTab('settings')}
        >
          <IconSettings size={20} />
          <Text
            style={[
              styles.navText,
              activeTab === 'settings' && styles.navTextActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Order Dialog Modal --- */}
      <Modal visible={orderModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingOrder ? 'Edit Order' : 'Add Order'}
              </Text>
              <TouchableOpacity
                onPress={() => setOrderModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.fieldLabel}>Customer name</Text>
              <TextInput
                style={styles.inputField}
                value={formCustomer}
                onChangeText={setFormCustomer}
                placeholder="Customer name"
                placeholderTextColor="#8a99b0"
              />

              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput
                style={styles.inputField}
                keyboardType="phone-pad"
                value={formPhone}
                onChangeText={setFormPhone}
                placeholder="077 123 4567"
                placeholderTextColor="#8a99b0"
              />

              <Text style={styles.fieldLabel}>Delivery address</Text>
              <TextInput
                style={[styles.inputField, { height: 60, textAlignVertical: 'top' }]}
                multiline
                value={formAddress}
                onChangeText={setFormAddress}
                placeholder="45 Galle Road, Colombo 03"
                placeholderTextColor="#8a99b0"
              />

              <Text style={styles.fieldLabel}>Quantity (items)</Text>
              <TextInput
                style={styles.inputField}
                keyboardType="numeric"
                value={formQuantity}
                onChangeText={setFormQuantity}
                placeholder="1"
                placeholderTextColor="#8a99b0"
              />

              <Text style={styles.fieldLabel}>Order date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.inputField}
                value={formDate}
                onChangeText={setFormDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8a99b0"
              />

              <View style={[styles.actionRow, { marginTop: 14, marginBottom: 10 }]}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
                  onPress={() => setOrderModalOpen(false)}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                  onPress={saveOrder}
                >
                  <Text style={styles.btnPrimaryText}>Save Order</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Transaction Dialog Modal --- */}
      <Modal visible={txModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {txType === 'income' ? 'Add Income' : 'Add Expense'}
              </Text>
              <TouchableOpacity
                onPress={() => setTxModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.inputField}
                value={txDesc}
                onChangeText={setTxDesc}
                placeholder={
                  txType === 'income' ? 'e.g. Sold 5 shirts' : 'e.g. Packing boxes'
                }
                placeholderTextColor="#8a99b0"
              />

              <Text style={styles.fieldLabel}>Amount ({settings.currency})</Text>
              <TextInput
                style={styles.inputField}
                keyboardType="numeric"
                value={txAmount}
                onChangeText={setTxAmount}
                placeholder="0.00"
                placeholderTextColor="#8a99b0"
              />

              <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.inputField}
                value={txDate}
                onChangeText={setTxDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8a99b0"
              />

              <View style={[styles.actionRow, { marginTop: 14 }]}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
                  onPress={() => setTxModalOpen(false)}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    txType === 'income' ? styles.btnPrimary : styles.btnDanger,
                    { flex: 1 },
                  ]}
                  onPress={saveTransaction}
                >
                  <Text
                    style={
                      txType === 'income'
                        ? styles.btnPrimaryText
                        : styles.btnDangerText
                    }
                  >
                    Save {txType === 'income' ? 'Income' : 'Expense'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toastMsg && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#edf5ff',
    backgroundColor: '#ffffff',
  },
  brandRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  logoImage: {
    width: 135,
    height: 42,
  },
  brandCaption: {
    fontSize: 10,
    color: '#71829e',
    marginTop: 2,
    fontWeight: '500',
  },
  batchBox: {
    backgroundColor: '#f2f7ff',
    borderWidth: 1,
    borderColor: '#d5e6ff',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  batchSmall: {
    fontSize: 9,
    color: '#6a80a0',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  batchStrong: {
    fontSize: 11,
    fontWeight: '700',
    color: '#153765',
    marginTop: 2,
  },
  batchEm: {
    fontSize: 9,
    color: '#1769e8',
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#f6f9fe',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#153765',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#71829e',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 16,
    padding: 12,
    minHeight: 112,
    justifyContent: 'space-between',
  },
  statHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#edf5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#445873',
    flex: 1,
  },
  statStrong: {
    fontSize: 26,
    fontWeight: '800',
    color: '#153765',
    lineHeight: 30,
  },
  statHelp: {
    fontSize: 9.5,
    color: '#71829e',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#f2f7ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5effc',
  },
  cardHeadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#153765',
    flex: 1,
    marginRight: 8,
  },
  tag: {
    backgroundColor: '#e2efff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagDone: {
    backgroundColor: '#edf2fa',
  },
  tagText: {
    color: '#1769e8',
    fontSize: 10,
    fontWeight: '700',
  },
  tagDoneText: {
    color: '#4a6a93',
  },
  cardBody: {
    padding: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f9',
  },
  detailLabel: {
    fontSize: 11.5,
    color: '#71829e',
    flex: 1,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#153765',
    maxWidth: '65%',
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  btn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: '#1769e8',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1769e8',
  },
  btnSecondaryText: {
    color: '#1769e8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  btnMuted: {
    backgroundColor: '#f6f9fe',
    borderWidth: 1,
    borderColor: '#dbe9fa',
  },
  btnMutedText: {
    color: '#153765',
    fontSize: 11.5,
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: '#fff8f9',
    borderWidth: 1,
    borderColor: '#f4d2d8',
  },
  btnDangerText: {
    color: '#c74855',
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#71829e',
    fontSize: 12,
    textAlign: 'center',
  },
  pageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#153765',
  },
  subtext: {
    fontSize: 11,
    color: '#71829e',
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 12,
    color: '#203653',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: '#edf5ff',
    borderColor: '#b9d5ff',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5d7291',
  },
  chipActiveText: {
    color: '#1769e8',
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: '#1769e8',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  balanceSmall: {
    color: '#ffffff',
    opacity: 0.85,
    fontSize: 11,
    fontWeight: '500',
  },
  balanceStrong: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  moneySplitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  moneyTile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 14,
    padding: 12,
  },
  moneyTileSmall: {
    fontSize: 10.5,
    color: '#71829e',
    fontWeight: '600',
  },
  moneyTileStrong: {
    fontSize: 15,
    fontWeight: '700',
    color: '#153765',
    marginTop: 6,
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f9',
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#edf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txDesc: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#153765',
  },
  txSub: {
    fontSize: 10,
    color: '#71829e',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#153765',
  },
  txDeleteText: {
    fontSize: 10,
    color: '#71829e',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#153765',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#526783',
    marginBottom: 6,
    marginTop: 6,
  },
  inputField: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#203653',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  currencyBtn: {
    flex: 1,
    backgroundColor: '#f6f9fe',
    borderWidth: 1,
    borderColor: '#dbe9fa',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  currencyBtnActive: {
    backgroundColor: '#edf5ff',
    borderColor: '#1769e8',
  },
  currencyBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#526783',
  },
  currencyBtnTextActive: {
    color: '#1769e8',
    fontWeight: '700',
  },
  helpText: {
    fontSize: 10.5,
    color: '#71829e',
    lineHeight: 15,
    marginTop: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dbe9fa',
    paddingVertical: 6,
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  navItemActive: {
    backgroundColor: '#f1f7ff',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8a99b0',
    marginTop: 3,
  },
  navTextActive: {
    color: '#1769e8',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#10284478',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dbe9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe9fa',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#153765',
  },
  modalCloseBtn: {
    backgroundColor: '#edf5ff',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#1769e8',
    fontWeight: '700',
    fontSize: 12,
  },
  toast: {
    position: 'absolute',
    bottom: 75,
    alignSelf: 'center',
    backgroundColor: '#163968',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#12375b',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
